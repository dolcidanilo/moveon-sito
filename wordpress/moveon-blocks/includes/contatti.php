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
	$to    = mo_destinatari_richieste();
	$testo = "Nuova richiesta dal sito\n\n"
		. "Nome: {$nome}\nEmail: {$email}\n"
		. ( $telefono ? "Telefono: {$telefono}\n" : '' )
		. "Di cosa ha bisogno: {$area}\n\nMessaggio:\n{$messaggio}\n\n"
		. 'Consenso privacy: sì · ' . wp_date( 'd/m/Y H:i' );

	$errore_mail = '';
	$su_errore   = function ( $e ) use ( &$errore_mail ) {
		$errore_mail = is_wp_error( $e ) ? $e->get_error_message() : '';
	};
	add_action( 'wp_mail_failed', $su_errore );
	$inviata = wp_mail(
		$to,
		'Nuova richiesta dal sito · ' . $area,
		$testo,
		array( 'Reply-To: ' . $nome . ' <' . $email . '>' )
	);
	remove_action( 'wp_mail_failed', $su_errore );

	$salvata = false;
	if ( ! empty( $s['salva_richieste'] ) ) {
		$salvata = (bool) wp_insert_post(
			array(
				'post_type'    => MO_RICHIESTE,
				'post_status'  => 'private',
				'post_title'   => $nome . ' · ' . $area,
				'post_content' => $testo . "\n\n" . mo_esito_email( $inviata, implode( ', ', $to ), $errore_mail ),
			)
		);
	}

	if ( ! $inviata && ! $salvata ) {
		return new WP_REST_Response( array( 'ok' => false, 'errore' => 'Invio non riuscito.' ), 500 );
	}
	return array( 'ok' => true );
}

/** Riga aggiunta alla copia della richiesta: a chi è partita l'email di avviso o perché non è partita. */
function mo_esito_email( bool $inviata, string $to, string $errore = '' ): string {
	if ( $inviata ) {
		return '[Email di avviso spedita a ' . $to . '. Se non la trovi, guarda nella cartella spam della casella]';
	}
	return '[Attenzione: l’email di avviso a ' . $to . ' non è partita' . ( '' !== $errore ? ': ' . rtrim( $errore, '. ' ) : '' ) . '. Controlla WP Mail SMTP]';
}

/** Indirizzi email puliti da un testo (separati da virgola, spazio o a capo), senza doppioni. */
function mo_email_lista( string $testo ): array {
	$out = array();
	foreach ( preg_split( '/[\s,;]+/', $testo ) as $e ) {
		$e = sanitize_email( $e );
		if ( is_email( $e ) && ! in_array( strtolower( $e ), array_map( 'strtolower', $out ), true ) ) {
			$out[] = $e;
		}
	}
	return $out;
}

/** A chi arriva l'avviso di una nuova richiesta: l'email principale più le copie (MoveOn → Impostazioni → Contatti). */
function mo_destinatari_richieste(): array {
	$s     = mo_settings();
	$prima = is_email( $s['email'] ?? '' ) ? array( $s['email'] ) : array( get_option( 'admin_email' ) );
	return mo_email_lista( implode( ',', array_merge( $prima, mo_email_lista( (string) ( $s['email_copia'] ?? '' ) ) ) ) );
}
