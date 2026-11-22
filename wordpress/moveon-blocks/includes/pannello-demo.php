<?php
/**
 * Demo del pannello clienti (1.12.0): «Studio Dentistico Luce», uno studio immaginario.
 * Crea una pagina con un marchio proprio (logo, colori, menu), le sue foto, un utente «dentista-demo» che può
 * modificare solo quella pagina e alcune richieste di esempio. Serve per mostrare il pannello ai potenziali clienti.
 * Scheda MoveOn → Pannello clienti.
 */

defined( 'ABSPATH' ) || exit;

const MO_DEMO_UTENTE = 'dentista-demo';

/** Dati della demo salvati (id di pagina, utente, foto, password). */
function mo_demo(): array {
	$d = get_option( 'mo_pannello_demo', array() );
	return is_array( $d ) ? $d : array();
}

/** Carica nella Libreria media un'immagine della cartella della demo (una volta sola). */
function mo_demo_foto( string $file, int $autore ): int {
	$d = mo_demo();
	if ( ! empty( $d['foto'][ $file ] ) && get_post( (int) $d['foto'][ $file ] ) ) {
		return (int) $d['foto'][ $file ];
	}
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	$tmp = wp_tempnam( $file );
	copy( MOVEON_DIR . 'assets/pannello/demo/' . $file, $tmp );
	$id = media_handle_sideload( array( 'name' => 'demo-' . $file, 'tmp_name' => $tmp ), 0, 'Studio Dentistico Luce · ' . preg_replace( '/\.\w+$/', '', $file ), array( 'post_author' => $autore ) );
	if ( is_wp_error( $id ) ) {
		return 0;
	}
	$d                   = mo_demo();
	$d['foto'][ $file ] = $id;
	update_option( 'mo_pannello_demo', $d, false );
	return (int) $id;
}

