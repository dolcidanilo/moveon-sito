<?php
/**
 * Pannello clienti (1.12.0): un'area di gestione separata da WordPress, all'indirizzo /gestione/.
 * Il cliente entra con nome utente e password, vede solo le sue pagine e cambia testi, elenchi, foto e colori
 * delle sezioni MoveOn; vede le richieste arrivate dal modulo. Non vede mai la bacheca di WordPress.
 *
 * Un solo «motore»: i campi si costruiscono da soli dalle definizioni degli elementi (mo_blocks()), quindi ogni
 * nuova sezione del plugin è già modificabile anche dal pannello.
 */

defined( 'ABSPATH' ) || exit;

const MO_PANNELLO_RUOLO = 'mo_cliente';
const MO_PANNELLO_CAP   = 'mo_gestisci_sito';

/* ---------------- Ruolo, indirizzo, accesso ---------------- */

add_action(
	'init',
	function () {
		if ( ! get_role( MO_PANNELLO_RUOLO ) ) {
			add_role( MO_PANNELLO_RUOLO, 'Cliente del sito (pannello MoveOn)', array( 'read' => true, 'upload_files' => true, MO_PANNELLO_CAP => true ) );
		}
		add_rewrite_rule( '^gestione/?$', 'index.php?mo_pannello=1', 'top' );
		$regole = get_option( 'rewrite_rules' );
		if ( is_array( $regole ) && ! isset( $regole['^gestione/?$'] ) && ! get_transient( 'mo_pannello_flush' ) ) {
			set_transient( 'mo_pannello_flush', 1, HOUR_IN_SECONDS );
			flush_rewrite_rules( false );
		}
	}
);
add_filter(
	'query_vars',
	function ( $v ) {
		$v[] = 'mo_pannello';
		return $v;
	}
);

/** Indirizzo del pannello. */
function mo_pannello_url(): string {
	return get_option( 'permalink_structure' ) ? home_url( '/gestione/' ) : add_query_arg( 'mo_pannello', '1', home_url( '/' ) );
}

/** È un cliente del pannello (non un amministratore)? */
function mo_pannello_e_cliente( $user = null ): bool {
	$user = $user ? $user : wp_get_current_user();
	return $user && $user->exists() && in_array( MO_PANNELLO_RUOLO, (array) $user->roles, true ) && ! user_can( $user, 'manage_options' );
}

/** Può usare il pannello? (i clienti e chi amministra il sito) */
function mo_pannello_puo(): bool {
	return is_user_logged_in() && ( current_user_can( MO_PANNELLO_CAP ) || current_user_can( 'manage_options' ) );
}

// I clienti non vedono mai WordPress: niente barra in alto, e dal pannello di WordPress si torna al pannello MoveOn
add_filter( 'show_admin_bar', fn( $mostra ) => mo_pannello_e_cliente() ? false : $mostra );
add_action(
	'admin_init',
	function () {
		if ( mo_pannello_e_cliente() && ! wp_doing_ajax() && 'admin-post.php' !== ( $GLOBALS['pagenow'] ?? '' ) ) {
			wp_safe_redirect( mo_pannello_url() );
			exit;
		}
	}
);
add_filter(
	'login_redirect',
	function ( $to, $req, $user ) {
		return ( $user instanceof WP_User && mo_pannello_e_cliente( $user ) ) ? mo_pannello_url() : $to;
	},
	10,
	3
);

/* ---------------- Dati del cliente ---------------- */

/** Pagine che l'utente può modificare. */
function mo_pannello_pagine( int $uid = 0 ): array {
	$uid  = $uid ? $uid : get_current_user_id();
	$user = get_userdata( $uid );
	if ( $user && user_can( $user, 'manage_options' ) ) {
		$tutte = get_posts( array( 'post_type' => 'page', 'post_status' => array( 'publish', 'private', 'draft' ), 'numberposts' => 200, 'orderby' => 'menu_order title', 'order' => 'ASC' ) );
		return array_values( array_filter( $tutte, fn( $p ) => false !== strpos( (string) $p->post_content, '[mo_' ) ) );
	}
	$ids = array_filter( array_map( 'absint', (array) get_user_meta( $uid, 'mo_pagine', true ) ) );
	if ( ! $ids ) {
		return array();
	}
	return get_posts( array( 'post_type' => 'page', 'post_status' => array( 'publish', 'private', 'draft' ), 'post__in' => $ids, 'orderby' => 'post__in', 'numberposts' => 100 ) );
}

