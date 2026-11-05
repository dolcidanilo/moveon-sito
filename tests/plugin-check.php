<?php
/**
 * Controlli sul motore PHP del plugin MoveOn Blocks, eseguiti dentro un WordPress (senza browser).
 * Uso: php tests/plugin-check.php /percorso/di/wordpress
 *
 * Verifica: definizione dei campi per WPBakery, lettura dei valori nel formato salvato da WPBakery,
 * resa degli elementi con contenuti personalizzati, motore dei modelli, sicurezza dei testi.
 */

$mo_wp_dir = rtrim( $argv[1] ?? '', '/' );
if ( ! $mo_wp_dir || ! is_file( $mo_wp_dir . '/wp-load.php' ) ) {
	fwrite( STDERR, "Indica la cartella di WordPress.\n" );
	exit( 2 );
}
$_SERVER['HTTP_HOST']   = '127.0.0.1:8080';
$_SERVER['REQUEST_URI'] = '/';
define( 'WP_USE_THEMES', false );

// Finto WPBakery: raccoglie le chiamate a vc_map per controllarle
$GLOBALS['mo_vc'] = array();
function vc_map( $def ) {
	$GLOBALS['mo_vc'][] = $def;
}
require $mo_wp_dir . '/wp-load.php';

$ok   = 0;
$fail = 0;
function check( $name, $cond, $info = '' ) {
	global $ok, $fail;
	if ( $cond ) {
		++$ok;
		echo "✔ {$name}\n";
	} else {
		++$fail;
		echo "✘ {$name}" . ( $info ? " — {$info}" : '' ) . "\n";
	}
}

if ( ! function_exists( 'mo_blocks' ) ) {
	echo "✘ Il plugin MoveOn Blocks non è attivo in questo WordPress\n";
	exit( 1 );
}

/* 1) Campi per WPBakery */
do_action( 'vc_before_init' );
check( 'WPBakery: registrati 8 elementi', 8 === count( $GLOBALS['mo_vc'] ), (string) count( $GLOBALS['mo_vc'] ) );
$tipi = array( 'textfield', 'textarea', 'attach_image', 'dropdown', 'param_group' );
$err  = array();
foreach ( $GLOBALS['mo_vc'] as $el ) {
	if ( empty( $el['base'] ) || empty( $el['name'] ) || 'MoveOn' !== ( $el['category'] ?? '' ) ) {
		$err[] = 'elemento senza base/nome/categoria';
	}
	$nomi = array();
	foreach ( $el['params'] as $p ) {
		if ( ! in_array( $p['type'], $tipi, true ) ) {
			$err[] = "{$el['base']}.{$p['param_name']}: tipo {$p['type']}";
		}
		if ( in_array( $p['param_name'], $nomi, true ) ) {
			$err[] = "{$el['base']}.{$p['param_name']}: nome ripetuto";
		}
		$nomi[] = $p['param_name'];
		if ( ! preg_match( '/^[a-z0-9_]+$/', $p['param_name'] ) ) {
			$err[] = "{$el['base']}.{$p['param_name']}: nome non valido";
		}
		if ( 'dropdown' === $p['type'] && ! in_array( $p['std'], array_values( $p['value'] ), true ) ) {
			$err[] = "{$el['base']}.{$p['param_name']}: valore iniziale non tra le scelte";
		}
		if ( 'param_group' === $p['type'] ) {
			$dec = json_decode( urldecode( $p['value'] ), true );
			if ( ! is_array( $dec ) || ! $dec ) {
				$err[] = "{$el['base']}.{$p['param_name']}: valore iniziale dell'elenco non leggibile";
			}
			foreach ( $p['params'] as $sp ) {
				if ( ! in_array( $sp['type'], $tipi, true ) || 'param_group' === $sp['type'] ) {
					$err[] = "{$el['base']}.{$p['param_name']}.{$sp['param_name']}: tipo {$sp['type']}";
				}
			}
		}
	}
}
check( 'WPBakery: campi definiti correttamente', ! $err, implode( '; ', $err ) );

/* 2) Ogni elemento, senza attributi, mostra il contenuto del prototipo senza segnaposto rimasti */
foreach ( array_keys( mo_blocks() ) as $k ) {
	$html = do_shortcode( '[mo_' . $k . ']' );
	check( "Elemento mo_{$k}: si genera", strlen( $html ) > 200 && false === strpos( $html, '{{' ) && false !== strpos( $html, 'data-mo-block=' ), strlen( $html ) . ' caratteri' );
}

