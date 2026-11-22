<?php
/**
 * Colori principali del sito (MoveOn → Colori). Ogni colore ha un numero, lo stesso del PDF «Colori MoveOn»:
 * nel CSS diventa la variabile --mo-c1 … --mo-c10. Le sfumature minori (blu del passaggio del mouse, tinta tenue)
 * si ricavano da questi colori e li seguono da sole.
 */

if ( ! defined( 'ABSPATH' ) && 'cli' !== PHP_SAPI ) {
	exit;
}

/** Numero → nome, colore di serie, dove si usa. */
function mo_colori_base(): array {
	return array(
		1  => array( 'nome' => 'Blu intenso', 'colore' => '#223ab8', 'uso' => 'Sfondi scuri (Hero, Pausa, Portfolio, Contatti, footer, menu del telefono), titoli sui fondi chiari, testo dei pulsanti gialli.' ),
		2  => array( 'nome' => 'Blu notte', 'colore' => '#182343', 'uso' => 'Fascia del logo nel menu del telefono, campi del modulo, titoli delle card, sfondi scuri alternativi.' ),
		3  => array( 'nome' => 'Blu brillante', 'colore' => '#2563eb', 'uso' => 'Pulsanti blu, link, etichette in maiuscolo e numeri sui fondi chiari, il «25».' ),
		4  => array( 'nome' => 'Azzurro', 'colore' => '#60a5fa', 'uso' => 'Link ed etichette sui fondi scuri, illustrazioni, pixel dello scudo delle Garanzie.' ),
		5  => array( 'nome' => 'Azzurro chiaro', 'colore' => '#93c5fd', 'uso' => 'Dettagli sui fondi scuri: etichette dei servizi, contorno dei campi attivi.' ),
		6  => array( 'nome' => 'Giallo', 'colore' => '#f59e0b', 'uso' => 'Pulsanti d’azione (Richiedi Preventivo, Invia Richiesta, Chiedimi un consiglio), barra di avanzamento, spunte, virgolette, sottolineatura della hero.' ),
		7  => array( 'nome' => 'Bianco del sito', 'colore' => '#f4f5f7', 'uso' => 'Testi sui fondi scuri e sfondi chiari delle sezioni.' ),
		8  => array( 'nome' => 'Grigio chiarissimo', 'colore' => '#f8fafc', 'uso' => 'Sfondi chiari alternativi (Non sai da dove partire?, Garanzie) e titoli chiari sui fondi scuri.' ),
		9  => array( 'nome' => 'Grigio ardesia', 'colore' => '#334155', 'uso' => 'Testi dei paragrafi sui fondi chiari e bordi sui fondi scuri.' ),
		10 => array( 'nome' => 'Grigio perla', 'colore' => '#cbd5e1', 'uso' => 'Testi dei paragrafi sui fondi scuri.' ),
	);
}

/** Colore sicuro #rrggbb (o vuoto). */
function mo_colore_hex( $v ): string {
	$v = strtolower( trim( (string) $v ) );
	if ( preg_match( '/^#([0-9a-f]{3})$/', $v, $m ) ) {
		$v = '#' . $m[1][0] . $m[1][0] . $m[1][1] . $m[1][1] . $m[1][2] . $m[1][2];
	}
	return preg_match( '/^#[0-9a-f]{6}$/', $v ) ? $v : '';
}

/** Colori in uso: quelli salvati in MoveOn → Colori, altrimenti quelli di serie. */
function mo_colori(): array {
	$salvati = function_exists( 'get_option' ) ? get_option( 'moveon_colori', array() ) : array();
	$salvati = is_array( $salvati ) ? $salvati : array();
	$out     = array();
	foreach ( mo_colori_base() as $n => $c ) {
		$out[ $n ] = mo_colore_hex( $salvati[ $n ] ?? '' ) ?: $c['colore'];
	}
	return $out;
}

/** CSS con i soli colori cambiati (vuoto se sono tutti quelli di serie). */
function mo_colori_css(): string {
	$base = mo_colori_base();
	$vars = array();
	foreach ( mo_colori() as $n => $hex ) {
		if ( $hex !== $base[ $n ]['colore'] ) {
			$vars[] = '--mo-c' . $n . ':' . $hex;
		}
	}
	return $vars ? ':root{' . implode( ';', $vars ) . '}' : '';
}

/** Salva i colori dal modulo (ripulendoli); «ripristina» li riporta tutti a quelli di serie. */
function mo_colori_salva( array $in, bool $ripristina = false ): array {
	$out = array();
	if ( ! $ripristina ) {
		foreach ( mo_colori_base() as $n => $c ) {
			$hex = mo_colore_hex( $in[ $n ] ?? '' );
			if ( $hex && $hex !== $c['colore'] ) {
				$out[ $n ] = $hex;
			}
		}
	}
	update_option( 'moveon_colori', $out );
	return $out;
}
