<?php
/**
 * Solo per il WordPress di prova: simula le regole tipiche di Porto e WPBakery che possono
 * interferire con le pagine MoveOn (colori dei testi, campi bianchi, link al passaggio del mouse,
 * margini e spazi delle righe, overflow nascosto). Viene copiato in wp-content/mu-plugins.
 */
$mo_ostile = '
body{background:#fff;color:#777;font-family:"Open Sans",sans-serif;font-size:14px;line-height:24px}
p{color:#777;margin:0 0 20px;line-height:24px}
h1,h2,h3,h4,h5,h6{color:#222;letter-spacing:-.05em;margin:0 0 14px}
a{color:#0088cc} a:hover,a:focus{color:#00a1f5;text-decoration:underline}
input[type="text"],input[type="email"],input[type="tel"],textarea,select{background:#fff;color:#777;border:1px solid #ccc;border-radius:0;box-shadow:inset 0 1px 1px rgba(0,0,0,.075);height:auto;padding:6px 12px;font-size:14px}
ul,ol{padding-left:2.5em;margin:0 0 20px} li{line-height:24px}
strong{color:#222}
.vc_row{margin-left:-15px;margin-right:-15px} .vc_row.wpb_row{margin-bottom:35px}
.vc_row[data-vc-full-width]{overflow:hidden;transition:opacity .5s}
.vc_column_container>.vc_column-inner{padding-left:15px;padding-right:15px;padding-top:35px}
.wpb_wrapper>*{margin-bottom:35px}
button:hover{background:#0088cc;color:#fff}
.vc_row-full-width{margin-bottom:35px;height:1px}
p:empty{min-height:24px}
';
// 1) Foglio di stile "di Porto" (deve essere escluso dal plugin)
add_action( 'wp_enqueue_scripts', function () use ( $mo_ostile ) {
	$up = wp_upload_dir();
	@mkdir( $up['basedir'] . '/porto_styles', 0755, true );
	file_put_contents( $up['basedir'] . '/porto_styles/dynamic_style.css', 'html{outline:6px solid red}' . $mo_ostile );
	wp_enqueue_style( 'porto-dynamic-style', $up['baseurl'] . '/porto_styles/dynamic_style.css', array(), '1' );
}, 50 );
// 2) Le stesse regole scritte direttamente nella pagina, dopo il nostro CSS (non escludibili)
add_action( 'wp_head', function () use ( $mo_ostile ) {
	echo '<style id="tema-ostile">' . $mo_ostile . '</style>';
}, 999 );
// 3) Paragrafi vuoti tra una riga e l'altra (come può succedere dopo il salvataggio in WPBakery)
add_filter( 'the_content', function ( $html ) {
	return str_replace( '<div class="vc_row-full-width vc_clearfix"></div>', '<div class="vc_row-full-width vc_clearfix"></div><p>&nbsp;</p><p></p>', $html );
}, 50 );