/* 3) Valori nel formato salvato da WPBakery */
check( 'Virgolette e parentesi salvate da WPBakery', 'Il "nostro" [studio]' === mo_text( 'Il ``nostro`` `{`studio`}`' ) );
check( 'A capo salvati come <br />', array( 'Riga uno', 'riga due' ) === mo_lines( 'Riga uno<br />riga due' ) );
check( 'A capo con il simbolo |', array( 'Parliamo del', 'tuo progetto.' ) === mo_lines( 'Parliamo del | tuo progetto.' ) );
$servizi = rawurlencode( wp_json_encode( array(
	array( 'nome' => 'Video', 'beneficio' => 'Storie che si ricordano.', 'voci' => "Spot\nReel", 'colore' => 'navy', 'illustrazione' => 'social', 'parola_sfondo' => 'Video' ),
	array( 'nome' => 'Foto', 'beneficio' => 'Immagini nitide.', 'voci' => 'Prodotto', 'colore' => 'blu', 'illustrazione' => 'inesistente' ),
) ) );
$html = do_shortcode( '[mo_servizi servizi="' . $servizi . '" pulsante_testo="-"]' );
check( 'Servizi personalizzati: 2 schede', 2 === substr_count( $html, 'data-name=' ), (string) substr_count( $html, 'data-name=' ) );
check( 'Servizi: colore della scheda e voci', false !== strpos( $html, 'mo-svc-panel mo-t-navy' ) && false !== strpos( $html, '<li>Reel</li>' ) );
check( 'Servizi: illustrazione sconosciuta → illustrazione di riserva', false !== strpos( $html, 'data-art="identita"' ) );
check( 'Il trattino nasconde il pulsante', false === strpos( $html, 'mo-btn-accent' ) );
check( 'Contatore dei servizi aggiornato', false !== strpos( $html, '1 / 2' ) );

/* 4) Sicurezza: i testi dei campi non possono inserire codice */
$html = do_shortcode( '[mo_hero testo="<script>alert(1)</script>Ciao"]' );
check( 'I testi vengono resi sicuri (niente <script>)', false === strpos( $html, '<script>alert' ) && false !== strpos( $html, '&lt;script&gt;' ) );

/* 5) Hero: parola sottolineata e righe */
$html = do_shortcode( '[mo_hero titolo="Idee | che restano." parola="restano."]' );
check( 'Hero: due righe e parola sottolineata', 2 === substr_count( $html, 'mo-hl-line' ) && 1 === substr_count( $html, 'mo-hw-mark' ) );

/* 6) Pulizia dei paragrafi vuoti tra le righe: via quelli vuoti, restano quelli con una classe (es. messaggio del modulo) */
$pul = mo_pulisci_contenuto( '<div class="vc_row">A</div><p></p><p>&nbsp;</p><p> <br /> </p><p class="mo-form-msg"></p><p>testo</p>' );
check( 'Paragrafi vuoti tolti, messaggio del modulo e testi conservati', '<div class="vc_row">A</div><p class="mo-form-msg"></p><p>testo</p>' === $pul, $pul );

/* 7) Immagini scelte dalla Libreria media */
check( 'Progetti: riquadro della copertina (immagine in evidenza) attivo', current_theme_supports( 'post-thumbnails', MO_CPT ) && post_type_supports( MO_CPT, 'thumbnail' ) );
$jpg = mo_importa_immagine( 'contatti-lettore.jpg', 'Foto di prova' );
$html = do_shortcode( '[mo_servizi servizi="' . rawurlencode( wp_json_encode( array( array( 'nome' => 'Con foto', 'voci' => 'A', 'immagine' => (string) $jpg, 'illustrazione' => 'web' ) ) ) ) . '"]' );
check( 'Servizio con foto: la foto prende il posto dell’illustrazione', $jpg && false !== strpos( $html, 'mo-svc-img' ) && false === strpos( $html, 'data-art="web"' ) && false !== strpos( $html, wp_basename( (string) wp_get_attachment_url( $jpg ) ) ) );
$up  = wp_upload_dir();
$svg = $up['path'] . '/mo-prova-icona.svg';
file_put_contents( $svg, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32"><rect width="48" height="32" fill="#2563eb"/></svg>' );
$sid = wp_insert_attachment( array( 'post_mime_type' => 'image/svg+xml', 'post_title' => 'Icona SVG di prova', 'post_status' => 'inherit' ), $svg );
$si  = mo_image( $sid );
check( 'Immagine SVG: indirizzo e misure lette dal file', $si && str_ends_with( $si['url'], '.svg' ) && 48 === $si['w'] && 32 === $si['h'], wp_json_encode( $si ) );
$html = do_shortcode( '[mo_chi_siamo motivi="' . rawurlencode( wp_json_encode( array( array( 'titolo' => 'Uno', 'testo' => 'x', 'icona' => 'stella', 'icona_img' => (string) $sid ) ) ) ) . '"]' );
check( 'Motivo con icona personalizzata', false !== strpos( $html, 'mo-reason-img' ) && false !== strpos( $html, 'mo-prova-icona.svg' ) );
$html = do_shortcode( '[mo_chi_siamo idea_immagine="' . $sid . '"]' );
check( 'Immagine dell’idea al posto del cubo (anche SVG)', false !== strpos( $html, 'mo-idea-img' ) && false === strpos( $html, 'mo-box-svg' ) );

/* 8) Telefono e WhatsApp */
check( 'Telefono senza prefisso → +39', 'tel:+393331234567' === mo_tel_href( '333 123 4567' ) );
check( 'WhatsApp da 0039', 'https://wa.me/393331234567' === mo_wa_href( '0039 333 1234567' ) );

echo "\n{$ok}/" . ( $ok + $fail ) . " controlli superati\n";
exit( $fail ? 1 : 0 );
