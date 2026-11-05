<?php
/**
 * Integrazione con WPBakery: gli 8 elementi in "Aggiungi elemento" (categoria MoveOn)
 * e un modello di pagina con tutte le sezioni.
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'vc_before_init',
	function () {
		if ( ! function_exists( 'vc_map' ) ) {
			return;
		}
		foreach ( mo_blocks() as $key => $b ) {
			vc_map(
				array(
					'name'                    => $b['name'],
					'base'                    => 'mo_' . $key,
					'description'             => $b['desc'],
					'category'                => 'MoveOn',
					'icon'                    => MOVEON_URL . 'assets/img/icona-elemento.svg',
					'show_settings_on_create' => false,
					'params'                  => $b['params'],
				)
			);
		}
	}
);

/** Contenuto della home completa (8 sezioni, ognuna in una riga senza margini). */
function mo_home_shortcodes(): string {
	$out = '';
	foreach ( array_keys( mo_blocks() ) as $key ) {
		$out .= '[vc_row full_width="stretch_row_content_no_spaces" el_class="mo-riga"][vc_column][mo_' . $key . '][/vc_column][/vc_row]'; // niente "a capo": WPBakery li trasformerebbe in elementi Testo vuoti
	}
	return $out;
}

/** Modello WPBakery "MoveOn · home completa" (finestra Modelli → Modelli predefiniti). */
add_action(
	'vc_load_default_templates_action',
	function () {
		if ( ! function_exists( 'vc_add_default_templates' ) ) {
			return;
		}
		vc_add_default_templates(
			array(
				'name'         => 'MoveOn · home completa',
				'weight'       => 99,
				'custom_class' => 'moveon-home',
				'content'      => mo_home_shortcodes(),
			)
		);
	}
);
