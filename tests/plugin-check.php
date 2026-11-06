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
check( 'WPBakery: registrati 9 elementi', 9 === count( $GLOBALS['mo_vc'] ), (string) count( $GLOBALS['mo_vc'] ) );
$tipi = array( 'textfield', 'textarea', 'attach_image', 'dropdown', 'param_group', 'colorpicker' );
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

/* 8) Immagine di sfondo delle sezioni */
$html = do_shortcode( '[mo_hero sfondo_img="' . $jpg . '" sfondo_opacita="15" sfondo_dimensione="auto" sfondo_posizione="100% 50%"]' );
check( 'Sfondo: livello con opacità, dimensione e posizione', false !== strpos( $html, 'class="mo-bg mo-bg--foto"' ) && false !== strpos( $html, 'opacity:0.15' ) && false !== strpos( $html, 'background-size:auto' ) && false !== strpos( $html, 'background-position:100% 50%' ) );
check( 'Sfondo: niente livello se non c’è l’immagine', false === strpos( do_shortcode( '[mo_hero]' ), 'mo-bg' ) );
check( 'WPBakery: scheda Sfondo in tutti i 9 elementi', 9 === count( array_filter( $GLOBALS['mo_vc'], function ( $el ) { return in_array( 'sfondo_img', array_column( $el['params'], 'param_name' ), true ); } ) ) );

/* 9) Telefono e WhatsApp */
check( 'Telefono senza prefisso → +39', 'tel:+393331234567' === mo_tel_href( '333 123 4567' ) );
check( 'WhatsApp da 0039', 'https://wa.me/393331234567' === mo_wa_href( '0039 333 1234567' ) );