/** Contenuto della pagina demo, sezione per sezione. */
function mo_demo_contenuto( array $f ): string {
	$sez = array(
		array( 'hero', array( 'titolo' => "Il tuo sorriso,\nin buone mani.", 'parola' => 'sorriso,', 'testo' => 'Cure dentali attente e senza fretta, con tecnologie moderne e un preventivo chiaro prima di iniziare.', 'pulsante_testo' => 'Prenota una visita', 'pulsante_link' => '#contatti', 'stile' => 'fissa', 'fissa_img' => $f['studio.jpg'], 'anchor' => 'top' ) ),
		array( 'numeri', array( 'etichetta' => 'Lo studio in numeri', 'numeri' => array( array( 'numero' => '20', 'testo' => 'anni di esperienza' ), array( 'numero' => '4.000+', 'testo' => 'pazienti seguiti' ), array( 'numero' => '6', 'testo' => 'specialisti nello studio' ) ) ) ),
		array( 'punti', array( 'etichetta' => 'Perché sceglierci', 'titolo' => 'Cure attente, senza fretta.', 'anchor' => 'studio', 'punti' => array(
			array( 'titolo' => 'Ti ascoltiamo', 'testo' => 'La prima visita serve a capire cosa ti serve davvero. Ti spieghiamo tutto con parole semplici.', 'immagine' => (string) $f['accoglienza.jpg'] ),
			array( 'titolo' => 'Tecnologie moderne', 'testo' => 'Radiografie digitali a basse emissioni e impronte 3D: più comfort e risultati precisi.', 'immagine' => (string) $f['tecnologia.jpg'] ),
			array( 'titolo' => 'Prezzi chiari', 'testo' => 'Un preventivo scritto, voce per voce, prima di iniziare. Anche pagamenti a rate.', 'immagine' => (string) $f['sorriso.jpg'] ),
		) ) ),
		array( 'elenco', array( 'etichetta' => 'Trattamenti', 'titolo' => 'Tutto per la salute del tuo sorriso.', 'anchor' => 'trattamenti', 'gruppi' => array(
			array( 'titolo' => 'Prevenzione', 'voci' => "Igiene professionale\nSigillature per bambini\nSbiancamento" ),
			array( 'titolo' => 'Cure', 'voci' => "Otturazioni estetiche\nDevitalizzazioni\nCure per bambini" ),
			array( 'titolo' => 'Ortodonzia', 'voci' => "Allineatori trasparenti\nApparecchi fissi" ),
			array( 'titolo' => 'Implantologia', 'voci' => "Impianti dentali\nProtesi fisse e mobili" ),
		) ) ),
		array( 'passi', array( 'etichetta' => 'La prima visita', 'titolo' => 'Come funziona.', 'passi' => array(
			array( 'titolo' => 'Prenoti', 'testo' => 'Per telefono, su WhatsApp o dal modulo qui sotto.' ),
			array( 'titolo' => 'Visita e controllo', 'testo' => 'Guardiamo insieme la situazione, con calma.' ),
			array( 'titolo' => 'Piano di cura', 'testo' => 'Ti proponiamo le cure, con tempi e costi chiari.' ),
			array( 'titolo' => 'Si parte', 'testo' => 'Solo quando sei convinto. Nessuna sorpresa.' ),
		) ) ),
		array( 'recensioni', array( 'etichetta' => 'Dicono di noi', 'titolo' => 'Recensioni di esempio.', 'anchor' => 'recensioni', 'recensioni' => array(
			array( 'testo' => 'Qui compariranno le recensioni vere dei pazienti: il titolare le aggiunge o le cambia dal pannello in un minuto.', 'nome' => 'Recensione di esempio', 'attivita' => 'Paziente' ),
			array( 'testo' => 'Ogni recensione ha testo, nome e una riga sotto. Si possono riordinare con le frecce.', 'nome' => 'Recensione di esempio', 'attivita' => 'Paziente' ),
			array( 'testo' => 'Prova ad aggiungerne una dal pannello: tocca «Aggiungi», scrivi e salva.', 'nome' => 'Recensione di esempio', 'attivita' => 'Paziente' ),
		) ) ),
		array( 'faq', array( 'etichetta' => 'Domande frequenti', 'titolo' => 'Le domande dei nostri pazienti.', 'anchor' => 'domande', 'domande' => array(
			array( 'domanda' => 'Quanto costa la prima visita?', 'risposta' => 'La prima visita con controllo e piano di cura costa [50 €] ed è scalata dalle cure.' ),
			array( 'domanda' => 'Accettate pagamenti a rate?', 'risposta' => 'Sì, con finanziamenti a tasso zero per le cure più importanti.' ),
			array( 'domanda' => 'Fate cure per bambini?', 'risposta' => 'Sì, con una dentista dedicata e tempi pensati per loro.' ),
			array( 'domanda' => 'E se ho un’urgenza?', 'risposta' => 'Chiamaci: per le urgenze troviamo posto in giornata.' ),
		) ) ),
		array( 'contatti', array( 'etichetta' => 'Prenota', 'titolo' => "Prenota la tua\nvisita.", 'testo' => 'Scrivici qui sotto: ti richiamiamo entro un giorno lavorativo per fissare l’appuntamento.', 'bollino' => 'Prenota una visita', 'opzioni' => "Prima visita\nIgiene e sbiancamento\nOrtodonzia\nImplantologia\nUrgenza", 'titolo_pulsanti' => 'Preferisci chiamarci?', 'conferma' => 'Ti richiamiamo entro un giorno lavorativo.', 'foto' => (string) $f['contatti.jpg'], 'anchor' => 'contatti' ) ),
	);
	$c = '';
	foreach ( $sez as $s ) {
		$c .= mo_riga( mo_shortcode( $s[0], $s[1] ) );
	}
	return $c;
}