function mo_pannello_puo_pagina( int $id ): bool {
	foreach ( mo_pannello_pagine() as $p ) {
		if ( (int) $p->ID === $id ) {
			return true;
		}
	}
	return false;
}

/** Nome, colore e logo che il cliente vede nel pannello. */
function mo_pannello_marchio( int $uid = 0 ): array {
	$uid = $uid ? $uid : get_current_user_id();
	$m   = get_user_meta( $uid, 'mo_marchio', true );
	$m   = is_array( $m ) ? $m : array();
	$nome = trim( (string) ( $m['nome'] ?? '' ) );
	if ( '' === $nome ) {
		$nome = user_can( $uid, 'manage_options' ) ? wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ) : (string) get_userdata( $uid )->display_name;
	}
	$colore = sanitize_hex_color( (string) ( $m['colore'] ?? '' ) ) ?: '#223ab8';
	$parole = preg_split( '/\s+/', $nome );
	$iniziali = '';
	foreach ( $parole as $w ) {
		if ( mb_strlen( $w ) > 3 && mb_strlen( $iniziali ) < 2 ) {
			$iniziali .= mb_strtoupper( mb_substr( $w, 0, 1 ) );
		}
	}
	$logo = absint( $m['logo'] ?? 0 );
	return array(
		'nome'     => $nome,
		'colore'   => $colore,
		'iniziali' => '' !== $iniziali ? $iniziali : mb_strtoupper( mb_substr( $nome, 0, 1 ) ),
		'logo'     => $logo ? (string) wp_get_attachment_image_url( $logo, 'medium' ) : '',
	);
}

/* ---------------- Sezioni di una pagina ---------------- */

/** Sezioni MoveOn nel contenuto, nell'ordine: [ [chiave, attributi grezzi, posizione, lunghezza] ]. */
function mo_pannello_trova_sezioni( string $c ): array {
	$out = array();
	if ( ! preg_match_all( '/\[mo_([a-z_]+)\b([^\]]*)\]/', $c, $m, PREG_SET_ORDER | PREG_OFFSET_CAPTURE ) ) {
		return $out;
	}
	$blocchi = mo_blocks();
	foreach ( $m as $x ) {
		$k = $x[1][0];
		if ( ! isset( $blocchi[ $k ] ) || 'pausa' === $k ) {
			continue;
		}
		$out[] = array( $k, $x[2][0], $x[0][1], strlen( $x[0][0] ) );
	}
	return $out;
}

