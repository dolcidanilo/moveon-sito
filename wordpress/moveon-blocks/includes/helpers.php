<?php
/**
 * Funzioni di supporto: impostazioni, immagini, testi, pixel.
 */

defined( 'ABSPATH' ) || exit;

/** Impostazioni generali (WordPress → MoveOn → Impostazioni), con i valori iniziali. */
function mo_settings(): array {
	$saved = get_option( 'moveon_settings', array() );
	return array_merge( mo_defaults()['settings'], is_array( $saved ) ? $saved : array() );
}

/**
 * Immagine pronta per i modelli: url, alt, w, h.
 * Se non è stata scelta un'immagine dalla Libreria media, usa quella inclusa nel plugin.
 */
function mo_image( $id, string $default_key = '', string $size = 'large' ): ?array {
	$id = absint( $id );
	if ( $id ) {
		$alt = trim( (string) get_post_meta( $id, '_wp_attachment_image_alt', true ) );
		$alt = '' !== $alt ? $alt : get_the_title( $id );
		// SVG (caricati con un plugin come Safe SVG): WordPress spesso non ne conosce le misure
		if ( 'image/svg+xml' === get_post_mime_type( $id ) ) {
			$url = wp_get_attachment_url( $id );
			if ( $url ) {
				list( $w, $h ) = mo_svg_size( (string) get_attached_file( $id ) );
				return array( 'url' => $url, 'alt' => $alt, 'w' => $w ?: '', 'h' => $h ?: '' );
			}
		}
		$src = wp_get_attachment_image_src( $id, $size );
		if ( $src ) {
			return array(
				'url' => $src[0],
				'alt' => $alt,
				'w'   => (int) $src[1] ?: '',
				'h'   => (int) $src[2] ?: '',
			);
		}
	}
	$def = mo_default_images()[ $default_key ] ?? null;
	if ( ! $def ) {
		return null;
	}
	return array(
		'url' => MOVEON_URL . 'assets/img/' . $def['file'],
		'alt' => $def['alt'],
		'w'   => $def['w'],
		'h'   => $def['h'],
	);
}

/** Misure di un file SVG lette dagli attributi width/height o dal viewBox (0, 0 se non si trovano). */
function mo_svg_size( string $file ): array {
	if ( ! $file || ! is_readable( $file ) ) {
		return array( 0, 0 );
	}
	$head = (string) file_get_contents( $file, false, null, 0, 4096 );
	if ( preg_match( '/<svg[^>]*\swidth="([\d.]+)(?:px)?"[^>]*\sheight="([\d.]+)(?:px)?"/i', $head, $m ) ) {
		return array( (int) round( (float) $m[1] ), (int) round( (float) $m[2] ) );
	}
	if ( preg_match( '/viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/i', $head, $m ) ) {
		return array( (int) round( (float) $m[1] ), (int) round( (float) $m[2] ) );
	}
	return array( 0, 0 );
}

/**
 * Testo salvato da WPBakery → testo normale.
 * WPBakery salva le virgolette come `` e le parentesi quadre come `{` `}`; gli "a capo" possono
 * arrivare come <br />. Qui si rimette tutto a posto.
 */
function mo_text( $v ): string {
	$v = (string) $v;
	$v = str_replace( array( '`{`', '`}`', '``' ), array( '[', ']', '"' ), $v );
	$v = preg_replace( '#<br\s*/?>#i', "\n", $v );
	return trim( html_entity_decode( $v, ENT_QUOTES, 'UTF-8' ) );
}

/** Testo su più righe: va a capo con Invio oppure con il simbolo | . */
function mo_lines( $v ): array {
	$v = str_replace( '|', "\n", mo_text( $v ) );
	return array_values( array_filter( array_map( 'trim', preg_split( '/\R+/', $v ) ), 'strlen' ) );
}

/** Elenco di voci, una per riga (per le etichette dei servizi, le opzioni del modulo…). */
function mo_list( $v ): array {
	return array_values( array_filter( array_map( 'trim', preg_split( '/\R+|\s*;\s*/', mo_text( $v ) ) ), 'strlen' ) );
}

/** Elenco ripetibile di WPBakery (param_group) → array di voci. Accetta anche un array già pronto. */
function mo_group( $v ): array {
	if ( is_array( $v ) ) {
		return $v;
	}
	$decoded = json_decode( urldecode( (string) $v ), true );
	return is_array( $decoded ) ? array_values( $decoded ) : array();
}

/** Ancora (id) sicura per i link del menu, es. "chi-siamo". */
function mo_anchor( $v, string $fallback ): string {
	$a = sanitize_title( mo_text( $v ) );
	return '' !== $a ? $a : $fallback;
}

