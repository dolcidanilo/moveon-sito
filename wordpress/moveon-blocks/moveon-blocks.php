<?php
/**
 * Plugin Name:       MoveOn Blocks
 * Description:       Le sezioni del sito MoveOn Studio come elementi WPBakery, con header, footer e animazioni del prototipo. Contenuti nei campi, HTML modificabile da MoveOn → Modelli HTML, stile con variabili CSS.
 * Version:           1.2.0
 * Requires at least: 6.2
 * Requires PHP:      8.1
 * Author:            MoveOn Studio
 * License:           GPL-2.0-or-later
 * Text Domain:       moveon-blocks
 *
 * Il codice PHP di questo plugin è solo il "motore": non serve modificarlo.
 * Per cambiare il sito usa i campi degli elementi WPBakery, MoveOn → Impostazioni,
 * MoveOn → Modelli HTML e il CSS (vedi MoveOn → Guida).
 */

defined( 'ABSPATH' ) || exit;

define( 'MOVEON_VERSION', '1.2.0' );
define( 'MOVEON_FILE', __FILE__ );
define( 'MOVEON_DIR', plugin_dir_path( __FILE__ ) );
define( 'MOVEON_URL', plugin_dir_url( __FILE__ ) );

require MOVEON_DIR . 'includes/template.php';
require MOVEON_DIR . 'includes/defaults.php';
require MOVEON_DIR . 'includes/helpers.php';
require MOVEON_DIR . 'includes/progetti.php';
require MOVEON_DIR . 'includes/pagine-progetti.php';
require MOVEON_DIR . 'includes/blocks.php';
require MOVEON_DIR . 'includes/pagina.php';
require MOVEON_DIR . 'includes/wpbakery.php';
require MOVEON_DIR . 'includes/contatti.php';
require MOVEON_DIR . 'includes/demo.php';
if ( is_admin() ) {
	require MOVEON_DIR . 'includes/admin.php';
}

/** Collegamento rapido "Impostazioni" nell'elenco dei plugin. */
add_filter(
	'plugin_action_links_' . plugin_basename( __FILE__ ),
	function ( $links ) {
		array_unshift( $links, '<a href="' . esc_url( admin_url( 'admin.php?page=moveon' ) ) . '">Impostazioni</a>' );
		return $links;
	}
);
