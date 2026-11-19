<?php
/**
 * Ordine dei servizi e dati per Google (1.10.0).
 * - Ordine scelto dal titolare (19/11/2026): Social, Siti web, Grafica, Stampa, Formazione.
 *   La Formazione ha pagina e voce di menu, ma niente scheda in home.
 * - Zona in cui lavora (MoveOn → Impostazioni) e servizi aggiunti ai dati strutturati di Google:
 *   dentro la scheda dell'attività di Rank Math se c'è, altrimenti con una scheda propria (solo in home).
 */

defined( 'ABSPATH' ) || exit;

/** Ordine dei servizi (chiavi delle pagine /servizi/…/). */
function mo_ordine_servizi(): array {
	return array( 'social', 'siti-web', 'grafica', 'stampa', 'formazione' );
}

/** Servizi che hanno la scheda nella sezione Servizi della home. */
function mo_servizi_in_home(): array {
	return array( 'social', 'siti-web', 'grafica', 'stampa' );
}

/** Scheda della Formazione (solo nella pagina Servizi). */
function mo_scheda_formazione(): array {
	return array( 'nome' => 'Formazione', 'link' => '/servizi/formazione/', 'beneficio' => 'Lezioni individuali online, anche la sera e nel weekend, per diventare autonomo con gli strumenti dei professionisti.', 'voci' => "Photoshop\nIllustrator\nInDesign\nWordPress", 'parola_sfondo' => 'Corsi', 'colore' => 'bianco', 'illustrazione' => 'formazione' );
}

/** Tutte le schede, per la pagina Servizi: quelle della home più la Formazione. */
function mo_schede_servizi_tutte(): array {
	$schede   = mo_defaults()['servizi']['servizi'];
	$schede[] = mo_scheda_formazione();
	return $schede;
}

/** Servizio di una scheda, ricavato dal link (/servizi/social/ → social). */
function mo_chiave_servizio( array $s ): string {
	return preg_match( '#/servizi/([a-z0-9-]+)/?#', (string) ( $s['link'] ?? '' ), $m ) ? $m[1] : '';
}

/**
 * Schede nell'ordine nuovo. I colori restano legati alla posizione (il ritmo bianco, blu, grigio… non cambia);
 * le schede che non sono servizi conosciuti restano in fondo. Senza $tutte la Formazione esce.
 */
function mo_riordina_schede( array $schede, bool $tutte ): array {
	$colori = array();
	foreach ( $schede as $s ) {
		$colori[] = $s['colore'] ?? 'bianco';
	}
	$pos    = array_flip( mo_ordine_servizi() );
	$ammessi = $tutte ? mo_ordine_servizi() : mo_servizi_in_home();
	$noti   = array();
	$altri  = array();
	foreach ( $schede as $s ) {
		$k = mo_chiave_servizio( (array) $s );
		if ( isset( $pos[ $k ] ) ) {
			if ( in_array( $k, $ammessi, true ) && ! isset( $noti[ $pos[ $k ] ] ) ) {
				$noti[ $pos[ $k ] ] = $s;
			}
		} else {
			$altri[] = $s;
		}
	}
	ksort( $noti );
	$nuove = array_merge( array_values( $noti ), $altri );
	foreach ( $nuove as $i => $s ) {
		if ( isset( $colori[ $i ] ) ) {
			$nuove[ $i ]['colore'] = $colori[ $i ];
		}
	}
	return $nuove;
}

/** Riordina le schede di ogni elemento Servizi nel contenuto di una pagina. */
function mo_ordina_servizi_testo( string $c, bool $tutte ): string {
	return (string) preg_replace_callback(
		'/\[mo_servizi\b([^\]]*)\]/',
		function ( $m ) use ( $tutte ) {
			$atts = shortcode_parse_atts( trim( $m[1] ) );
			$atts = is_array( $atts ) ? $atts : array();
			if ( isset( $atts['servizi'] ) ) {
				$schede = mo_riordina_schede( mo_group( $atts['servizi'] ), $tutte );
			} elseif ( $tutte ) {
				$schede = mo_schede_servizi_tutte();
			} else {
				return $m[0]; // testi di serie: sono già nell'ordine nuovo
			}
			$valore = 'servizi="' . rawurlencode( wp_json_encode( $schede ) ) . '"';
			if ( isset( $atts['servizi'] ) ) {
				return (string) preg_replace( '/(?<![\w-])servizi="[^"]*"/', $valore, $m[0], 1 );
			}
			return rtrim( substr( $m[0], 0, -1 ) ) . ' ' . $valore . ']';
		},
		$c
	);
}

/**
 * Strumento «Metti in ordine i servizi»: home (senza Formazione), pagina Servizi (con la Formazione in fondo),
 * voci del menu sotto Servizi e ordine delle pagine. Le versioni precedenti restano nelle Revisioni.
 */
