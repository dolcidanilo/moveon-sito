<?php
/**
 * Strumenti per passare dalla home unica alle pagine dedicate:
 * - «Crea le pagine»: Chi sono, Servizi (con una pagina per servizio) e Contatti, già composte con gli elementi MoveOn,
 *   più il menu con i servizi a tendina;
 * - «Alleggerisci la home»: «Chi siamo» lungo → «Chi sono» breve, e la sezione «Non sai da dove partire?» dopo i Servizi.
 * Niente viene cancellato: le pagine esistenti non si toccano e la home precedente resta nelle Revisioni di WordPress.
 */

defined( 'ABSPATH' ) || exit;

/** Shortcode di un elemento con i suoi testi (i gruppi come li salva WPBakery). */
function mo_shortcode( string $key, array $atts ): string {
	$out = '[mo_' . $key;
	foreach ( $atts as $k => $v ) {
		$v    = is_array( $v ) ? rawurlencode( wp_json_encode( $v ) ) : str_replace( array( '"', '[', ']' ), array( '``', '`{`', '`}`' ), (string) $v );
		$out .= ' ' . $k . '="' . $v . '"';
	}
	return $out . ']';
}

/** Una riga a tutta larghezza di WPBakery con un elemento (senza «a capo»: WPBakery li trasformerebbe in Testo vuoti). */
function mo_riga( string $shortcode ): string {
	return '[vc_row full_width="stretch_row_content_no_spaces" el_class="mo-riga"][vc_column]' . $shortcode . '[/vc_column][/vc_row]';
}

/** Pagina creata dallo strumento (riconosciuta dalla chiave, anche se ne cambi titolo o indirizzo). */
function mo_pagina_pronta( string $chiave ): ?WP_Post {
	$trovate = get_posts(
		array(
			'post_type'   => 'page',
			'post_status' => array( 'publish', 'draft', 'private', 'pending' ),
			'numberposts' => 1,
			'meta_key'    => '_moveon_pagina', // phpcs:ignore WordPress.DB.SlowDBQuery
			'meta_value'  => $chiave, // phpcs:ignore WordPress.DB.SlowDBQuery
		)
	);
	return $trovate[0] ?? null;
}

/** Crea le pagine che mancano. Restituisce [ chiave => id ] delle pagine create. */
function mo_crea_pagine(): array {
	$create = array();
	$ids    = array();
	foreach ( mo_pagine_pronte() as $chiave => $p ) {
		$esiste = mo_pagina_pronta( $chiave );
		if ( $esiste ) {
			$ids[ $chiave ] = $esiste->ID;
			continue;
		}
		$contenuto = '';
		foreach ( $p['sezioni'] as $sez ) {
			$contenuto .= mo_riga( mo_shortcode( $sez[0], $sez[1] ) );
		}
		$id = wp_insert_post(
			array(
				'post_type'    => 'page',
				'post_status'  => 'publish',
				'post_title'   => $p['titolo'],
				'post_name'    => $chiave,
				'post_parent'  => $p['madre'] && isset( $ids[ $p['madre'] ] ) ? $ids[ $p['madre'] ] : 0,
				'post_content' => $contenuto,
				'menu_order'   => count( $ids ),
			)
		);
		if ( ! $id || is_wp_error( $id ) ) {
			continue;
		}
		update_post_meta( $id, '_wp_page_template', MO_TEMPLATE );
		update_post_meta( $id, '_wpb_vc_js_status', 'true' ); // WPBakery apre la pagina nel suo editor
		update_post_meta( $id, '_moveon_pagina', $chiave );
		$ids[ $chiave ]    = $id;
		$create[ $chiave ] = $id;
	}
	return $create;
}

/**
 * Menu con le pagine: Chi sono · Servizi (a tendina: i singoli servizi) · Portfolio · Contatti.
 * È un menu nuovo («MoveOn · menu con le pagine»): quello di prima resta in Aspetto → Menu.
 */
function mo_crea_menu_pagine(): bool {
	$nome = 'MoveOn · menu con le pagine';
	$menu = wp_get_nav_menu_object( $nome );
	$id   = $menu ? (int) $menu->term_id : (int) wp_create_nav_menu( $nome );
	if ( ! $id || is_wp_error( $id ) ) {
		return false;
	}
	if ( ! $menu ) {
		$pagina = function ( $chiave, $titolo, $madre = 0 ) use ( $id ) {
			$p = mo_pagina_pronta( $chiave );
			if ( ! $p ) {
				return 0;
			}
			return (int) wp_update_nav_menu_item(
				$id,
				0,
				array(
					'menu-item-title'     => $titolo,
					'menu-item-object'    => 'page',
					'menu-item-object-id' => $p->ID,
					'menu-item-type'      => 'post_type',
					'menu-item-status'    => 'publish',
					'menu-item-parent-id' => $madre,
				)
			);
		};
		$pagina( 'chi-sono', 'Chi sono' );
		$servizi = $pagina( 'servizi', 'Servizi' );
		foreach ( mo_servizi_pagine() as $chiave => $s ) {
			$pagina( $chiave, $s['nome'], $servizi );
		}
		wp_update_nav_menu_item(
			$id,
			0,
			array(
				'menu-item-title'  => 'Portfolio',
				'menu-item-url'    => mo_progetti_url(),
				'menu-item-status' => 'publish',
				'menu-item-type'   => 'custom',
			)
		);
		$pagina( 'contatti', 'Contatti' );
	}
	$loc                      = get_theme_mod( 'nav_menu_locations', array() );
	$loc['moveon-principale'] = $id;
	set_theme_mod( 'nav_menu_locations', $loc );
	return true;
}

/**
 * Alleggerisce la home (la pagina impostata come home in Impostazioni → Lettura):
 * «Chi siamo» lungo → «Chi sono» breve, e «Non sai da dove partire?» subito dopo i Servizi.
 * WordPress salva la versione precedente nelle Revisioni. Restituisce cosa è cambiato.
 */
function mo_alleggerisci_home(): array {
	$id   = (int) get_option( 'page_on_front' );
	$post = $id ? get_post( $id ) : null;
	if ( ! $post ) {
		return array( 'errore' => 'Non c’è una pagina impostata come home (Impostazioni → Lettura).' );
	}
	$c     = (string) $post->post_content;
	$fatto = array();
	if ( false !== strpos( $c, '[mo_chi_siamo' ) ) {
		$c       = (string) preg_replace( '/\[mo_chi_siamo\b[^\]]*\]/', '[mo_chi_breve]', $c, 1 );
		$fatto[] = '«Chi siamo» sostituito dalla versione breve «Chi sono»';
	}
	if ( false === strpos( $c, '[mo_situazioni' ) && preg_match( '/\[mo_servizi\b[^\]]*\].*?\[\/vc_row\]/s', $c, $m, PREG_OFFSET_CAPTURE ) ) {
		$fine    = $m[0][1] + strlen( $m[0][0] );
		$c       = substr( $c, 0, $fine ) . mo_riga( '[mo_situazioni]' ) . substr( $c, $fine );
		$fatto[] = 'aggiunta la sezione «Non sai da dove partire?» dopo i Servizi';
	}
	if ( $fatto ) {
		wp_update_post( array( 'ID' => $id, 'post_content' => $c ) );
	}
	return array( 'home' => $id, 'fatto' => $fatto );
}