/** Richieste di esempio (visibili solo nel pannello della demo). */
function mo_demo_richieste(): void {
	foreach ( get_posts( array( 'post_type' => MO_RICHIESTE, 'post_status' => 'any', 'numberposts' => 50, 'meta_key' => '_mo_demo', 'meta_value' => '1' ) ) as $p ) { // phpcs:ignore WordPress.DB.SlowDBQuery
		wp_delete_post( $p->ID, true );
	}
	$es = array(
		array( 'Giulia Esempio', 'giulia@esempio.it', '333 000 0001', 'Prima visita', 'Buongiorno, vorrei prenotare una prima visita per me e per mio figlio di 8 anni. Siamo liberi il sabato mattina. Grazie!', 0, '-2 hours' ),
		array( 'Marco Prova', 'marco@esempio.it', '333 000 0002', 'Ortodonzia', 'Salve, mi interessano gli allineatori trasparenti. Potete darmi un’idea dei costi e dei tempi?', 0, '-1 day' ),
		array( 'Anna Demo', 'anna@esempio.it', '', 'Igiene e sbiancamento', 'Vorrei fissare una seduta di igiene e chiedere informazioni sullo sbiancamento.', 1, '-3 days' ),
	);
	foreach ( $es as $e ) {
		$quando = gmdate( 'Y-m-d H:i:s', strtotime( $e[6] ) );
		$id     = wp_insert_post( array( 'post_type' => MO_RICHIESTE, 'post_status' => 'private', 'post_title' => $e[0] . ' · ' . $e[3], 'post_content' => "Richiesta di esempio della demo\n\nNome: {$e[0]}\nEmail: {$e[1]}\nTelefono: {$e[2]}\nDi cosa ha bisogno: {$e[3]}\n\nMessaggio:\n{$e[4]}", 'post_date_gmt' => $quando, 'post_date' => get_date_from_gmt( $quando ) ) );
		if ( $id ) {
			update_post_meta( $id, '_mo_demo', '1' );
			update_post_meta( $id, '_mo_dati', array( 'nome' => $e[0], 'email' => $e[1], 'telefono' => $e[2], 'area' => $e[3], 'messaggio' => $e[4] ) );
			if ( $e[5] ) {
				update_post_meta( $id, '_mo_letta', 1 );
			}
		}
	}
}

/**
 * Crea (o rimette come nuova) la demo. $ripristina: riporta la pagina ai testi di partenza e rimette le richieste.
 * Restituisce i dati della demo, con la password dell'utente.
 */