/** Campi del pannello per un elemento: solo quelli utili al cliente, con nomi semplici. */
function mo_pannello_campi( string $k ): array {
	$fuori      = array( 'anchor', 'link', 'pulsante_link' );
	$sfondo_ok  = array( 'sfondo_colore', 'sfondo_img', 'sfondo_opacita' );
	$gruppi     = array( 'Testi' => 'Testi', 'Elenchi' => 'Elenchi', 'Immagini' => 'Foto', 'Foto che si apre' => 'Foto', 'Sfondo' => 'Sfondo' );
	$campo      = function ( array $p ) use ( &$campo ) {
		$tipi = array( 'textfield' => 'testo', 'textarea' => 'testo_lungo', 'dropdown' => 'scelta', 'attach_image' => 'foto', 'param_group' => 'elenco', 'colorpicker' => 'colore' );
		$tipo = $tipi[ $p['type'] ] ?? '';
		if ( '' === $tipo ) {
			return null;
		}
		$aiuto = (string) ( $p['description'] ?? '' );
		if ( strlen( $aiuto ) > 160 || false !== strpos( $aiuto, '→' ) || false !== stripos( $aiuto, 'trattino' ) ) {
			$aiuto = '';
		}
		$f = array(
			'nome'      => $p['param_name'],
			'tipo'      => $tipo,
			'etichetta' => preg_replace( '/\s*\((facoltativ[ao]|opzionale)\)\s*$/i', '', (string) $p['heading'] ),
			'aiuto'     => $aiuto,
		);
		if ( 'scelta' === $tipo ) {
			$f['opzioni'] = array();
			foreach ( (array) ( $p['value'] ?? array() ) as $label => $val ) {
				if ( false === stripos( (string) $label, 'precedente' ) ) {
					$f['opzioni'][] = array( 'label' => (string) $label, 'value' => (string) $val );
				}
			}
		}
		if ( 'elenco' === $tipo ) {
			$f['campi'] = array();
			foreach ( (array) ( $p['params'] ?? array() ) as $q ) {
				if ( preg_match( '/(^|_)pos(izione)?$/', (string) $q['param_name'] ) ) {
					continue;
				}
				$sub = $campo( $q );
				if ( $sub ) {
					$f['campi'][] = $sub;
				}
			}
		}
		return $f;
	};
	// Campi che si vedono solo con una certa scelta (così il cliente vede solo quello che serve)
	$dipende = array(
		'hero'      => array( 'fissa_img' => array( 'stile', array( 'fissa' ) ), 'slide' => array( 'stile', array( 'slide' ) ), 'durata' => array( 'stile', array( 'slide' ) ), 'transizione' => array( 'stile', array( 'slide' ) ) ),
		'chi_breve' => array( 'apertura_img' => array( 'apertura', array( 'si' ) ), 'apertura_frase' => array( 'apertura', array( 'si' ) ) ),
	);
	$out = array();
	foreach ( mo_blocks()[ $k ]['params'] ?? array() as $p ) {
		$n = (string) $p['param_name'];
		$g = (string) ( $p['group'] ?? 'Testi' );
		if ( ! isset( $gruppi[ $g ] ) || in_array( $n, $fuori, true ) || preg_match( '/_pos$/', $n ) ) {
			continue;
		}
		if ( 'Sfondo' === $g && ! in_array( $n, $sfondo_ok, true ) ) {
			continue;
		}
		$f = $campo( $p );
		if ( $f ) {
			$f['gruppo'] = $gruppi[ $g ];
			if ( isset( $dipende[ $k ][ $n ] ) ) {
				$f['se'] = array( 'campo' => $dipende[ $k ][ $n ][0], 'valori' => $dipende[ $k ][ $n ][1] );
			}
			$out[] = $f;
		}
	}
	return $out;
}

/** Valori attuali dei campi (quelli scritti nella pagina o, se mancano, quelli di serie). */
function mo_pannello_valori( string $k, string $grezzi, array $campi ): array {
	$a   = shortcode_parse_atts( trim( $grezzi ) );
	$a   = is_array( $a ) ? $a : array();
	$def = mo_block_defaults( $k );
	$out = array();
	foreach ( $campi as $f ) {
		$v = $a[ $f['nome'] ] ?? ( $def[ $f['nome'] ] ?? '' );
		$out[ $f['nome'] ] = mo_pannello_leggi( $f, $v );
	}
	return $out;
}

function mo_pannello_leggi( array $f, $v ) {
	switch ( $f['tipo'] ) {
		case 'elenco':
			$voci = array();
			foreach ( mo_group( $v ) as $voce ) {
				$r = array();
				foreach ( $f['campi'] as $sub ) {
					$r[ $sub['nome'] ] = mo_pannello_leggi( $sub, $voce[ $sub['nome'] ] ?? '' );
				}
				$voci[] = $r;
			}
			return $voci;
		case 'foto':
			$id = absint( $v );
			return array( 'id' => $id, 'url' => $id ? (string) wp_get_attachment_image_url( $id, 'medium_large' ) : '' );
		case 'colore':
			return (string) ( sanitize_hex_color( (string) $v ) ?: '' );
		default:
			return mo_text( $v );
	}
}

/** Valore pulito dal pannello, pronto per lo shortcode. */
function mo_pannello_pulisci( array $f, $v ) {
	switch ( $f['tipo'] ) {
		case 'testo':
			return sanitize_text_field( (string) $v );
		case 'testo_lungo':
			return sanitize_textarea_field( (string) $v );
		case 'scelta':
			$ok = array_column( $f['opzioni'] ?? array(), 'value' );
			return in_array( (string) $v, $ok, true ) ? (string) $v : (string) ( $ok[0] ?? '' );
		case 'foto':
			$id = absint( is_array( $v ) ? ( $v['id'] ?? 0 ) : $v );
			return $id && wp_attachment_is_image( $id ) ? (string) $id : '';
		case 'colore':
			return (string) ( sanitize_hex_color( (string) $v ) ?: '' );
		case 'elenco':
			$voci = array();
			foreach ( array_slice( (array) $v, 0, 40 ) as $voce ) {
				$r = array();
				foreach ( $f['campi'] as $sub ) {
					$r[ $sub['nome'] ] = mo_pannello_pulisci( $sub, is_array( $voce ) ? ( $voce[ $sub['nome'] ] ?? '' ) : '' );
				}
				$voci[] = $r;
			}
			return $voci;
	}
	return '';
}

