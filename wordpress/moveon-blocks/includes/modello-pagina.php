<?php
/**
 * Modello "MoveOn · pagina intera": header, contenuto della pagina (WPBakery), footer.
 * Header, footer e le altre parti fisse si modificano da MoveOn → Modelli HTML.
 */

defined( 'ABSPATH' ) || exit;
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<script>
/* Prima che la pagina compaia: classe "mo-js" e breve caricamento iniziale
   (non con "riduci movimento" e non dentro l'editor di WPBakery). Si chiude da solo entro 2,4 s. */
(function(){var d=document.documentElement;d.classList.add('mo-js');if(!/[?&]vc_editable=true/.test(location.search)&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('mo-is-loading');setTimeout(function(){d.classList.remove('mo-is-loading')},2400)}})();
</script>
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php
wp_body_open();
echo MO_Tpl::render( 'parti/caricamento' ); // phpcs:ignore WordPress.Security.EscapeOutput -- modello HTML
echo mo_header_html(); // phpcs:ignore WordPress.Security.EscapeOutput
?>
<main id="mo-main" class="mo-content">
<?php
while ( have_posts() ) {
	the_post();
	the_content();
}
?>
</main>
<?php
echo mo_footer_html(); // phpcs:ignore WordPress.Security.EscapeOutput
echo MO_Tpl::render( 'parti/scheda-progetto' ); // phpcs:ignore WordPress.Security.EscapeOutput
wp_footer();
?>
</body>
</html>
