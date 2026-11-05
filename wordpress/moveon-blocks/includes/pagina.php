<?php
/**
 * Modello di pagina "MoveOn · pagina intera", header/footer del prototipo, stile e animazioni.
 */

defined( 'ABSPATH' ) || exit;

const MO_TEMPLATE = 'moveon-pagina-intera';

/* ---------------- Modello di pagina (Attributi pagina → Template) ---------------- */

add_filter(
	'theme_page_templates',
	function ( $templates ) {
		$templates[ MO_TEMPLATE ] = 'MoveOn · pagina intera';
		return $templates;
	}
);

/** Questa pagina usa il modello MoveOn? */
function mo_is_page(): bool {
	return is_singular( 'page' ) && MO_TEMPLATE === get_page_template_slug( get_queried_object_id() );
}

/** La pagina contiene elementi MoveOn (anche con un altro modello)? */
function mo_has_blocks(): bool {
	if ( ! is_singular() ) {
		return false;
	}
	$post = get_post( get_queried_object_id() );
	return $post && false !== strpos( (string) $post->post_content, '[mo_' );
}

add_filter(
	'template_include',
	function ( $template ) {
		return mo_is_page() ? MOVEON_DIR . 'includes/modello-pagina.php' : $template;
	},
	99
);

/* Sulle pagine MoveOn WordPress non aggiunge paragrafi automatici attorno agli elementi
   (i blocchi di testo di WPBakery fanno già i loro paragrafi). */
add_action(
	'wp',
	function () {
		if ( mo_is_page() ) {
			remove_filter( 'the_content', 'wpautop' );
		}
	}
);

add_filter(
	'body_class',
	function ( $classes ) {
		if ( mo_is_page() ) {
			$classes[] = 'mo-page';
		}
		return $classes;
	}
);

/* ---------------- Menu principale (Aspetto → Menu) ---------------- */

add_action(
	'after_setup_theme',
	function () {
		register_nav_menus( array( 'moveon-principale' => 'MoveOn · menu principale' ) );
	},
	20
);

/** Voci del menu: dal menu assegnato in Aspetto → Menu, altrimenti quelle del prototipo. */
function mo_menu_items(): array {
	$items     = array();
	$locations = get_nav_menu_locations();
	if ( ! empty( $locations['moveon-principale'] ) ) {
		foreach ( (array) wp_get_nav_menu_items( $locations['moveon-principale'] ) as $it ) {
			if ( (int) $it->menu_item_parent ) {
				continue; // niente sottomenu: il menu del prototipo è a un solo livello
			}
			$url     = (string) $it->url;
			$frag    = (string) wp_parse_url( $url, PHP_URL_FRAGMENT );
			$items[] = array( 'testo' => $it->title, 'href' => $url, 'nav' => $frag );
		}
		return $items;
	}
	foreach ( array( 'Chi siamo' => 'chi-siamo', 'Servizi' => 'servizi', 'Portfolio' => 'portfolio', 'Contatti' => 'contatti' ) as $t => $a ) {
		$items[] = array( 'testo' => $t, 'href' => '#' . $a, 'nav' => $a );
	}
	return $items;
}

/* ---------------- Header e footer ---------------- */

function mo_logo_data(): array {
	$s = mo_settings();
	return array(
		'logo_scuro'  => mo_image( $s['logo_scuro_id'], 'logo_scuro', 'medium_large' ),
		'logo_chiaro' => mo_image( $s['logo_chiaro_id'], 'logo_chiaro', 'medium_large' ),
	);
}

function mo_header_html(): string {
	$s   = mo_settings();
	$cta = trim( (string) $s['header_cta'] );
	return MO_Tpl::render(
		'header',
		array_merge(
			mo_logo_data(),
			array(
				'home_url' => home_url( '/' ),
				'menu'     => mo_menu_items(),
				'cta'      => '' !== $cta ? array( 'testo' => $cta, 'href' => mo_href( $s['cta_link'] ) ) : null,
			)
		)
	);
}

function mo_footer_html(): string {
	$s = mo_settings();
	return MO_Tpl::render(
		'footer',
		array_merge(
			mo_logo_data(),
			array(
				'claim'        => $s['claim'],
				'anno'         => wp_date( 'Y' ),
				'legali'       => $s['legali'],
				'privacy_url'  => $s['privacy_url'],
				'cookie_url'   => $s['cookie_url'],
				'cta'          => trim( (string) $s['mobile_cta'] ) !== '' ? array( 'href' => mo_href( $s['cta_link'] ) ) : null,
				'mobile_testo' => $s['mobile_cta'],
				'tel_href'     => mo_tel_href( $s['telefono'] ),
				'wa_href'      => mo_wa_href( $s['whatsapp'] ),
			)
		)
	);
}

/* ---------------- Stile e animazioni ---------------- */