/** Testo per l'attributo di uno shortcode (come lo scrive WPBakery). */
function mo_pannello_attr( $v ): string {
	if ( is_array( $v ) ) {
		return rawurlencode( wp_json_encode( $v ) );
	}
	return str_replace( array( '"', '[', ']' ), array( '``', '`{`', '`}`' ), (string) $v );
}

/** Sostituisce nello shortcode solo gli attributi cambiati; gli altri restano identici. */
function mo_pannello_aggiorna_shortcode( string $sc, array $nuovi ): string {
	foreach ( $nuovi as $nome => $valore ) {
		$coppia = $nome . '="' . mo_pannello_attr( $valore ) . '"';
		$n      = 0;
		$sc     = (string) preg_replace_callback( '/(?<![\w-])' . preg_quote( $nome, '/' ) . '="[^"]*"/', fn() => $coppia, $sc, 1, $n );
		if ( ! $n ) {
			$sc = rtrim( substr( $sc, 0, -1 ) ) . ' ' . $coppia . ']';
		}
	}
	return $sc;
}

/** Dati di una sezione per il pannello. */
function mo_pannello_sezione( string $k, string $grezzi, int $i ): array {
	$campi = mo_pannello_campi( $k );
	$val   = mo_pannello_valori( $k, $grezzi, $campi );
	$a     = shortcode_parse_atts( trim( $grezzi ) );
	$def   = mo_block_defaults( $k );
	$anc   = mo_anchor( is_array( $a ) && isset( $a['anchor'] ) ? $a['anchor'] : ( $def['anchor'] ?? '' ), $k );
	$riass = '';
	foreach ( array( 'titolo', 'etichetta', 'testo' ) as $c ) {
		if ( ! empty( $val[ $c ] ) && is_string( $val[ $c ] ) ) {
			$riass = $val[ $c ];
			break;
		}
	}
	$nomi = array( 'hero' => 'Copertina', 'intestazione' => 'Intestazione', 'numeri' => 'Numeri', 'punti' => 'Punti di forza', 'passi' => 'Passi', 'elenco' => 'Elenco', 'faq' => 'Domande frequenti', 'recensioni' => 'Recensioni', 'invito' => 'Invito finale', 'contatti' => 'Contatti e modulo', 'chi_breve' => 'Chi siamo', 'chi_siamo' => 'Chi siamo', 'nastro' => 'Nastro di parole', 'garanzie' => 'Garanzie', 'servizi' => 'Servizi', 'situazioni' => 'Consigli', 'carosello' => 'Progetti', 'lavori' => 'Progetti scelti' );
	return array(
		'indice'    => $i,
		'tipo'      => $k,
		'nome'      => $nomi[ $k ] ?? preg_replace( '/^MoveOn · /', '', (string) mo_blocks()[ $k ]['name'] ),
		'etichetta' => is_string( $val['etichetta'] ?? null ) ? $val['etichetta'] : '',
		'riassunto' => wp_html_excerpt( str_replace( "\n", ' ', $riass ), 90, '…' ),
		'ancora'    => $anc,
		'campi'     => $campi,
		'valori'    => $val,
	);
}

/** Salva una sezione: aggiorna lo shortcode nella pagina (WordPress tiene la versione precedente nelle revisioni). */
function mo_pannello_salva( int $pid, int $i, array $valori ) {
	$post = get_post( $pid );
	if ( ! $post ) {
		return new WP_Error( 'mo_pagina', 'Pagina non trovata.' );
	}
	$c    = (string) $post->post_content;
	$tutte = mo_pannello_trova_sezioni( $c );
	if ( ! isset( $tutte[ $i ] ) ) {
		return new WP_Error( 'mo_sezione', 'Sezione non trovata: ricarica la pagina.' );
	}
	list( $k, , $pos, $len ) = $tutte[ $i ];
	$nuovi = array();
	foreach ( mo_pannello_campi( $k ) as $f ) {
		if ( array_key_exists( $f['nome'], $valori ) ) {
			$nuovi[ $f['nome'] ] = mo_pannello_pulisci( $f, $valori[ $f['nome'] ] );
		}
	}
	$sc = mo_pannello_aggiorna_shortcode( substr( $c, $pos, $len ), $nuovi );
	$c  = substr( $c, 0, $pos ) . $sc . substr( $c, $pos + $len );
	kses_remove_filters(); // i valori sono già puliti campo per campo; così i testi restano esattamente come scritti
	$r = wp_update_post( array( 'ID' => $pid, 'post_content' => wp_slash( $c ) ), true );
	kses_init(); // rimette i filtri come prima (solo per chi non può scrivere HTML libero)
	if ( is_wp_error( $r ) ) {
		return $r;
	}
	return mo_pannello_sezione( $k, substr( $sc, strlen( '[mo_' . $k ), -1 ), $i );
}