function mo_demo_crea( bool $ripristina = false ): array {
	$d = mo_demo();
	// Utente
	$u = get_user_by( 'login', MO_DEMO_UTENTE );
	if ( ! $u ) {
		$pw  = wp_generate_password( 12, false );
		$uid = wp_insert_user( array( 'user_login' => MO_DEMO_UTENTE, 'user_pass' => $pw, 'user_email' => MO_DEMO_UTENTE . '@example.com', 'display_name' => 'Studio Dentistico Luce', 'first_name' => 'Studio Dentistico', 'last_name' => 'Luce', 'role' => MO_PANNELLO_RUOLO ) );
		if ( is_wp_error( $uid ) ) {
			return array( 'errore' => $uid->get_error_message() );
		}
		$d['password'] = $pw;
		$u             = get_user_by( 'id', $uid );
	}
	$d['utente'] = $u->ID;
	update_option( 'mo_pannello_demo', $d, false );
	// Foto (di proprietà dell'utente demo: le vede tra «Le tue foto»)
	$f = array();
	foreach ( array( 'studio.jpg', 'accoglienza.jpg', 'tecnologia.jpg', 'sorriso.jpg', 'contatti.jpg' ) as $file ) {
		$f[ $file ] = mo_demo_foto( $file, $u->ID );
	}
	// I loghi non sono «foto» del cliente: appartengono a chi crea la demo e non compaiono tra «Le tue foto»
	foreach ( array( 'logo-luce-chiaro.png', 'logo-luce-scuro.png', 'icona-luce.png' ) as $file ) {
		$f[ $file ] = mo_demo_foto( $file, get_current_user_id() ? get_current_user_id() : 1 );
	}
	// Pagina
	$d     = mo_demo();
	$pagina = ! empty( $d['pagina'] ) ? get_post( (int) $d['pagina'] ) : null;
	if ( ! $pagina || 'trash' === $pagina->post_status ) {
		$pid = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Demo · Studio Dentistico Luce', 'post_name' => 'demo-studio-dentistico', 'post_content' => mo_demo_contenuto( $f ) ) );
		$ripristina = true;
	} else {
		$pid = $pagina->ID;
		if ( $ripristina ) {
			wp_update_post( array( 'ID' => $pid, 'post_content' => mo_demo_contenuto( $f ) ) );
		}
	}
	update_post_meta( $pid, '_wp_page_template', MO_TEMPLATE );
	update_post_meta( $pid, '_wpb_vc_js_status', 'true' );
	update_post_meta( $pid, 'rank_math_robots', array( 'noindex', 'nofollow' ) );
	update_post_meta(
		$pid,
		'_mo_marchio',
		array(
			'nome'        => 'Studio Dentistico Luce',
			'logo_scuro'  => $f['logo-luce-scuro.png'],
			'logo_chiaro' => $f['logo-luce-chiaro.png'],
			'colori'      => array( 'c1' => '#0f766e', 'c2' => '#0b3d3a', 'c3' => '#0d9488', 'c4' => '#5eead4', 'c5' => '#99f6e4', 'c6' => '#f6b26b' ),
			'menu'        => array( array( 'Lo studio', '#studio' ), array( 'Trattamenti', '#trattamenti' ), array( 'Domande', '#domande' ), array( 'Contatti', '#contatti' ) ),
			'cta'         => array( 'Prenota una visita', '#contatti' ),
			'claim'       => 'Il tuo sorriso, in buone mani.',
			'legali'      => 'Studio Dentistico Luce · studio immaginario, sito dimostrativo di MoveOn Studio',
		)
	);
	// Che cosa vede l'utente demo
	update_user_meta( $u->ID, 'mo_pagine', array( $pid ) );
	update_user_meta( $u->ID, 'mo_richieste', 'demo' );
	update_user_meta( $u->ID, 'mo_marchio', array( 'nome' => 'Studio Dentistico Luce', 'colore' => '#0f766e', 'logo' => $f['icona-luce.png'] ) );
	if ( $ripristina ) {
		mo_demo_richieste();
	}
	$d           = mo_demo();
	$d['pagina'] = $pid;
	update_option( 'mo_pannello_demo', $d, false );
	return $d;
}

/** Nuova password per l'utente demo. */
function mo_demo_nuova_password(): string {
	$u = get_user_by( 'login', MO_DEMO_UTENTE );
	if ( ! $u ) {
		return '';
	}
	$pw = wp_generate_password( 12, false );
	wp_set_password( $pw, $u->ID );
	$d             = mo_demo();
	$d['password'] = $pw;
	update_option( 'mo_pannello_demo', $d, false );
	return $pw;
}

/* ---------------- Scheda MoveOn → Pannello clienti ---------------- */

add_action(
	'admin_post_moveon_pannello',
	function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Permesso negato.' );
		}
		check_admin_referer( 'moveon_pannello' );
		$azione = sanitize_key( wp_unslash( $_POST['azione'] ?? '' ) );
		if ( 'crea' === $azione ) {
			mo_demo_crea( false );
		} elseif ( 'ripristina' === $azione ) {
			mo_demo_crea( true );
		} elseif ( 'password' === $azione ) {
			mo_demo_nuova_password();
		}
		wp_safe_redirect( admin_url( 'admin.php?page=moveon&tab=pannello&fatto=' . $azione ) );
		exit;
	}
);

