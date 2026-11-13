<?php
/**
 * Pagine dei progetti: /progetti/ (tutti i lavori) e /progetti/nome-progetto/ (un lavoro).
 * Usano il modello "MoveOn · pagina intera" (header, footer, stile e animazioni del sito);
 * l'HTML si modifica da MoveOn → Modelli HTML («progetto» e «progetti»).
 */

defined( 'ABSPATH' ) || exit;

/** Siamo su una pagina dei progetti? */
function mo_is_progetti_view(): bool {
	return is_singular( MO_CPT ) || is_post_type_archive( MO_CPT );
}

/** Indirizzo della pagina con tutti i progetti. */
function mo_progetti_url(): string {
	return (string) get_post_type_archive_link( MO_CPT );
}

/* Dopo un aggiornamento del plugin WordPress deve conoscere i nuovi indirizzi (/progetti/…): si aggiornano una volta sola */
add_action(
	'init',
	function () {
		if ( get_option( 'moveon_indirizzi' ) !== MOVEON_VERSION ) {
			flush_rewrite_rules( false );
			update_option( 'moveon_indirizzi', MOVEON_VERSION );
		}
	},
	99
);

/* Un progetto con "Mostra questo progetto nel sito" spento non ha pagina (per chi non può modificarlo) */
add_action(
	'template_redirect',
	function () {
		if ( ! is_singular( MO_CPT ) ) {
			return;
		}
		$id = get_queried_object_id();
		if ( '0' === get_post_meta( $id, '_mo_evidenza', true ) && ! current_user_can( 'edit_post', $id ) ) {
			global $wp_query;
			$wp_query->set_404();
			status_header( 404 );
			nocache_headers();
		}
	}
);

/* Nella pagina Progetti: tutti i progetti visibili, nell'ordine scelto */
add_action(
	'pre_get_posts',
	function ( $q ) {
		if ( ! is_admin() && $q->is_main_query() && $q->is_post_type_archive( MO_CPT ) ) {
			$q->set( 'posts_per_page', 60 );
		}
	}
);

/* Titolo della scheda del browser (e di Google) per la pagina Progetti */
add_filter(
	'post_type_archive_title',
	function ( $title, $post_type ) {
		return MO_CPT === $post_type ? wp_strip_all_tags( mo_text( mo_settings()['progetti_titolo'] ) ) : $title;
	},
	10,
	2
);

/**
 * Indirizzi "#sezione" del menu e dei pulsanti: sulla home restano «#sezione»; dalle altre pagine portano alla home
 * (e «#contatti» alla pagina Contatti, se esiste).
 */
function mo_link_sezione( string $href ): string {
	if ( '' === $href || '#' !== $href[0] || ( is_front_page() && ! mo_is_progetti_view() ) ) {
		return $href;
	}
	if ( ! did_action( 'wp' ) ) {
		return $href; // fuori da una pagina del sito (es. nel pannello): resta com'è
	}
	if ( '#contatti' === $href && function_exists( 'mo_pagina_pronta' ) ) {
		$contatti = mo_pagina_pronta( 'contatti' );
		if ( $contatti && 'publish' === $contatti->post_status && get_queried_object_id() !== $contatti->ID ) {
			return (string) get_permalink( $contatti );
		}
		if ( $contatti && get_queried_object_id() === $contatti->ID ) {
			return $href; // sulla pagina Contatti il modulo è qui
		}
	}
	return home_url( '/' ) . $href;
}

/* ---------------- Sfondi delle pagine dei progetti (MoveOn → Impostazioni) ---------------- */

/** Le zone con uno sfondo proprio: stesse opzioni della scheda «Sfondo» degli elementi. */
function mo_zone_sfondo(): array {
	return array(
		'progetti_testa' => array( 'Pagina Progetti · parte alta', 'Titolo, testo e filtri. Di serie blu notte.' ),
		'progetti_corpo' => array( 'Pagina Progetti · elenco dei lavori', 'Dietro le card dei progetti. Di serie bianco.' ),
		'progetto_testa' => array( 'Pagine dei progetti · parte alta', 'Nome del progetto (vale per tutti i progetti). Di serie blu notte.' ),
		'progetto_corpo' => array( 'Pagine dei progetti · contenuto', 'Dietro copertina, testi, immagini e progetti vicini (vale per tutti i progetti). Di serie bianco.' ),
	);
}