/** Annulla l'ultima modifica: torna alla versione precedente della pagina. */
function mo_pannello_annulla( int $pid ) {
	$post = get_post( $pid );
	foreach ( wp_get_post_revisions( $pid, array( 'order' => 'DESC', 'orderby' => 'date ID' ) ) as $rev ) {
		if ( $post && $rev->post_content !== $post->post_content ) {
			wp_restore_post_revision( $rev->ID );
			return true;
		}
	}
	return new WP_Error( 'mo_annulla', 'Non ci sono modifiche precedenti da annullare.' );
}

/* ---------------- Richieste dal modulo ---------------- */

/** Le richieste che l'utente può vedere (il cliente: quelle delle sue pagine; la demo: quelle di esempio). */
function mo_pannello_richieste( int $quante = 50 ): array {
	if ( ! defined( 'MO_RICHIESTE' ) ) {
		return array();
	}
	$q = array( 'post_type' => MO_RICHIESTE, 'post_status' => array( 'private', 'publish' ), 'numberposts' => $quante );
	if ( mo_pannello_e_cliente() ) {
		$pagine = wp_list_pluck( mo_pannello_pagine(), 'ID' );
		$quali  = (string) get_user_meta( get_current_user_id(), 'mo_richieste', true );
		if ( 'tutte' !== $quali ) {
			$meta = array( 'relation' => 'OR', array( 'key' => '_mo_pagina', 'value' => $pagine ? array_map( 'strval', $pagine ) : array( '0' ), 'compare' => 'IN' ) );
			if ( 'demo' === $quali ) {
				$meta[] = array( 'key' => '_mo_demo', 'value' => '1' );
			}
			$q['meta_query'] = $meta; // phpcs:ignore WordPress.DB.SlowDBQuery
		}
	}
	$out = array();
	foreach ( get_posts( $q ) as $p ) {
		$out[] = mo_pannello_richiesta( $p );
	}
	return $out;
}

function mo_pannello_richiesta( WP_Post $p ): array {
	$dati = get_post_meta( $p->ID, '_mo_dati', true );
	if ( ! is_array( $dati ) ) {
		$dati = array();
		foreach ( array( 'nome' => 'Nome', 'email' => 'Email', 'telefono' => 'Telefono', 'area' => 'Di cosa ha bisogno' ) as $k => $et ) {
			if ( preg_match( '/^' . preg_quote( $et, '/' ) . ':\s*(.+)$/m', (string) $p->post_content, $m ) ) {
				$dati[ $k ] = trim( $m[1] );
			}
		}
		if ( preg_match( '/Messaggio:\n(.*?)(\n\nConsenso|\z)/s', (string) $p->post_content, $m ) ) {
			$dati['messaggio'] = trim( $m[1] );
		}
	}
	return array(
		'id'        => $p->ID,
		'data'      => get_post_time( 'c', false, $p ),
		'quando'    => wp_date( 'j M Y, H:i', get_post_time( 'U', true, $p ) ),
		'nome'      => (string) ( $dati['nome'] ?? $p->post_title ),
		'email'     => (string) ( $dati['email'] ?? '' ),
		'telefono'  => (string) ( $dati['telefono'] ?? '' ),
		'area'      => (string) ( $dati['area'] ?? '' ),
		'messaggio' => (string) ( $dati['messaggio'] ?? '' ),
		'letta'     => (bool) get_post_meta( $p->ID, '_mo_letta', true ),
	);
}

/* ---------------- API del pannello ---------------- */