function mo_admin_pannello(): void {
	$d      = mo_demo();
	$u      = get_user_by( 'login', MO_DEMO_UTENTE );
	$pagina = ! empty( $d['pagina'] ) ? get_post( (int) $d['pagina'] ) : null;
	$url    = mo_pannello_url();
	$url_demo = add_query_arg( 'per', MO_DEMO_UTENTE, $url );
	$form   = function ( $azione, $testo, $classe = 'button button-primary' ) {
		printf( '<form method="post" action="%s" style="display:inline-block;margin:0 8px 8px 0"><input type="hidden" name="action" value="moveon_pannello"><input type="hidden" name="azione" value="%s">%s<button class="%s">%s</button></form>', esc_url( admin_url( 'admin-post.php' ) ), esc_attr( $azione ), wp_nonce_field( 'moveon_pannello', '_wpnonce', true, false ), esc_attr( $classe ), esc_html( $testo ) );
	};
	$fatto = sanitize_key( $_GET['fatto'] ?? '' ); // phpcs:ignore WordPress.Security.NonceVerification
	if ( $fatto ) {
		$msg = array( 'crea' => 'Demo pronta.', 'ripristina' => 'Demo rimessa come nuova: testi, foto e richieste di esempio di partenza.', 'password' => 'Nuova password creata.' );
		echo '<div class="notice notice-success"><p>' . esc_html( $msg[ $fatto ] ?? 'Fatto.' ) . '</p></div>';
	}
	?>
	<div class="card" style="max-width:760px">
		<h2>Il pannello «Il tuo sito»</h2>
		<p>Un’area separata da WordPress dove il cliente entra con nome utente e password e cambia da solo testi, elenchi, foto e colori delle sezioni MoveOn delle sue pagine, e legge le richieste del modulo. Non vede mai la bacheca di WordPress.</p>
		<p><strong>Indirizzo:</strong> <a href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener"><?php echo esc_html( $url ); ?></a> · da amministratore lo apri già collegato e vedi tutte le pagine.</p>
	</div>
	<div class="card" style="max-width:760px">
		<h2>Demo per i clienti: Studio Dentistico Luce</h2>
		<?php if ( $u && $pagina ) : ?>
			<p>Uno studio dentistico immaginario, con logo, colori e menu propri, per far provare il pannello a un potenziale cliente. L’utente demo può modificare <strong>solo</strong> la pagina della demo: il resto del sito non si tocca. La pagina non compare su Google.</p>
			<table class="form-table" role="presentation">
				<tr><th>Pannello della demo</th><td><a href="<?php echo esc_url( $url_demo ); ?>" target="_blank" rel="noopener"><?php echo esc_html( $url_demo ); ?></a><br><span class="description">Con il marchio dello studio già sulla pagina di accesso. Aprilo in una finestra in incognito (o esci da WordPress): da amministratore entri come te stesso.</span></td></tr>
				<tr><th>Nome utente</th><td><code style="font-size:15px"><?php echo esc_html( MO_DEMO_UTENTE ); ?></code></td></tr>
				<tr><th>Password</th><td><code style="font-size:15px"><?php echo esc_html( $d['password'] ?? '—' ); ?></code></td></tr>
				<tr><th>Pagina della demo</th><td><a href="<?php echo esc_url( get_permalink( $pagina ) ); ?>" target="_blank" rel="noopener"><?php echo esc_html( get_permalink( $pagina ) ); ?></a></td></tr>
			</table>
			<p>
				<?php $form( 'ripristina', 'Rimetti la demo come nuova', 'button' ); ?>
				<?php $form( 'password', 'Nuova password', 'button' ); ?>
			</p>
			<p class="description">«Rimetti la demo come nuova» riporta testi, foto e richieste di esempio a quelli di partenza: usalo dopo averla fatta provare a un cliente.</p>
		<?php else : ?>
			<p>Crea uno studio dentistico immaginario, con logo, colori e menu propri, e un utente che può modificare solo quella pagina: è la demo da far provare ai potenziali clienti. Il resto del sito non si tocca e la pagina non compare su Google.</p>
			<?php $form( 'crea', 'Crea la demo del dentista' ); ?>
		<?php endif; ?>
	</div>
	<?php
}