/* 10) Progetti: pagine, carosello, immagini nel pannello */
check( 'Progetti: pagine pubbliche in /progetti/', is_post_type_viewable( MO_CPT ) && str_ends_with( mo_progetti_url(), '/progetti/' ), mo_progetti_url() );
$forno = get_posts( array( 'post_type' => MO_CPT, 'name' => 'forno-aurora', 'numberposts' => 1 ) )[0] ?? null;
check( 'Progetto di prova presente (Forno Aurora)', (bool) $forno );
if ( $forno ) {
	$dati = mo_progetto_dati( $forno );
	check( 'Progetto: indirizzo della sua pagina e 3 immagini', str_contains( $dati['url'], '/progetti/forno-aurora/' ) && 3 === count( $dati['galleria'] ), $dati['url'] . ' · ' . count( $dati['galleria'] ) );
	$html = do_shortcode( '[mo_carosello]' );
	$n    = count( mo_progetti_in_evidenza() );
	check( 'Carosello: una card per progetto, ognuna porta alla sua pagina', $n === substr_count( $html, 'class="mo-car-card"' ) && $n === substr_count( $html, '<a class="mo-car-card" href="' . home_url( '/progetti/' ) ), $n . ' / ' . substr_count( $html, 'class="mo-car-card"' ) );
	check( 'Carosello: filtri e pulsante verso la pagina Progetti', str_contains( $html, 'mo-car-filter' ) && str_contains( $html, 'href="' . mo_progetti_url() . '"' ) );
	$html = do_shortcode( '[mo_carosello filtri="no" pulsante="-" titolo="-"]' );
	check( 'Carosello: filtri, pulsante e titolo si possono nascondere', ! str_contains( $html, 'mo-car-filter' ) && ! str_contains( $html, 'mo-car-allbtn' ) && ! str_contains( $html, 'mo-statement' ) );
	// Immagine verticale del carosello al posto della copertina
	update_post_meta( $forno->ID, '_mo_carosello_img', $jpg );
	$html = do_shortcode( '[mo_carosello]' );
	check( 'Carosello: usa l’immagine del carosello se c’è', str_contains( $html, wp_basename( (string) wp_get_attachment_image_url( $jpg, 'large' ) ) ) );
	delete_post_meta( $forno->ID, '_mo_carosello_img' );
	// Pagina del progetto
	$html = mo_progetto_pagina_html( $forno );
	check( 'Pagina progetto: titolo, testi, racconto, 3 immagini, precedente e successivo', str_contains( $html, '<h1 class="mo-prj-title">Forno Aurora</h1>' ) && 3 === substr_count( $html, 'mo-prj-block mo-reveal' ) && str_contains( $html, 'come è nato' ) && 3 === substr_count( $html, 'class="mo-prj-img' ) && str_contains( $html, 'mo-prj-near--prec' ) && str_contains( $html, 'mo-prj-near--succ' ) );
	$html = mo_progetti_archivio_html();
	check( 'Pagina Progetti: tutte le card e i filtri', $n === substr_count( $html, 'class="mo-prjs-card"' ) && str_contains( $html, 'mo-prjs-filter' ) );
	// Riquadro nel pannello: immagine del carosello e immagini del progetto con Sostituisci e ×
	ob_start();
	mo_progetto_metabox( $forno );
	$box = (string) ob_get_clean();
	check( 'Pannello: immagine del carosello e immagini con Sostituisci e ×', str_contains( $box, 'name="mo_carosello_img"' ) && 3 === substr_count( $box, 'mo-galleria-voce' ) && 3 === substr_count( $box, 'mo-galleria-sostituisci' ) && 3 === substr_count( $box, 'mo-galleria-togli' ) && str_contains( $box, 'mo-aggiungi-galleria' ) );
	// Salvataggio: nuovo ordine, un'immagine tolta, immagine del carosello scelta
	$prima = get_post_meta( $forno->ID, '_mo_galleria', true );
	$ids   = array_map( 'intval', explode( ',', $prima ) );
	wp_set_current_user( 1 );
	$_POST = array(
		'mo_progetto_nonce' => wp_create_nonce( 'mo_progetto_salva' ),
		'mo_area'           => 'branding',
		'mo_tipo'           => get_post_meta( $forno->ID, '_mo_tipo', true ),
		'mo_richiesta'      => get_post_meta( $forno->ID, '_mo_richiesta', true ),
		'mo_lavoro'         => get_post_meta( $forno->ID, '_mo_lavoro', true ),
		'mo_risultato'      => get_post_meta( $forno->ID, '_mo_risultato', true ),
		'mo_galleria'       => $ids[2] . ',' . $ids[0],
		'mo_carosello_img'  => (string) $jpg,
		'mo_evidenza'       => '1',
	);
	do_action( 'save_post_' . MO_CPT, $forno->ID );
	check( 'Pannello: salva ordine e immagini tolte, e l’immagine del carosello', $ids[2] . ',' . $ids[0] === get_post_meta( $forno->ID, '_mo_galleria', true ) && (int) $jpg === (int) get_post_meta( $forno->ID, '_mo_carosello_img', true ) );
	$_POST['mo_galleria'] = $prima;
	$_POST['mo_carosello_img'] = '';
	do_action( 'save_post_' . MO_CPT, $forno->ID );
	check( 'Pannello: immagine del carosello rimossa', '' === get_post_meta( $forno->ID, '_mo_carosello_img', true ) && $prima === get_post_meta( $forno->ID, '_mo_galleria', true ) );
	$_POST = array();
	wp_set_current_user( 0 );
	// Progetto nascosto: niente pagina per i visitatori
	$codice = function ( $url ) {
		$ctx = stream_context_create( array( 'http' => array( 'ignore_errors' => true, 'timeout' => 10 ) ) );
		@file_get_contents( $url, false, $ctx ); // phpcs:ignore
		return isset( $http_response_header[0] ) && preg_match( '#\s(\d{3})\s#', $http_response_header[0], $m ) ? (int) $m[1] : 0;
	};
	$url = get_permalink( $forno );
	check( 'Pagina del progetto visibile', 200 === $codice( $url ), $url );
	update_post_meta( $forno->ID, '_mo_evidenza', '0' );
	check( 'Progetto nascosto: la sua pagina non si apre (404)', 404 === $codice( $url ) );
	update_post_meta( $forno->ID, '_mo_evidenza', '1' );
}
check( 'Link alle sezioni: nelle pagine normali restano «#sezione»', '#contatti' === mo_link_sezione( '#contatti' ) );