add_action(
	'rest_api_init',
	function () {
		$ns   = 'moveon-pannello/v1';
		$puo  = fn() => mo_pannello_puo();
		$pag  = fn( WP_REST_Request $r ) => mo_pannello_puo() && mo_pannello_puo_pagina( (int) $r['id'] );
		register_rest_route( $ns, '/stato', array( 'methods' => 'GET', 'permission_callback' => $puo, 'callback' => 'mo_pannello_api_stato' ) );
		register_rest_route( $ns, '/pagina/(?P<id>\d+)', array( 'methods' => 'GET', 'permission_callback' => $pag, 'callback' => 'mo_pannello_api_pagina' ) );
		register_rest_route(
			$ns,
			'/pagina/(?P<id>\d+)/sezione/(?P<i>\d+)',
			array(
				'methods'             => 'POST',
				'permission_callback' => $pag,
				'callback'            => function ( WP_REST_Request $r ) {
					$v   = $r->get_json_params();
					$res = mo_pannello_salva( (int) $r['id'], (int) $r['i'], is_array( $v['valori'] ?? null ) ? $v['valori'] : array() );
					return is_wp_error( $res ) ? new WP_REST_Response( array( 'errore' => $res->get_error_message() ), 400 ) : array( 'sezione' => $res );
				},
			)
		);
		register_rest_route(
			$ns,
			'/pagina/(?P<id>\d+)/annulla',
			array(
				'methods'             => 'POST',
				'permission_callback' => $pag,
				'callback'            => function ( WP_REST_Request $r ) {
					$res = mo_pannello_annulla( (int) $r['id'] );
					return is_wp_error( $res ) ? new WP_REST_Response( array( 'errore' => $res->get_error_message() ), 400 ) : mo_pannello_api_pagina( $r );
				},
			)
		);
		register_rest_route( $ns, '/foto', array( array( 'methods' => 'GET', 'permission_callback' => $puo, 'callback' => 'mo_pannello_api_foto' ), array( 'methods' => 'POST', 'permission_callback' => fn() => mo_pannello_puo() && current_user_can( 'upload_files' ), 'callback' => 'mo_pannello_api_carica' ) ) );
		register_rest_route( $ns, '/richieste', array( 'methods' => 'GET', 'permission_callback' => $puo, 'callback' => fn() => array( 'richieste' => mo_pannello_richieste() ) ) );
		register_rest_route(
			$ns,
			'/richieste/(?P<id>\d+)/letta',
			array(
				'methods'             => 'POST',
				'permission_callback' => $puo,
				'callback'            => function ( WP_REST_Request $r ) {
					$id = (int) $r['id'];
					if ( ! in_array( $id, wp_list_pluck( mo_pannello_richieste( 200 ), 'id' ), true ) ) {
						return new WP_REST_Response( array( 'errore' => 'Richiesta non trovata.' ), 404 );
					}
					update_post_meta( $id, '_mo_letta', 1 );
					return array( 'ok' => true );
				},
			)
		);
	}
);

function mo_pannello_api_stato(): array {
	$pagine = array();
	foreach ( mo_pannello_pagine() as $p ) {
		$pagine[] = array(
			'id'        => $p->ID,
			'titolo'    => get_the_title( $p ),
			'url'       => (string) get_permalink( $p ),
			'sezioni'   => count( mo_pannello_trova_sezioni( (string) $p->post_content ) ),
			'modificata' => wp_date( 'j M Y, H:i', strtotime( $p->post_modified_gmt . ' UTC' ) ),
		);
	}
	$richieste = mo_pannello_richieste();
	$s         = mo_settings();
	return array(
		'utente'    => wp_get_current_user()->display_name,
		'marchio'   => mo_pannello_marchio(),
		'pagine'    => $pagine,
		'nuove'     => count( array_filter( $richieste, fn( $r ) => ! $r['letta'] ) ),
		'ultime'    => array_slice( $richieste, 0, 3 ),
		'aiuto'     => array( 'whatsapp' => mo_wa_href( $s['whatsapp'] ), 'email' => (string) $s['email'] ),
	);
}

function mo_pannello_api_pagina( WP_REST_Request $r ): array {
	$p   = get_post( (int) $r['id'] );
	$sez = array();
	foreach ( mo_pannello_trova_sezioni( (string) $p->post_content ) as $i => $s ) {
		$sez[] = mo_pannello_sezione( $s[0], $s[1], $i );
	}
	return array(
		'id'        => $p->ID,
		'titolo'    => get_the_title( $p ),
		'url'       => (string) get_permalink( $p ),
		'sezioni'   => $sez,
		'annullabile' => count( wp_get_post_revisions( $p->ID ) ) > 1,
	);
}

