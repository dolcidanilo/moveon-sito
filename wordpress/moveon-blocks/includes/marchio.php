<?php
/**
 * Marchio di una singola pagina (1.12.0): una pagina può avere nome, logo, colori, menu e testi del footer propri,
 * come se fosse il sito di un altro cliente. Serve per la demo del pannello clienti (es. lo studio dentistico)
 * senza toccare il resto del sito. I dati stanno nel campo nascosto `_mo_marchio` della pagina.
 */

defined( 'ABSPATH' ) || exit;

/** Marchio della pagina che si sta mostrando, o null. */
function mo_marchio_pagina(): ?array {
	static $cache = array();
	if ( ! did_action( 'wp' ) ) {
		return null;
	}
	$id = is_singular( 'page' ) ? (int) get_queried_object_id() : 0;
	if ( ! $id ) {
		return null;
	}
	if ( ! array_key_exists( $id, $cache ) ) {
		$m            = get_post_meta( $id, '_mo_marchio', true );
		$cache[ $id ] = is_array( $m ) && ! empty( $m['nome'] ) ? $m : null;
	}
	return $cache[ $id ];
}

/** CSS dei colori del marchio (stesse variabili di MoveOn → Colori). */
function mo_marchio_css( array $m ): string {
	$out = '';
	foreach ( (array) ( $m['colori'] ?? array() ) as $n => $hex ) {
		$hex = sanitize_hex_color( (string) $hex );
		if ( $hex && preg_match( '/^c(10|[1-9])$/', (string) $n ) ) {
			$out .= '--mo-' . $n . ':' . $hex . ';';
		}
	}
	return '' !== $out ? ':root,:root[data-theme]{' . $out . '}' : '';
}

/** Voci del menu del marchio (ancore della pagina, es. #trattamenti). */
function mo_marchio_menu( array $m ): array {
	$items = array();
	foreach ( (array) ( $m['menu'] ?? array() ) as $voce ) {
		if ( ! empty( $voce[0] ) && ! empty( $voce[1] ) ) {
			$items[] = array( 'testo' => (string) $voce[0], 'href' => (string) $voce[1], 'nav' => ltrim( (string) $voce[1], '#' ), 'figli' => array(), 'ha_figli' => false );
		}
	}
	return $items;
}

// Niente motori di ricerca sulle pagine con un marchio proprio (sono dimostrazioni)
add_filter(
	'wp_robots',
	function ( $r ) {
		if ( mo_marchio_pagina() ) {
			$r['noindex']  = true;
			$r['nofollow'] = true;
		}
		return $r;
	}
);
