<?php
/**
 * Modulo contatti: riceve la richiesta, la controlla, la invia per email e (se attivo) ne salva una copia.
 * Indirizzo: /wp-json/moveon/v1/contatti
 *
 * Per far arrivare le email in modo affidabile su Aruba si consiglia un plugin SMTP (es. WP Mail SMTP)
 * configurato con la casella di posta del dominio: questo modulo usa la funzione standard wp_mail().
 */

defined( 'ABSPATH' ) || exit;

const MO_RICHIESTE = 'mo_richiesta';

add_action(
	'init',
	function () {
		register_post_type(
			MO_RICHIESTE,
			array(
				'labels'       => array(
					'name'          => 'Richieste dal sito',
					'singular_name' => 'Richiesta',
					'menu_name'     => 'Richieste dal sito',
					'all_items'     => 'Tutte le richieste',
					'edit_item'     => 'Richiesta',
					'not_found'     => 'Nessuna richiesta',
				),
				'public'       => false,
				'show_ui'      => true,
				'show_in_menu' => true,
				'menu_icon'    => 'dashicons-email-alt',
				'supports'     => array( 'title', 'editor' ),
				'capabilities' => array( 'create_posts' => 'do_not_allow' ),
				'map_meta_cap' => true,
			)
		);
	}
);

add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'moveon/v1',
			'/contatti',
			array(
				'methods'             => 'POST',
				'callback'            => 'mo_contatti_ricevi',
				'permission_callback' => '__return_true',
			)
		);
	}
);

function mo_contatti_ricevi( WP_REST_Request $req ) {
	$f = function ( $k ) use ( $req ) {
		return trim( (string) $req->get_param( $k ) );
	};

	// Antispam 1: campo trappola (invisibile alle persone). Se è compilato fingiamo che sia andato tutto bene.
	if ( '' !== $f( 'sito' ) ) {
		return array( 'ok' => true );
	}
	// Antispam 2: inviato troppo in fretta (meno di 3 secondi dopo l'apertura della pagina)
	$t = (int) $f( 't' );
	if ( $t && time() - $t < 3 ) {
		return array( 'ok' => true );
	}
	// Antispam 3: al massimo 5 richieste all'ora dallo stesso indirizzo
	$ip  = sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ?? '' ) );
	$key = 'mo_cnt_' . md5( $ip );
	$n   = (int) get_transient( $key );
	if ( $n >= (int) apply_filters( 'moveon_limite_richieste_ora', 5 ) ) {
		return new WP_REST_Response( array( 'ok' => false, 'errore' => 'Troppe richieste: riprova tra un po’.' ), 429 );
	}
	set_transient( $key, $n + 1, HOUR_IN_SECONDS );

	$nome      = sanitize_text_field( $f( 'nome' ) );
	$email     = sanitize_email( $f( 'email' ) );
	$telefono  = sanitize_text_field( $f( 'telefono' ) );
	$area      = sanitize_text_field( $f( 'area' ) );
	$messaggio = sanitize_textarea_field( $f( 'messaggio' ) );
	$privacy   = '' !== $f( 'privacy' );

	if ( '' === $nome || ! is_email( $email ) || '' === $messaggio || ! $privacy ) {
		return new WP_REST_Response( array( 'ok' => false, 'errore' => 'Controlla i campi obbligatori.' ), 400 );
	}

	$s     = mo_settings();
	$to    = is_email( $s['email'] ) ? $s['email'] : get_option( 'admin_email' );
	$testo = "Nuova richiesta dal sito\n\n"
		. "Nome: {$nome}\nEmail: {$email}\n"
		. ( $telefono ? "Telefono: {$telefono}\n" : '' )
		. "Di cosa ha bisogno: {$area}\n\nMessaggio:\n{$messaggio}\n\n"
		. 'Consenso privacy: sì · ' . wp_date( 'd/m/Y H:i' );

	$inviata = wp_mail(
		$to,
		'Nuova richiesta dal sito · ' . $area,
		$testo,
		array( 'Reply-To: ' . $nome . ' <' . $email . '>' )
	);

	$salvata = false;
	if ( ! empty( $s['salva_richieste'] ) ) {
		$salvata = (bool) wp_insert_post(
			array(
				'post_type'    => MO_RICHIESTE,
				'post_status'  => 'private',
				'post_title'   => $nome . ' · ' . $area,
				'post_content' => $testo . ( $inviata ? '' : "\n\n[Attenzione: l’email di avviso non è partita]" ),
			)
		);
	}

	if ( ! $inviata && ! $salvata ) {
		return new WP_REST_Response( array( 'ok' => false, 'errore' => 'Invio non riuscito.' ), 500 );
	}
	return array( 'ok' => true );
}