function mo_pannello_api_foto(): array {
	$q = array( 'post_type' => 'attachment', 'post_mime_type' => 'image', 'post_status' => 'inherit', 'numberposts' => 80 );
	if ( mo_pannello_e_cliente() ) {
		$q['author'] = get_current_user_id();
	}
	$out = array();
	foreach ( get_posts( $q ) as $a ) {
		$out[] = array( 'id' => $a->ID, 'url' => (string) wp_get_attachment_image_url( $a->ID, 'medium_large' ), 'mini' => (string) wp_get_attachment_image_url( $a->ID, 'medium' ), 'nome' => get_the_title( $a ) );
	}
	return array( 'foto' => $out );
}

function mo_pannello_api_carica( WP_REST_Request $r ) {
	$file = $r->get_file_params()['foto'] ?? null;
	if ( ! $file || ! empty( $file['error'] ) ) {
		return new WP_REST_Response( array( 'errore' => 'Nessuna foto ricevuta.' ), 400 );
	}
	if ( (int) $file['size'] > 12 * MB_IN_BYTES ) {
		return new WP_REST_Response( array( 'errore' => 'La foto è troppo pesante: massimo 12 MB.' ), 400 );
	}
	$tipo = wp_check_filetype_and_ext( $file['tmp_name'], $file['name'] );
	if ( ! in_array( $tipo['type'], array( 'image/jpeg', 'image/png', 'image/webp' ), true ) ) {
		return new WP_REST_Response( array( 'errore' => 'Usa una foto JPG o PNG.' ), 400 );
	}
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	$_FILES['foto'] = $file;
	$id             = media_handle_upload( 'foto', 0 );
	if ( is_wp_error( $id ) ) {
		return new WP_REST_Response( array( 'errore' => $id->get_error_message() ), 400 );
	}
	return array( 'foto' => array( 'id' => $id, 'url' => (string) wp_get_attachment_image_url( $id, 'medium_large' ), 'mini' => (string) wp_get_attachment_image_url( $id, 'medium' ), 'nome' => get_the_title( $id ) ) );
}

/* ---------------- La pagina /gestione/ ---------------- */

add_action(
	'template_redirect',
	function () {
		if ( ! get_query_var( 'mo_pannello' ) ) {
			return;
		}
		nocache_headers();
		header( 'X-Robots-Tag: noindex, nofollow' );
		$errore = '';
		// phpcs:disable WordPress.Security.NonceVerification.Missing
		if ( isset( $_POST['mo_accesso'] ) ) {
			if ( ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['mo_accesso'] ) ), 'mo_pannello_accesso' ) ) {
				$errore = 'La pagina è rimasta aperta troppo a lungo: riprova.';
			} else {
				$u = wp_signon(
					array(
						'user_login'    => sanitize_user( wp_unslash( $_POST['utente'] ?? '' ) ),
						'user_password' => (string) wp_unslash( $_POST['password'] ?? '' ), // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
						'remember'      => ! empty( $_POST['ricorda'] ),
					),
					is_ssl()
				);
				if ( is_wp_error( $u ) ) {
					$errore = 'Nome utente o password non corretti.';
				} else {
					wp_safe_redirect( mo_pannello_url() );
					exit;
				}
			}
		}
		// phpcs:enable
		if ( isset( $_GET['esci'] ) && wp_verify_nonce( sanitize_key( wp_unslash( $_GET['esci'] ) ), 'mo_pannello_esci' ) ) {
			wp_logout();
			wp_safe_redirect( mo_pannello_url() );
			exit;
		}
		mo_pannello_stampa( $errore );
		exit;
	}
);

