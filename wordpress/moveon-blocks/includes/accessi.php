<?php
/**
 * Protezione degli accessi: dopo 5 password sbagliate dallo stesso indirizzo internet, per 15 minuti
 * l'accesso è bloccato. Vale per la pagina di accesso del pannello clienti (/gestione/) e per quella
 * di WordPress (wp-login.php): entrambe passano dal filtro «authenticate» di WordPress.
 */

defined( 'ABSPATH' ) || exit;

const MO_ACCESSI_MAX     = 5;   // tentativi sbagliati ammessi
const MO_ACCESSI_MINUTI  = 15;  // durata del blocco (e finestra in cui si contano i tentativi)

/** Chiave del contatore per chi sta provando ad accedere (indirizzo IP, non salvato in chiaro). */
function mo_accessi_chiave(): string {
	$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	return 'mo_acc_' . md5( '' !== $ip ? $ip : 'sconosciuto' );
}

/** Stato dei tentativi: array( 'n' => quanti sbagliati, 'fino' => fine del blocco, 0 se non bloccato ). */
function mo_accessi_stato(): array {
	$s = get_transient( mo_accessi_chiave() );
	return is_array( $s ) ? array_merge( array( 'n' => 0, 'fino' => 0 ), $s ) : array( 'n' => 0, 'fino' => 0 );
}

/** Minuti di blocco rimasti (0 = si può accedere). */
function mo_accessi_bloccato(): int {
	$fino = (int) mo_accessi_stato()['fino'];
	return $fino > time() ? (int) ceil( ( $fino - time() ) / 60 ) : 0;
}

/** Messaggio per chi è bloccato. */
function mo_accessi_messaggio( int $minuti ): string {
	return sprintf( 'Troppi tentativi sbagliati: per sicurezza l’accesso è bloccato. Riprova tra %d %s.', $minuti, 1 === $minuti ? 'minuto' : 'minuti' );
}

// Durante il blocco nessun accesso, nemmeno con la password giusta (dopo il controllo di WordPress, priorità 30)
add_filter(
	'authenticate',
	function ( $user ) {
		$min = mo_accessi_bloccato();
		return $min ? new WP_Error( 'mo_troppi_tentativi', mo_accessi_messaggio( $min ) ) : $user;
	},
	30
);

// Ogni password sbagliata si conta; alla quinta parte il blocco
add_action(
	'wp_login_failed',
	function ( $utente, $errore = null ) {
		if ( $errore instanceof WP_Error && 'mo_troppi_tentativi' === $errore->get_error_code() ) {
			return; // già bloccato: non allungare il blocco
		}
		$s = mo_accessi_stato();
		$s['n']++;
		if ( $s['n'] >= MO_ACCESSI_MAX ) {
			$s = array( 'n' => 0, 'fino' => time() + MO_ACCESSI_MINUTI * MINUTE_IN_SECONDS );
		}
		set_transient( mo_accessi_chiave(), $s, MO_ACCESSI_MINUTI * MINUTE_IN_SECONDS );
	},
	10,
	2
);

// Accesso riuscito: si ricomincia da zero
add_action(
	'wp_login',
	function () {
		delete_transient( mo_accessi_chiave() );
	}
);