/** Valori di uno sfondo, puliti (accetta i campi così come arrivano dal modulo). */
function mo_sfondo_pulito( $v ): array {
	$v   = is_array( $v ) ? $v : array();
	$img = absint( $v['sfondo_img'] ?? 0 );
	$op  = (int) ( $v['sfondo_opacita'] ?? 30 );
	return array(
		'sfondo_colore'     => mo_colore( $v['sfondo_colore'] ?? '' ),
		'sfondo_testi'      => in_array( $v['sfondo_testi'] ?? '', array( 'chiari', 'scuri' ), true ) ? $v['sfondo_testi'] : '',
		'sfondo_img'        => $img && wp_attachment_is_image( $img ) ? $img : 0,
		'sfondo_opacita'    => $op >= 5 && $op <= 100 ? $op : 30,
		'sfondo_dimensione' => in_array( $v['sfondo_dimensione'] ?? '', array( 'cover', 'contain', 'auto' ), true ) ? $v['sfondo_dimensione'] : 'cover',
		'sfondo_posizione'  => sanitize_text_field( (string) ( $v['sfondo_posizione'] ?? '' ) ) ?: '50% 50%',
		'sfondo_video'          => mo_video_url( $v['sfondo_video'] ?? '' ),
		'sfondo_video_opacita'  => max( 5, min( 100, (int) ( $v['sfondo_video_opacita'] ?? 40 ) ) ),
		'sfondo_video_telefono' => 'no' === ( $v['sfondo_video_telefono'] ?? '' ) ? 'no' : '',
		'sfondo_sfumatura'          => in_array( $v['sfondo_sfumatura'] ?? '', mo_sfumature_sfondo(), true ) ? (string) $v['sfondo_sfumatura'] : '',
		'sfondo_sfumatura_ampiezza' => in_array( (string) ( $v['sfondo_sfumatura_ampiezza'] ?? '' ), array( '20', '35', '55' ), true ) ? (string) $v['sfondo_sfumatura_ampiezza'] : '35',
		// Solo per la parte alta: pixel in cui foto e colore proseguono sotto il contenuto, svanendo
		'sfumatura'         => max( 0, min( 600, (int) ( $v['sfumatura'] ?? 0 ) ) ),
	);
}

/** Sfondo salvato per una zona. */
function mo_sfondo_zona( string $zona ): array {
	$tutti = get_option( 'moveon_sfondi', array() );
	return mo_sfondo_pulito( is_array( $tutti ) ? ( $tutti[ $zona ] ?? array() ) : array() );
}

/** Stile della parte alta: la sfumatura (pixel in cui foto e colore proseguono sotto il contenuto, svanendo). */
function mo_stile_testa( string $testa ): string {
	$px = mo_sfondo_zona( $testa )['sfumatura'];
	return $px ? '--mo-sfumatura:' . $px . 'px' : '';
}

/** La parte alta della pagina ha testi scuri (sfondo chiaro)? Allora anche l'header, finché non scorri, usa il logo e i testi scuri. */
function mo_testa_chiara(): bool {
	if ( ! mo_is_progetti_view() ) {
		return false;
	}
	return 'scuri' === mo_sfondo_zona( is_post_type_archive( MO_CPT ) ? 'progetti_testa' : 'progetto_testa' )['sfondo_testi'];
}