add_action(
	'wp_enqueue_scripts',
	function () {
		if ( ! mo_is_page() && ! mo_has_blocks() ) {
			return;
		}
		$v   = MOVEON_VERSION;
		$css = MOVEON_DIR . 'assets/css/moveon.css';
		wp_enqueue_style( 'moveon-fonts', MOVEON_URL . 'assets/css/fonts.css', array(), $v );
		wp_enqueue_style( 'moveon', MOVEON_URL . 'assets/css/moveon.css', array( 'moveon-fonts' ), $v . '-' . ( file_exists( $css ) ? filemtime( $css ) : 0 ) );

		$js = MOVEON_URL . 'assets/js/vendor/';
		wp_enqueue_script( 'moveon-gsap', $js . 'gsap.min.js', array(), '3.15.0', true );
		wp_enqueue_script( 'moveon-scrolltrigger', $js . 'ScrollTrigger.min.js', array( 'moveon-gsap' ), '3.15.0', true );
		wp_enqueue_script( 'moveon-flip', $js . 'Flip.min.js', array( 'moveon-gsap' ), '3.15.0', true );
		wp_enqueue_script( 'moveon-draggable', $js . 'Draggable.min.js', array( 'moveon-gsap' ), '3.15.0', true );
		wp_enqueue_script( 'moveon-lenis', $js . 'lenis.min.js', array(), '1.3.27', true );
		$main = MOVEON_DIR . 'assets/js/moveon.js';
		wp_enqueue_script( 'moveon', MOVEON_URL . 'assets/js/moveon.js', array( 'moveon-scrolltrigger', 'moveon-flip', 'moveon-draggable', 'moveon-lenis' ), $v . '-' . ( file_exists( $main ) ? filemtime( $main ) : 0 ), true );
	},
	20
);

/**
 * Sulle pagine MoveOn, di serie, gli stili e gli script del tema (Porto) non vengono caricati:
 * header e footer sono quelli del prototipo e così niente interferisce con il design.
 * Si riattivano da MoveOn → Impostazioni → "Carica anche stili e script del tema".
 */
function mo_dequeue_theme_assets(): void {
	if ( ! mo_is_page() || ! empty( mo_settings()['carica_tema'] ) ) {
		return;
	}
	// Stili globali del tema (theme.json): impostano caratteri e colori di titoli e testi
	wp_dequeue_style( 'global-styles' );
	wp_dequeue_style( 'classic-theme-styles' );
	$roots = array_unique( array( get_template_directory_uri(), get_stylesheet_directory_uri() ) );
	foreach ( array( wp_styles(), wp_scripts() ) as $deps ) {
		foreach ( (array) $deps->queue as $handle ) {
			if ( 0 === strpos( $handle, 'moveon' ) ) {
				continue;
			}
			$src = isset( $deps->registered[ $handle ] ) ? (string) $deps->registered[ $handle ]->src : '';
			$via = false;
			foreach ( $roots as $root ) {
				if ( '' !== $src && 0 === strpos( $src, $root ) ) {
					$via = true; // file del tema (Porto o tema figlio)
				}
			}
			// Stili e script dei componenti di Porto (es. Porto Functionality, stili generati per pagina in uploads/porto_styles)
			if ( false !== stripos( $handle, 'porto' ) || false !== stripos( $src, 'porto' ) ) {
				$via = true;
			}
			if ( $via ) {
				$deps->dequeue( $handle );
			}
		}
	}
	// La griglia di WPBakery (colonne delle tue righe) deve restare: se Porto l'aveva sostituita, si ricarica quella originale
	if ( wp_style_is( 'js_composer_front', 'registered' ) && ! wp_style_is( 'js_composer_front', 'enqueued' ) ) {
		wp_enqueue_style( 'js_composer_front' );
	}
}
add_action( 'wp_enqueue_scripts', 'mo_dequeue_theme_assets', 9999 );
add_action( 'wp_print_styles', 'mo_dequeue_theme_assets', 9999 );
add_action( 'wp_print_footer_scripts', 'mo_dequeue_theme_assets', 1 );

/* ---------------- Senza WPBakery (es. per prova): righe e colonne mostrate comunque ---------------- */

add_action(
	'init',
	function () {
		if ( defined( 'WPB_VC_VERSION' ) ) {
			return;
		}
		// Stessa struttura HTML di WPBakery, così le prove senza WPBakery sono realistiche
		$classe = function ( $atts ) {
			return is_array( $atts ) && ! empty( $atts['el_class'] ) ? ' ' . esc_attr( $atts['el_class'] ) : '';
		};
		$righe  = function ( $atts, $content = '' ) use ( $classe ) {
			$full = is_array( $atts ) && ! empty( $atts['full_width'] );
			$data = $full ? ' data-vc-full-width="true" data-vc-full-width-init="true" data-vc-stretch-content="true"' : '';
			return '<div' . $data . ' class="vc_row wpb_row vc_row-fluid' . ( $full ? ' vc_row-no-padding' : '' ) . $classe( $atts ) . '">' . do_shortcode( $content ) . '</div>' . ( $full ? '<div class="vc_row-full-width vc_clearfix"></div>' : '' );
		};
		$colonne = function ( $atts, $content = '' ) use ( $classe ) {
			return '<div class="wpb_column vc_column_container vc_col-sm-12' . $classe( $atts ) . '"><div class="vc_column-inner"><div class="wpb_wrapper">' . do_shortcode( $content ) . '</div></div></div>';
		};
		foreach ( array( 'vc_row' => $righe, 'vc_row_inner' => $righe, 'vc_column' => $colonne, 'vc_column_inner' => $colonne ) as $tag => $fn ) {
			if ( ! shortcode_exists( $tag ) ) {
				add_shortcode( $tag, $fn );
			}
		}
		if ( ! shortcode_exists( 'vc_column_text' ) ) {
			add_shortcode(
				'vc_column_text',
				function ( $atts, $content = '' ) {
					return '<div class="mo-vc-text">' . wpautop( do_shortcode( $content ) ) . '</div>';
				}
			);
		}
	},
	20
);