function mo_ordina_servizi(): array {
	$fatto  = array();
	$pagine = array();
	$home   = (int) get_option( 'page_on_front' );
	if ( $home ) {
		$pagine[ $home ] = array( false, 'home: schede dei Servizi nel nuovo ordine, senza la Formazione' );
	}
	$hub = mo_pagina_pronta( 'servizi' );
	if ( $hub && $hub->ID !== $home ) {
		$pagine[ $hub->ID ] = array( true, 'pagina Servizi: schede nel nuovo ordine, con la Formazione in fondo' );
	}
	foreach ( $pagine as $id => $info ) {
		$post = get_post( $id );
		if ( ! $post ) {
			continue;
		}
		$c     = (string) $post->post_content;
		$nuovo = mo_ordina_servizi_testo( $c, $info[0] );
		if ( $nuovo !== $c ) {
			wp_update_post( array( 'ID' => $id, 'post_content' => wp_slash( $nuovo ) ) );
			$fatto[] = $info[1];
		}
	}
	// Ordine delle pagine dei servizi (per gli elenchi di WordPress)
	foreach ( mo_ordine_servizi() as $n => $k ) {
		$p = mo_pagina_pronta( $k );
		if ( $p && (int) $p->menu_order !== 10 + $n ) {
			wp_update_post( array( 'ID' => $p->ID, 'menu_order' => 10 + $n ) );
		}
	}
	// Voci del menu: i servizi si scambiano di posto tra loro, il resto non si muove
	$loc   = get_theme_mod( 'nav_menu_locations', array() );
	$menu  = (int) ( $loc['moveon-principale'] ?? 0 );
	$items = $menu ? wp_get_nav_menu_items( $menu, array( 'post_status' => 'any' ) ) : array();
	$voci  = array();
	$posti = array();
	foreach ( (array) $items as $it ) {
		if ( 'post_type' !== $it->type || 'page' !== $it->object ) {
			continue;
		}
		$i = array_search( (string) get_post_meta( (int) $it->object_id, '_moveon_pagina', true ), mo_ordine_servizi(), true );
		if ( false === $i || isset( $voci[ $i ] ) ) {
			continue;
		}
		$voci[ $i ] = $it;
		$posti[]    = (int) $it->menu_order;
	}
	ksort( $voci );
	sort( $posti );
	$mosse = 0;
	foreach ( array_values( $voci ) as $n => $it ) {
		if ( (int) $it->menu_order !== $posti[ $n ] ) {
			wp_update_post( array( 'ID' => $it->ID, 'menu_order' => $posti[ $n ] ) );
			++$mosse;
		}
	}
	if ( $mosse ) {
		$fatto[] = 'menu: servizi a tendina nel nuovo ordine';
	}
	return array( 'home' => $home, 'fatto' => $fatto );
}

/* ---------------- Dati per Google ---------------- */

/** Comuni in cui lavori (MoveOn → Impostazioni), uno per riga. */
function mo_zona(): array {
	$righe = preg_split( '/[\r\n,]+/', (string) ( mo_settings()['zona'] ?? '' ) );
	return array_values( array_unique( array_filter( array_map( 'trim', (array) $righe ) ) ) );
}

/** Zona servita e servizi, da aggiungere alla scheda dell'attività. */
function mo_dati_google_extra(): array {
	$extra = array();
	$zona  = mo_zona();
	if ( $zona ) {
		$extra['areaServed'] = array();
		foreach ( $zona as $comune ) {
			$extra['areaServed'][] = array( '@type' => 'City', 'name' => $comune );
		}
	}
	$offerte = array();
	foreach ( mo_servizi_pagine() as $k => $s ) {
		$servizio = array( '@type' => 'Service', 'name' => $s['nome'] );
		$p        = mo_pagina_pronta( $k );
		if ( $p && 'publish' === $p->post_status ) {
			$servizio['url'] = get_permalink( $p );
		}
		$offerte[] = array( '@type' => 'Offer', 'itemOffered' => $servizio );
	}
	$extra['hasOfferCatalog'] = array( '@type' => 'OfferCatalog', 'name' => 'Servizi', 'itemListElement' => $offerte );
	return $extra;
}

/** Aggiunge zona e servizi alla scheda dell'attività di Rank Math (quella con @id …#organization). */
function mo_aggiungi_a_rank_math( $data ) {
	if ( ! is_array( $data ) ) {
		return $data;
	}
	foreach ( $data as $k => $ent ) {
		if ( is_array( $ent ) && preg_match( '/#organization$/', (string) ( $ent['@id'] ?? '' ) ) ) {
			$data[ $k ]                     = $ent + mo_dati_google_extra(); // quello che hai scritto in Rank Math vince
			$GLOBALS['mo_dati_google_fatti'] = true;
			break;
		}
	}
	return $data;
}

/** Scheda propria quando Rank Math non c'è (o non ha la scheda dell'attività). */
function mo_dati_google(): array {
	$s    = mo_settings();
	$zona = mo_zona();
	$dati = array(
		'@context' => 'https://schema.org',
		'@type'    => 'ProfessionalService',
		'@id'      => home_url( '/#organization' ),
		'name'     => wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ),
		'url'      => home_url( '/' ),
	);
	$logo = (int) ( $s['logo_chiaro_id'] ?? 0 ) ?: (int) ( $s['logo_scuro_id'] ?? 0 );
	if ( $logo && wp_get_attachment_url( $logo ) ) {
		$dati['logo']  = wp_get_attachment_url( $logo );
		$dati['image'] = $dati['logo'];
	}
	if ( ! empty( $s['telefono'] ) ) {
		$dati['telephone'] = preg_replace( '/[^\d+]/', '', (string) $s['telefono'] );
	}
	if ( ! empty( $s['email'] ) ) {
		$dati['email'] = (string) $s['email'];
	}
	if ( $zona ) {
		// Solo il comune, senza via: l'attività non ha una sede aperta al pubblico
		$dati['address'] = array( '@type' => 'PostalAddress', 'addressLocality' => $zona[0], 'addressCountry' => 'IT' );
	}
	return $dati + mo_dati_google_extra();
}

add_filter(
	'rank_math/json_ld',
	function ( $data ) {
		return is_front_page() ? mo_aggiungi_a_rank_math( $data ) : $data;
	},
	99
);

add_action(
	'wp_head',
	function () {
		if ( ! is_front_page() || ! empty( $GLOBALS['mo_dati_google_fatti'] ) ) {
			return;
		}
		echo '<script type="application/ld+json" class="mo-dati-google">' . wp_json_encode( mo_dati_google(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG ) . "</script>\n";
	},
	99
);
