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

/** Indirizzi "#sezione" del menu e dei pulsanti: dalle pagine dei progetti portano alla home. */
function mo_link_sezione( string $href ): string {
	if ( '' !== $href && '#' === $href[0] && mo_is_progetti_view() ) {
		return home_url( '/' ) . $href;
	}
	return $href;
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
	foreach ( array( 'richiesta' => 'La richiesta', 'lavoro' => 'Il nostro lavoro', 'risultato' => 'Il risultato' ) as $k => $titolo ) {
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