/** HTML della pagina con tutti i progetti. */
function mo_progetti_archivio_html(): string {
	$s        = mo_settings();
	$progetti = array();
	foreach ( mo_progetti_in_evidenza() as $p ) {
		$img        = $p['copertina'] ?: $p['carosello'];
		$progetti[] = array(
			'url'       => $p['url'],
			'nome'      => $p['nome'],
			'tipo'      => $p['tipo'],
			'area'      => $p['area'],
			'area_nome' => $p['area_nome'],
			'immagine'  => $img,
		);
	}
	$presenti = array_unique( array_column( $progetti, 'area' ) );
	$filtri   = array();
	foreach ( mo_aree() as $k => $nome ) {
		if ( in_array( $k, $presenti, true ) ) {
			$filtri[] = array( 'valore' => $k, 'nome' => $nome );
		}
	}
	return MO_Tpl::render(
		'progetti',
		array(
			'sfondo_testa' => mo_sfondo_html( mo_sfondo_zona( 'progetti_testa' ) ),
			'stile_testa'  => mo_stile_testa( 'progetti_testa' ),
			'sfondo_corpo' => mo_sfondo_html( mo_sfondo_zona( 'progetti_corpo' ) ),
			'titolo'   => mo_text( $s['progetti_titolo'] ),
			'testo'    => mo_text( $s['progetti_testo'] ),
			'filtri'    => $filtri,
			'ha_filtri' => count( $filtri ) > 1,
			'progetti' => $progetti,
			'vuoto'    => ! $progetti,
			'cta'      => array( 'testo' => 'Parliamo del tuo progetto', 'href' => mo_link_sezione( mo_href( $s['cta_link'] ) ) ),
		)
	);
}

/** HTML della pagina di un progetto. */
function mo_progetto_pagina_html( WP_Post $post ): string {
	$s    = mo_settings();
	$p    = mo_progetto_dati( $post );
	$cov  = $p['cover_xl'] ?: $p['carosello'];
	// Testi: solo quelli compilati
	$blocchi = array();
	foreach ( array( 'richiesta' => 'La richiesta', 'lavoro' => 'Il mio lavoro', 'risultato' => 'Il risultato' ) as $k => $titolo ) {
		if ( '' !== trim( $p[ $k ] ) ) {
			$blocchi[] = array( 'titolo' => $titolo, 'testo' => $p[ $k ] );
		}
	}
	// Racconto dall'editor (facoltativo)
	$racconto = trim( (string) $post->post_content );
	$racconto = '' !== $racconto ? apply_filters( 'the_content', $racconto ) : '';
	// Progetto precedente e successivo, nell'ordine del sito (giro completo)
	$lista = mo_progetti_in_evidenza();
	$ids   = array_column( $lista, 'id' );
	$pos   = array_search( $post->ID, $ids, true );
	$vicini = array();
	if ( false !== $pos && count( $lista ) > 1 ) {
		$n = count( $lista );
		foreach ( array( 'prec' => -1, 'succ' => 1 ) as $dir => $passo ) {
			$v                = $lista[ ( $pos + $passo + $n ) % $n ];
			$vicini[ $dir ] = array( 'url' => $v['url'], 'nome' => $v['nome'], 'immagine' => $v['copertina'] ?: $v['carosello'] );
		}
	}
	return MO_Tpl::render(
		'progetto',
		array(
			'sfondo_testa' => mo_sfondo_html( mo_sfondo_zona( 'progetto_testa' ) ),
			'stile_testa'  => mo_stile_testa( 'progetto_testa' ),
			'sfondo_corpo' => mo_sfondo_html( mo_sfondo_zona( 'progetto_corpo' ) ),
			'nome'        => $p['nome'],
			'area_nome'   => $p['area_nome'],
			'tipo'        => $p['tipo'],
			'copertina'   => $cov,
			'blocchi'     => $blocchi,
			'ha_blocchi'  => (bool) $blocchi,
			'racconto'    => $racconto,
			'galleria'    => $p['galleria'],
			'ha_galleria' => (bool) $p['galleria'],
			'prec'        => $vicini['prec'] ?? null,
			'succ'        => $vicini['succ'] ?? null,
			'archivio'    => mo_progetti_url(),
			'cta'         => array( 'testo' => 'Parliamo del tuo progetto', 'href' => mo_link_sezione( mo_href( $s['cta_link'] ) ) ),
		)
	);
}