/* 11) Sfondi delle pagine dei progetti (MoveOn → Impostazioni) */
$sp = mo_sfondo_pulito( array( 'sfondo_colore' => 'red;}body{x', 'sfondo_testi' => 'viola', 'sfondo_opacita' => 300, 'sfondo_dimensione' => 'enorme', 'sfondo_img' => 999999, 'sfumatura' => 5000 ) );
check( 'Sfondi: valori sbagliati scartati', '' === $sp['sfondo_colore'] && '' === $sp['sfondo_testi'] && 30 === $sp['sfondo_opacita'] && 'cover' === $sp['sfondo_dimensione'] && 0 === $sp['sfondo_img'] && 600 === $sp['sfumatura'], wp_json_encode( $sp ) );
$di_serie = $forno ? mo_progetto_pagina_html( $forno ) : '';
check( 'Sfondi: di serie nessun livello in più', $forno && ! str_contains( $di_serie, 'mo-bg' ) );
update_option( 'moveon_sfondi', array(
	'progetto_testa' => array( 'sfondo_colore' => '#f5efe6', 'sfondo_testi' => 'scuri', 'sfondo_img' => $jpg, 'sfondo_opacita' => 25 ),
	'progetto_corpo' => array( 'sfondo_colore' => '#1e293b', 'sfondo_testi' => 'chiari' ),
	'progetti_testa' => array( 'sfondo_img' => $jpg, 'sfondo_opacita' => 40, 'sfondo_dimensione' => 'contain', 'sfondo_posizione' => '50% 0%', 'sfumatura' => 160 ),
	'progetti_corpo' => array( 'sfondo_colore' => '#fef3c7', 'sfondo_testi' => 'scuri' ),
) );
if ( $forno ) {
	$html = mo_progetto_pagina_html( $forno );
	$testa = substr( $html, 0, (int) strpos( $html, 'mo-prj-body' ) );
	$corpo = substr( $html, (int) strpos( $html, 'mo-prj-body' ) );
	check( 'Sfondi: parte alta del progetto con colore, testi scuri e immagine al 25%', str_contains( $testa, 'background-color:#f5efe6' ) && str_contains( $testa, 'data-testi="scuri"' ) && str_contains( $testa, 'opacity:0.25' ) );
	check( 'Sfondi: contenuto del progetto con colore e testi chiari (dietro anche la copertina)', str_contains( $corpo, 'background-color:#1e293b' ) && str_contains( $corpo, 'data-testi="chiari"' ) && strpos( $corpo, 'mo-bg--colore' ) < strpos( $corpo, 'mo-prj-cover' ) );
	$altro = get_posts( array( 'post_type' => MO_CPT, 'name' => 'hotel-belvedere', 'numberposts' => 1 ) )[0] ?? null;
	check( 'Sfondi: valgono per tutti i progetti', $altro && str_contains( mo_progetto_pagina_html( $altro ), 'background-color:#f5efe6' ) );
}
$html = mo_progetti_archivio_html();
check( 'Sfumatura: 160 px in fondo alla parte alta, verso il colore dell’elenco', str_contains( $html, 'mo-prj-head mo-prjs-head mo-sfuma' ) && str_contains( $html, 'style="--mo-sfumatura:160px;--mo-fondo-contenuto:#fef3c7"' ) );
check( 'Pagina Progetti: i filtri stanno sopra le card, non nella parte alta', strpos( $html, 'mo-prjs-filter' ) > strpos( $html, 'mo-prjs-body' ) && strpos( $html, 'mo-prjs-filter' ) < strpos( $html, 'mo-prjs-grid' ) );
check( 'Sfumatura: senza valore nessuna sfumatura', $forno && ! str_contains( mo_progetto_pagina_html( $forno ), 'mo-sfuma' ) );
check( 'Sfondi: pagina Progetti, immagine «intera» in alto e colore dell’elenco', str_contains( $html, 'background-size:contain' ) && str_contains( $html, 'background-position:50% 0%' ) && str_contains( $html, 'opacity:0.4' ) && str_contains( $html, 'background-color:#fef3c7' ) );
$pagina = $forno ? (string) @file_get_contents( get_permalink( $forno ) ) : ''; // phpcs:ignore
check( 'Sfondi: parte alta chiara → header con logo e testi scuri', str_contains( $pagina, 'class="mo-testa-chiara"' ) );
$arch = (string) @file_get_contents( mo_progetti_url() ); // phpcs:ignore
check( 'Sfondi: parte alta scura → header come sempre', ! str_contains( $arch, 'mo-testa-chiara' ) && str_contains( $arch, 'mo-bg--foto' ) );
delete_option( 'moveon_sfondi' );
if ( ! function_exists( 'mo_admin_impostazioni' ) ) {
	require_once MOVEON_DIR . 'includes/admin.php'; // il pannello si carica solo nella bacheca
	require_once ABSPATH . 'wp-admin/includes/template.php';
}
ob_start();
mo_admin_impostazioni();
$imp = (string) ob_get_clean();
check( 'Impostazioni: 4 zone di sfondo con colore, testi, immagine, opacità, dimensione, posizione', 4 === substr_count( $imp, 'class="mo-sfondo-zona"' ) && 4 === substr_count( $imp, '[sfondo_opacita]' ) && 4 === substr_count( $imp, 'class="mo-colore"' ) && 4 === substr_count( $imp, '[sfondo_posizione]' ) );
check( 'Impostazioni: sfumatura in basso solo per le due parti alte', 2 === substr_count( $imp, '[sfumatura]' ) );

echo "\n{$ok}/" . ( $ok + $fail ) . " controlli superati\n";
exit( $fail ? 1 : 0 );
