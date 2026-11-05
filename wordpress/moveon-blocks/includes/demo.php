<?php
/**
 * Strumenti: pagina demo, progetti di esempio, menu.
 */

defined( 'ABSPATH' ) || exit;

/** Copia un'immagine inclusa nel plugin nella Libreria media (una volta sola). */
function mo_importa_immagine( string $file, string $alt ): int {
	$found = get_posts(
		array(
			'post_type'   => 'attachment',
			'post_status' => 'inherit',
			'numberposts' => 1,
			'fields'      => 'ids',
			'meta_key'    => '_moveon_file', // phpcs:ignore WordPress.DB.SlowDBQuery
			'meta_value'  => $file, // phpcs:ignore WordPress.DB.SlowDBQuery
		)
	);
	if ( $found ) {
		return (int) $found[0];
	}
	$path = MOVEON_DIR . 'assets/img/' . $file;
	if ( ! is_readable( $path ) ) {
		return 0;
	}
	$up = wp_upload_bits( 'moveon-' . $file, null, (string) file_get_contents( $path ) );
	if ( ! empty( $up['error'] ) ) {
		return 0;
	}
	$type = wp_check_filetype( $up['file'] );
	$id   = wp_insert_attachment(
		array(
			'post_mime_type' => $type['type'],
			'post_title'     => $alt,
			'post_status'    => 'inherit',
		),
		$up['file']
	);
	if ( ! $id || is_wp_error( $id ) ) {
		return 0;
	}
	require_once ABSPATH . 'wp-admin/includes/image.php';
	wp_update_attachment_metadata( $id, wp_generate_attachment_metadata( $id, $up['file'] ) );
	update_post_meta( $id, '_wp_attachment_image_alt', $alt );
	update_post_meta( $id, '_moveon_file', $file );
	return (int) $id;
}

/** Gli 8 progetti di esempio del prototipo. Restituisce quanti ne ha creati. */
function mo_crea_progetti_esempio(): int {
	$creati = 0;
	foreach ( mo_defaults()['progetti'] as $i => $p ) {
		$esiste = get_posts(
			array(
				'post_type'   => MO_CPT,
				'post_status' => 'any',
				'numberposts' => 1,
				'fields'      => 'ids',
				'meta_key'    => '_moveon_demo', // phpcs:ignore WordPress.DB.SlowDBQuery
				'meta_value'  => $p['slug'], // phpcs:ignore WordPress.DB.SlowDBQuery
			)
		);
		if ( $esiste ) {
			continue;
		}
		$id = wp_insert_post(
			array(
				'post_type'   => MO_CPT,
				'post_status' => 'publish',
				'post_title'  => $p['nome'],
				'menu_order'  => $i + 1,
			)
		);
		if ( ! $id || is_wp_error( $id ) ) {
			continue;
		}
		update_post_meta( $id, '_moveon_demo', $p['slug'] );
		update_post_meta( $id, '_mo_area', $p['area'] );
		update_post_meta( $id, '_mo_tipo', $p['tipo'] );
		update_post_meta( $id, '_mo_richiesta', $p['richiesta'] );
		update_post_meta( $id, '_mo_lavoro', $p['lavoro'] );
		update_post_meta( $id, '_mo_risultato', '[Da inserire con i risultati reali del cliente]' );
		update_post_meta( $id, '_mo_evidenza', '1' );
		$img = mo_importa_immagine( 'portfolio-' . $p['slug'] . '.jpg', 'Copertina di esempio del progetto ' . $p['nome'] );
		if ( $img ) {
			set_post_thumbnail( $id, $img );
		}
		++$creati;
	}
	return $creati;
}

/** Menu dell'header con le 4 voci del prototipo, assegnato alla posizione "MoveOn · menu principale". */
function mo_crea_menu(): bool {
	$nome = 'MoveOn · menu principale';
	$menu = wp_get_nav_menu_object( $nome );
	$id   = $menu ? (int) $menu->term_id : (int) wp_create_nav_menu( $nome );
	if ( ! $id || is_wp_error( $id ) ) {
		return false;
	}
	if ( ! $menu ) {
		foreach ( array( 'Chi siamo' => '#chi-siamo', 'Servizi' => '#servizi', 'Portfolio' => '#portfolio', 'Contatti' => '#contatti' ) as $t => $url ) {
			wp_update_nav_menu_item(
				$id,
				0,
				array(
					'menu-item-title'  => $t,
					'menu-item-url'    => $url,
					'menu-item-status' => 'publish',
					'menu-item-type'   => 'custom',
				)
			);
		}
	}
	$loc                      = get_theme_mod( 'nav_menu_locations', array() );
	$loc['moveon-principale'] = $id;
	set_theme_mod( 'nav_menu_locations', $loc );
	return true;
}

/** Pagina demo con tutti gli elementi; facoltativamente impostata come home. */
function mo_crea_demo( bool $home ): array {
	$progetti = mo_crea_progetti_esempio();
	$menu     = mo_crea_menu();
	$id       = wp_insert_post(
		array(
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => 'Home MoveOn',
			'post_content' => mo_home_shortcodes(),
		)
	);
	if ( ! $id || is_wp_error( $id ) ) {
		return array();
	}
	update_post_meta( $id, '_wp_page_template', MO_TEMPLATE );
	update_post_meta( $id, '_wpb_vc_js_status', 'true' ); // WPBakery apre la pagina nel suo editor
	if ( $home ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $id );
	}
	return array( 'pagina' => $id, 'progetti' => $progetti, 'menu' => $menu, 'home' => $home );
}