function mo_pannello_stampa( string $errore ): void {
	$v      = MOVEON_VERSION;
	$css    = MOVEON_URL . 'assets/pannello/pannello.css?ver=' . $v . '-' . (int) @filemtime( MOVEON_DIR . 'assets/pannello/pannello.css' ); // phpcs:ignore
	$js     = MOVEON_URL . 'assets/pannello/pannello.js?ver=' . $v . '-' . (int) @filemtime( MOVEON_DIR . 'assets/pannello/pannello.js' ); // phpcs:ignore
	$fonts  = MOVEON_URL . 'assets/css/fonts.css?ver=' . $v;
	$entra  = mo_pannello_puo();
	$m      = $entra ? mo_pannello_marchio() : array( 'nome' => 'Il tuo sito', 'colore' => '#223ab8', 'iniziali' => '', 'logo' => '' );
	$per    = sanitize_user( wp_unslash( $_GET['per'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification
	$cliente = ( ! $entra && '' !== $per ) ? get_user_by( 'login', $per ) : null;
	if ( $cliente && mo_pannello_e_cliente( $cliente ) ) {
		$m = mo_pannello_marchio( $cliente->ID ); // la pagina di accesso con il marchio del cliente
	} else {
		$per = '';
	}
	$moveon = MOVEON_URL . 'assets/img/logo-chiaro.png';
	header( 'Content-Type: text/html; charset=utf-8' );
	?>
<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="<?php echo esc_attr( $m['colore'] ); ?>">
<title><?php echo esc_html( ( $entra ? $m['nome'] . ' · ' : '' ) . 'Il tuo sito · by MoveOn' ); ?></title>
<link rel="stylesheet" href="<?php echo esc_url( $fonts ); ?>">
<link rel="stylesheet" href="<?php echo esc_url( $css ); ?>">
<style>:root{--p:<?php echo esc_html( $m['colore'] ); ?>}</style>
</head>
<body class="<?php echo $entra ? 'mp-app' : 'mp-fuori'; ?>">
	<?php if ( $entra ) : ?>
<div id="mp" data-api="<?php echo esc_url( rest_url( 'moveon-pannello/v1/' ) ); ?>" data-nonce="<?php echo esc_attr( wp_create_nonce( 'wp_rest' ) ); ?>" data-esci="<?php echo esc_url( add_query_arg( 'esci', wp_create_nonce( 'mo_pannello_esci' ), mo_pannello_url() ) ); ?>" data-moveon="<?php echo esc_url( $moveon ); ?>"></div>
<noscript>Per usare il pannello serve JavaScript attivo nel browser.</noscript>
<script src="<?php echo esc_url( $js ); ?>"></script>
	<?php elseif ( is_user_logged_in() ) : ?>
<main class="mp-accesso"><div class="mp-accesso-card"><h1>Accesso non disponibile</h1><p>Questo utente non ha un pannello. <a href="<?php echo esc_url( add_query_arg( 'esci', wp_create_nonce( 'mo_pannello_esci' ), mo_pannello_url() ) ); ?>">Esci</a> ed entra con l’utente che ti è stato dato.</p></div></main>
	<?php else : ?>
<main class="mp-accesso">
	<form class="mp-accesso-card" method="post" action="<?php echo esc_url( $per ? add_query_arg( 'per', $per, mo_pannello_url() ) : mo_pannello_url() ); ?>">
		<?php if ( $per && $m['logo'] ) : ?>
		<div class="mp-accesso-marchio mp-accesso-logo"><img src="<?php echo esc_url( $m['logo'] ); ?>" alt=""></div>
		<?php else : ?>
		<div class="mp-accesso-marchio" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg></div>
		<?php endif; ?>
		<h1><?php echo esc_html( $per ? $m['nome'] : 'Il tuo sito' ); ?></h1>
		<p class="mp-accesso-sotto">Entra per cambiare testi e foto del tuo sito.</p>
		<?php if ( $errore ) : ?><p class="mp-accesso-errore" role="alert"><?php echo esc_html( $errore ); ?></p><?php endif; ?>
		<label class="mp-campo"><span>Nome utente o email</span><input name="utente" autocomplete="username" required value="<?php echo esc_attr( $per ); ?>"<?php echo $per ? '' : ' autofocus'; ?>></label>
		<label class="mp-campo"><span>Password</span><input name="password" type="password" autocomplete="current-password" required<?php echo $per ? ' autofocus' : ''; ?>></label>
		<label class="mp-ricorda"><input type="checkbox" name="ricorda" value="1" checked> Ricordami su questo dispositivo</label>
		<?php wp_nonce_field( 'mo_pannello_accesso', 'mo_accesso', false ); ?>
		<button class="mp-btn mp-btn-primario mp-btn-largo" type="submit">Entra</button>
		<p class="mp-accesso-aiuto">Hai dimenticato la password? Scrivi a chi ha realizzato il tuo sito.</p>
	</form>
	<p class="mp-firma">Il tuo sito · by <img src="<?php echo esc_url( $moveon ); ?>" alt="MoveOn" width="74" height="16"></p>
</main>
	<?php endif; ?>
</body>
</html>
	<?php
}

require __DIR__ . '/pannello-demo.php';