/** Link: "#servizi" resta un'ancora, un indirizzo intero resta tale. */
function mo_href( $v ): string {
	$v = trim( mo_text( $v ) );
	if ( '' === $v ) {
		return '';
	}
	if ( '#' === $v[0] ) {
		return '#' . sanitize_title( substr( $v, 1 ) );
	}
	// «/chi-sono/»: una pagina di questo sito, anche se WordPress è in una sottocartella (es. /nuovo)
	if ( '/' === $v[0] && ( ! isset( $v[1] ) || '/' !== $v[1] ) ) {
		return esc_url_raw( home_url( $v ) );
	}
	return esc_url_raw( $v );
}

/** "+39 347 461 6434" → "+393474616434" (prefisso italiano aggiunto se manca). */
function mo_phone( string $raw ): string {
	$n = preg_replace( '/[^\d+]/', '', $raw );
	if ( '' === $n ) {
		return '';
	}
	if ( 0 === strpos( $n, '00' ) ) {
		$n = '+' . substr( $n, 2 );
	}
	if ( '+' !== $n[0] ) {
		$n = '+39' . $n;
	}
	return $n;
}
function mo_tel_href( string $raw ): string {
	$p = mo_phone( $raw );
	return $p ? 'tel:' . $p : '';
}
function mo_wa_href( string $raw ): string {
	$p = mo_phone( $raw );
	return $p ? 'https://wa.me/' . substr( $p, 1 ) : '';
}

/** "Garanzia MoveOn Studio, scelta sicura" → "GARANZIA MOVEON STUDIO • SCELTA SICURA • " ripetuto 2 volte. */
function mo_ring_text( string $t ): string {
	$parts = array_filter( array_map( 'trim', preg_split( '/[,•·]/u', $t ) ), 'strlen' );
	$once  = '';
	foreach ( $parts as $p ) {
		$once .= mb_strtoupper( $p, 'UTF-8' ) . ' • ';
	}
	return $once . $once;
}

/** Punto focale "50% 32%" → [50, 32]. */
function mo_focus( $v, array $fallback = array( 50, 50 ) ): array {
	if ( preg_match( '/(\d{1,3})\s*%?\s+(\d{1,3})/', mo_text( $v ), $m ) ) {
		return array( min( 100, (int) $m[1] ), min( 100, (int) $m[2] ) );
	}
	return $fallback;
}

/* ------------------------------------------------------------------ */
/* Lampadina e scudo in pixel (animazioni fisse, come nel prototipo)    */
/* ------------------------------------------------------------------ */

function mo_pixels( string $kind ): string {
	$maps = array(
		'bulb'   => array( '....XXXXX....', '..XXXXXXXXX..', '.XXXXXXXXXXX.', '.XXXAXXXAXXX.', 'XXXXAXXXAXXXX', 'XXXXAAXAAXXXX', 'XXXXXAAAXXXXX', '.XXXXXAXXXXX.', '.XXXXXAXXXXX.', '..XXXXAXXXX..', '...XXXAXXX...', '....XXAXX....', '....SSSSS....', '....sssss....', '....SSSSS....', '.....sss.....' ),
		'shield' => array( '..XXXXXXXXX..', '.XXXXXXXXXXX.', 'XXXXXXXXXXXXX', 'XXXXXXXXXXCXX', 'XXXXXXXXXCXXX', 'XXXXXXXXCXXXX', 'XXXCXXXCXXXXX', 'XXXXCXCXXXXXX', 'XXXXXCXXXXXXX', '.XXXXXXXXXXX.', '.XXXXXXXXXXX.', '..XXXXXXXXX..', '...XXXXXXX...', '....XXXXX....', '.....XXX.....', '......X......' ),
	);
	$out = '';
	foreach ( $maps[ $kind ] as $r => $row ) {
		$len = strlen( $row );
		for ( $c = 0; $c < $len; $c++ ) {
			$ch = $row[ $c ];
			if ( '.' === $ch ) {
				$out .= '<span class="mo-px"></span>';
				continue;
			}
			$cls = 'mo-px mo-px-on';
			if ( 'bulb' === $kind ) {
				if ( 'X' === $ch ) {
					$col = ( $r + $c < 8 ) ? '#60a5fa' : ( $r + $c > 17 ? '#1d4ed8' : '#2563eb' );
				} elseif ( 'A' === $ch ) {
					$col = '#f59e0b';
					$cls = 'mo-px mo-px-a mo-px-on';
				} elseif ( 'S' === $ch ) {
					$col = '#94a3b8';
				} else {
					$col = '#64748b';
				}
			} else {
				$col = 'C' === $ch ? '#f59e0b' : ( ( $r + $c < 7 ) ? '#60a5fa' : ( $r + $c > 17 ? '#1d4ed8' : '#2563eb' ) );
				if ( 'C' === $ch ) {
					$cls = 'mo-px mo-px-ck mo-px-on';
				}
			}
			$out .= '<span class="' . $cls . '"><i style="--mo-c:' . $col . '"></i></span>';
		}
	}
	$wrap = 'bulb' === $kind ? 'mo-bulb' : 'mo-shield';
	return '<span class="' . $wrap . '" aria-hidden="true">' . $out . '</span>';
}
