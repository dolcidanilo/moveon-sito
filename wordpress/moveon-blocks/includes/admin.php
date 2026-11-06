<?php
/**
 * Pagina "MoveOn" nel pannello di WordPress: Impostazioni, Modelli HTML, Strumenti, Guida.
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'admin_menu',
	function () {
		add_menu_page( 'MoveOn', 'MoveOn', 'manage_options', 'moveon', 'mo_admin_page', 'dashicons-art', 59 );
	}
);

add_action(
	'admin_enqueue_scripts',
	function ( $hook ) {
		$screen = get_current_screen();
		$is_mo  = 'toplevel_page_moveon' === $hook;
		$is_cpt = $screen && MO_CPT === $screen->post_type;
		if ( ! $is_mo && ! $is_cpt ) {
			return;
		}
		wp_enqueue_media();
		wp_enqueue_style( 'wp-color-picker' );
		wp_enqueue_script( 'moveon-admin', MOVEON_URL . 'assets/js/admin.js', array( 'jquery', 'jquery-ui-sortable', 'wp-color-picker' ), MOVEON_VERSION, true );
		wp_add_inline_style( 'wp-admin', '.mo-galleria-anteprima img,.mo-media-anteprima img{width:80px;height:80px;object-fit:cover;margin:0 6px 6px 0;border-radius:6px;background:#f0f0f1}.mo-media-anteprima img{width:auto;max-width:220px;height:auto;max-height:80px;object-fit:contain;padding:8px;background:#1e293b}.mo-galleria{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 10px;padding:0;list-style:none}.mo-galleria-voce{position:relative;width:110px;margin:0;cursor:grab;background:#fff;border:1px solid #dcdcde;border-radius:8px;padding:4px}.mo-galleria-voce img{display:block;width:100%;height:100px;object-fit:cover;border-radius:5px}.mo-galleria-sostituisci{display:block;width:100%;margin-top:4px;padding:3px 0;border:0;background:#f0f0f1;border-radius:4px;font-size:12px;cursor:pointer}.mo-galleria-sostituisci:hover{background:#dcdcde}.mo-galleria-togli{position:absolute;top:-8px;right:-8px;width:24px;height:24px;border:0;border-radius:50%;background:#d63638;color:#fff;font-size:16px;line-height:24px;cursor:pointer}.mo-galleria-voce.ui-sortable-helper{box-shadow:0 8px 20px rgba(0,0,0,.2)}.mo-car-anteprima img{display:block;width:150px;height:200px;object-fit:cover;border-radius:8px;margin-bottom:8px;background:#f0f0f1}.mo-sfondo-zona{margin:0 0 24px;padding:4px 20px 12px;background:#fff;border:1px solid #dcdcde;border-radius:8px;max-width:900px}.mo-sfondo-zona h3{margin:16px 0 0}.mo-sfondo-zona .form-table th{width:170px}.mo-sfondo-anteprima img{display:block;width:220px;height:120px;object-fit:cover;border-radius:6px;margin-bottom:8px;background:#f0f0f1}.mo-tabs{margin:16px 0}.mo-guida{max-width:860px;font-size:14px;line-height:1.7}.mo-guida code{font-size:13px}.mo-guida h2{margin-top:2em}.mo-guida table{border-collapse:collapse}.mo-guida td,.mo-guida th{border:1px solid #dcdcde;padding:6px 10px;text-align:left;vertical-align:top}' );
		if ( $is_mo && 'modelli' === ( $_GET['tab'] ?? '' ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			// Niente controllo automatico dell'HTML: segnalerebbe i segnaposto {{…}} come errori
			$settings = wp_enqueue_code_editor( array( 'type' => 'text/html', 'codemirror' => array( 'lint' => false, 'gutters' => array() ) ) );
			if ( $settings ) {
				wp_add_inline_script( 'code-editor', 'jQuery(function(){var t=document.getElementById("mo-tpl-codice");if(t){wp.codeEditor.initialize(t,' . wp_json_encode( $settings ) . ');}});' );
			}
		}
	}
);

/* ---------------- Salvataggio impostazioni ---------------- */

add_action(
	'admin_post_moveon_salva_impostazioni',
	function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Permesso negato.' );
		}
		check_admin_referer( 'moveon_impostazioni' );
		$in  = wp_unslash( $_POST['mo'] ?? array() );
		$def = mo_defaults()['settings'];
		$out = array();
		foreach ( $def as $k => $v ) {
			$val = $in[ $k ] ?? '';
			if ( in_array( $k, array( 'logo_chiaro_id', 'logo_scuro_id' ), true ) ) {
				$out[ $k ] = absint( $val );
			} elseif ( in_array( $k, array( 'carica_tema', 'salva_richieste', 'tema_scuro' ), true ) ) {
				$out[ $k ] = empty( $val ) ? 0 : 1;
			} elseif ( in_array( $k, array( 'privacy_url', 'cookie_url' ), true ) ) {
				$out[ $k ] = esc_url_raw( trim( (string) $val ) );
			} elseif ( 'email' === $k ) {
				$out[ $k ] = sanitize_email( (string) $val );
			} else {
				$out[ $k ] = sanitize_text_field( (string) $val );
			}
		}
		update_option( 'moveon_settings', $out );
		// Sfondi delle pagine dei progetti
		$sfondi = array();
		$in_sf  = wp_unslash( $_POST['mo_sfondi'] ?? array() );
		foreach ( array_keys( mo_zone_sfondo() ) as $zona ) {
			$sfondi[ $zona ] = mo_sfondo_pulito( is_array( $in_sf ) ? ( $in_sf[ $zona ] ?? array() ) : array() );
		}
		update_option( 'moveon_sfondi', $sfondi );
		wp_safe_redirect( admin_url( 'admin.php?page=moveon&tab=impostazioni&salvato=1' ) );
		exit;
	}
);

/* ---------------- Salvataggio modelli HTML ---------------- */

add_action(
	'admin_post_moveon_salva_modello',
	function () {
		if ( ! current_user_can( 'manage_options' ) || ! current_user_can( 'unfiltered_html' ) ) {
			wp_die( 'Per modificare i modelli HTML serve un account amministratore con il permesso di scrivere HTML.' );
		}
		check_admin_referer( 'moveon_modello' );
		$name   = sanitize_text_field( wp_unslash( $_POST['nome'] ?? '' ) );
		$custom = get_option( MO_Tpl::OPTION, array() );
		$custom = is_array( $custom ) ? $custom : array();
		if ( ! MO_Tpl::valid_name( $name ) || ! in_array( $name, MO_Tpl::all_names(), true ) ) {
			wp_die( 'Modello non valido.' );
		}
		if ( isset( $_POST['ripristina'] ) ) {
			unset( $custom[ $name ] );
			$msg = 'ripristinato';
		} else {
			$code = (string) wp_unslash( $_POST['codice'] ?? '' ); // HTML dell'amministratore: salvato così com'è
			if ( trim( $code ) === trim( MO_Tpl::original( $name ) ) ) {
				unset( $custom[ $name ] );
			} else {
				$custom[ $name ] = $code;
			}
			$msg = 'salvato';
		}
		update_option( MO_Tpl::OPTION, $custom, false );
		wp_safe_redirect( admin_url( 'admin.php?page=moveon&tab=modelli&modello=' . rawurlencode( $name ) . '&esito=' . $msg ) );
		exit;
	}
);

/* ---------------- Strumenti ---------------- */

add_action(
	'admin_post_moveon_strumenti',
	function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Permesso negato.' );
		}
		check_admin_referer( 'moveon_strumenti' );
		$azione = sanitize_key( wp_unslash( $_POST['azione'] ?? '' ) );
		$esito  = array();
		if ( 'demo' === $azione ) {
			$esito = mo_crea_demo( ! empty( $_POST['home'] ) );
		} elseif ( 'progetti' === $azione ) {
			$esito = array( 'progetti' => mo_crea_progetti_esempio() );
		} elseif ( 'menu' === $azione ) {
			$esito = array( 'menu' => mo_crea_menu() );
		}
		set_transient( 'moveon_esito_' . get_current_user_id(), $esito, 120 );
		wp_safe_redirect( admin_url( 'admin.php?page=moveon&tab=strumenti&fatto=' . $azione ) );
		exit;
	}
);

/* ---------------- Pagina ---------------- */

function mo_admin_page(): void {
	$tab  = sanitize_key( $_GET['tab'] ?? 'impostazioni' ); // phpcs:ignore WordPress.Security.NonceVerification
	$tabs = array( 'impostazioni' => 'Impostazioni', 'modelli' => 'Modelli HTML', 'strumenti' => 'Strumenti', 'guida' => 'Guida' );
	echo '<div class="wrap"><h1>MoveOn</h1><nav class="nav-tab-wrapper mo-tabs">';
	foreach ( $tabs as $k => $label ) {
		printf( '<a href="%s" class="nav-tab %s">%s</a>', esc_url( admin_url( 'admin.php?page=moveon&tab=' . $k ) ), $k === $tab ? 'nav-tab-active' : '', esc_html( $label ) );
	}
	echo '</nav>';
	switch ( $tab ) {
		case 'modelli':
			mo_admin_modelli();
			break;
		case 'strumenti':
			mo_admin_strumenti();
			break;
		case 'guida':
			echo '<div class="mo-guida">';
			include MOVEON_DIR . 'guida.html';
			echo '</div>';
			break;
		default:
			mo_admin_impostazioni();
	}
	echo '</div>';
}

function mo_media_field( string $key, string $label, string $desc, int $id ): void {
	$img = $id ? wp_get_attachment_image( $id, 'medium' ) : '';
	?>
	<tr>
		<th><?php echo esc_html( $label ); ?></th>
		<td>
			<input type="hidden" name="mo[<?php echo esc_attr( $key ); ?>]" id="mo-<?php echo esc_attr( $key ); ?>" value="<?php echo esc_attr( (string) $id ); ?>">
			<div class="mo-media-anteprima" id="mo-<?php echo esc_attr( $key ); ?>-anteprima"><?php echo $img; // phpcs:ignore ?></div>
			<button type="button" class="button mo-scegli-immagine" data-target="mo-<?php echo esc_attr( $key ); ?>">Scegli dalla Libreria media</button>
			<button type="button" class="button-link mo-togli-immagine" data-target="mo-<?php echo esc_attr( $key ); ?>">Usa quello incluso</button>
			<p class="description"><?php echo esc_html( $desc ); ?></p>
		</td>
	</tr>
	<?php
}

/** Campi di uno sfondo (colore, testi, immagine, opacità, dimensione, posizione) per una zona delle pagine dei progetti. */
function mo_sfondo_campi( string $zona, string $titolo, string $desc ): void {
	$v    = mo_sfondo_zona( $zona );
	$base = 'mo_sfondi[' . $zona . ']';
	$id   = 'mo-sf-' . $zona;
	$sel  = function ( $campo, $opzioni ) use ( $v, $base, $id ) {
		echo '<select name="' . esc_attr( $base . '[' . $campo . ']' ) . '" id="' . esc_attr( $id . '-' . $campo ) . '">';
		foreach ( $opzioni as $val => $label ) {
			echo '<option value="' . esc_attr( (string) $val ) . '"' . selected( (string) $v[ $campo ], (string) $val, false ) . '>' . esc_html( $label ) . '</option>';
		}
		echo '</select>';
	};
	?>
	<div class="mo-sfondo-zona">
		<h3><?php echo esc_html( $titolo ); ?></h3>
		<p class="description"><?php echo esc_html( $desc ); ?></p>
		<table class="form-table" role="presentation">
			<tr><th><label for="<?php echo esc_attr( $id ); ?>-colore">Colore di sfondo</label></th>
				<td><input type="text" class="mo-colore" id="<?php echo esc_attr( $id ); ?>-colore" name="<?php echo esc_attr( $base ); ?>[sfondo_colore]" value="<?php echo esc_attr( $v['sfondo_colore'] ); ?>" data-default-color=""><p class="description">Vuoto = colore di serie.</p></td></tr>
			<tr><th><label for="<?php echo esc_attr( $id ); ?>-sfondo_testi">Stile dei testi e delle card</label></th>
				<td><?php $sel( 'sfondo_testi', array( '' => 'Automatico', 'chiari' => 'Testi chiari (per sfondi scuri)', 'scuri' => 'Testi scuri (per sfondi chiari)' ) ); ?></td></tr>
			<tr><th>Immagine di sfondo</th>
				<td>
					<input type="hidden" name="<?php echo esc_attr( $base ); ?>[sfondo_img]" id="<?php echo esc_attr( $id ); ?>-img" value="<?php echo $v['sfondo_img'] ? (int) $v['sfondo_img'] : ''; ?>">
					<div class="mo-sfondo-anteprima" id="<?php echo esc_attr( $id ); ?>-img-anteprima"><?php echo $v['sfondo_img'] ? wp_get_attachment_image( $v['sfondo_img'], 'medium' ) : ''; // phpcs:ignore ?></div>
					<button type="button" class="button mo-scegli-immagine" data-target="<?php echo esc_attr( $id ); ?>-img"><?php echo $v['sfondo_img'] ? 'Sostituisci' : 'Scegli l’immagine'; ?></button>
					<button type="button" class="button-link mo-togli-immagine" data-target="<?php echo esc_attr( $id ); ?>-img">Rimuovi</button>
					<p class="description">JPG o PNG. Sta sopra il colore e sotto i testi.</p>
				</td></tr>
			<tr><th><label for="<?php echo esc_attr( $id ); ?>-opacita">Opacità dell’immagine</label></th>
				<td><input type="number" min="5" max="100" step="5" class="small-text" id="<?php echo esc_attr( $id ); ?>-opacita" name="<?php echo esc_attr( $base ); ?>[sfondo_opacita]" value="<?php echo (int) $v['sfondo_opacita']; ?>"> % <span class="description">da 5 (appena visibile) a 100 (piena)</span></td></tr>
			<tr><th><label for="<?php echo esc_attr( $id ); ?>-sfondo_dimensione">Dimensione dell’immagine</label></th>
				<td><?php $sel( 'sfondo_dimensione', array( 'cover' => 'Copre tutta la zona', 'contain' => 'Intera, senza tagli', 'auto' => 'Grandezza originale' ) ); ?></td></tr>
			<?php if ( str_ends_with( $zona, '_testa' ) ) : ?>
			<tr><th><label for="<?php echo esc_attr( $id ); ?>-sfumatura">Sfumatura in basso</label></th>
				<td><input type="number" min="0" max="600" step="10" class="small-text" id="<?php echo esc_attr( $id ); ?>-sfumatura" name="<?php echo esc_attr( $base ); ?>[sfumatura]" value="<?php echo (int) $v['sfumatura']; ?>"> px <span class="description">Pixel aggiunti in fondo alla parte alta, dove sfuma nel colore del contenuto sotto. 0 = nessuna sfumatura (es. 160).</span></td></tr>
			<?php endif; ?>
			<tr><th><label for="<?php echo esc_attr( $id ); ?>-posizione">Posizione dell’immagine</label></th>
				<td><input type="text" style="width:9em" id="<?php echo esc_attr( $id ); ?>-posizione" name="<?php echo esc_attr( $base ); ?>[sfondo_posizione]" value="<?php echo esc_attr( $v['sfondo_posizione'] ); ?>"> <span class="description"><code>50% 50%</code> = centrata, <code>50% 0%</code> = in alto</span></td></tr>
		</table>
	</div>
	<?php
}

function mo_admin_impostazioni(): void {
	$s = mo_settings();
	if ( isset( $_GET['salvato'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		echo '<div class="notice notice-success"><p>Impostazioni salvate.</p></div>';
	}
	$text = function ( $k, $label, $desc, $type = 'text' ) use ( $s ) {
		printf(
			'<tr><th><label for="mo-%1$s">%2$s</label></th><td><input type="%5$s" class="regular-text" id="mo-%1$s" name="mo[%1$s]" value="%3$s"><p class="description">%4$s</p></td></tr>',
			esc_attr( $k ),
			esc_html( $label ),
			esc_attr( (string) $s[ $k ] ),
			esc_html( $desc ),
			esc_attr( $type )
		);
	};
	?>
	<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
		<input type="hidden" name="action" value="moveon_salva_impostazioni">
		<?php wp_nonce_field( 'moveon_impostazioni' ); ?>
		<h2>Logo</h2>
		<table class="form-table" role="presentation">
			<?php
			mo_media_field( 'logo_chiaro_id', 'Logo per sfondi chiari', 'Nell’header dopo lo scroll. PNG trasparente di almeno 900 px (WordPress non accetta SVG senza un plugin apposito).', (int) $s['logo_chiaro_id'] );
			mo_media_field( 'logo_scuro_id', 'Logo per sfondi scuri', 'Nella hero, nel menu mobile e nel footer.', (int) $s['logo_scuro_id'] );
			?>
		</table>
		<h2>Contatti</h2>
		<table class="form-table" role="presentation">
			<?php
			$text( 'telefono', 'Telefono', 'Usato da «Chiamaci» e dalla barra in basso su mobile. Non compare mai scritto nella pagina.' );
			$text( 'whatsapp', 'Numero WhatsApp', 'Usato da «Chatta». Se manca il prefisso viene aggiunto +39.' );
			$text( 'email', 'Email', 'Usata da «Scrivici». È anche l’indirizzo a cui arrivano le richieste del modulo.', 'email' );
			?>
		</table>
		<h2>Pulsanti</h2>
		<table class="form-table" role="presentation">
			<?php
			$text( 'header_cta', 'Testo del pulsante nell’header', 'Massimo 3 parole, es. «Richiedi Preventivo». Lascia vuoto per non mostrarlo.' );
			$text( 'mobile_cta', 'Testo del pulsante nella barra mobile', 'Es. «Contattaci Ora».' );
			$text( 'cta_link', 'I due pulsanti portano a', 'L’ancora della sezione Contatti, es. #contatti.' );
			?>
		</table>
		<p class="description">Le <strong>voci del menu</strong> si gestiscono in <a href="<?php echo esc_url( admin_url( 'nav-menus.php' ) ); ?>">Aspetto → Menu</a>, posizione «MoveOn · menu principale» (link personalizzati, es. #servizi).</p>
		<h2>Footer e note legali</h2>
		<table class="form-table" role="presentation">
			<?php
			$text( 'claim', 'Claim del footer', 'Es. «Diamo forma alle tue idee, pixel dopo pixel.»' );
			$text( 'legali', 'Dati legali', 'Compare dopo «© anno»: ragione sociale e P. IVA.' );
			$text( 'privacy_url', 'Link Privacy Policy', 'Indirizzo della pagina della privacy. Usato nel footer e nel consenso del modulo.', 'url' );
			$text( 'cookie_url', 'Link Cookie Policy', 'Indirizzo della pagina dei cookie. Lascia vuoto per non mostrarlo.', 'url' );
			?>
		</table>
		<h2>Pagina Progetti</h2>
		<table class="form-table" role="presentation">
			<?php
			$text( 'progetti_titolo', 'Titolo', 'Titolo della pagina con tutti i lavori (' . mo_progetti_url() . '). Compare anche nella scheda del browser e su Google.' );
			$text( 'progetti_testo', 'Testo introduttivo', 'Una o due frasi sotto il titolo.' );
			?>
		</table>
				<h2>Sfondi delle pagine dei progetti</h2>
		<p class="description">Come la scheda «Sfondo» degli elementi: colore, stile dei testi, immagine con opacità. Le «pagine dei progetti» valgono per tutti i progetti insieme. Lascia vuoto per l’aspetto di serie.</p>
		<?php
		foreach ( mo_zone_sfondo() as $zona => $info ) {
			mo_sfondo_campi( $zona, $info[0], $info[1] );
		}
		?>
				<h2>Opzioni</h2>
		<table class="form-table" role="presentation">
			<tr><th>Richieste del modulo</th><td><label><input type="checkbox" name="mo[salva_richieste]" value="1" <?php checked( ! empty( $s['salva_richieste'] ) ); ?>> Salva una copia di ogni richiesta in «Richieste dal sito» (utile se un’email non arriva)</label></td></tr>
			<tr><th>Tema scuro</th><td><label><input type="checkbox" name="mo[tema_scuro]" value="1" <?php checked( ! empty( $s['tema_scuro'] ) ); ?>> Tema scuro automatico</label><p class="description">Acceso: chi ha il telefono o il computer impostato sul tema scuro vede il sito con sfondi scuri, come nel prototipo. Spento: il sito è sempre chiaro.</p></td></tr>
			<tr><th>Tema</th><td><label><input type="checkbox" name="mo[carica_tema]" value="1" <?php checked( ! empty( $s['carica_tema'] ) ); ?>> Carica anche stili e script del tema (Porto) sulle pagine MoveOn</label><p class="description">Di serie sono esclusi, così niente interferisce con il design. Attivalo solo se usi elementi propri di Porto in quelle pagine.</p></td></tr>
		</table>
		<?php submit_button( 'Salva le impostazioni' ); ?>
	</form>
	<?php
}

function mo_admin_modelli(): void {
	$names = MO_Tpl::all_names();
	$name  = sanitize_text_field( wp_unslash( $_GET['modello'] ?? 'hero' ) ); // phpcs:ignore WordPress.Security.NonceVerification
	if ( ! in_array( $name, $names, true ) ) {
		$name = 'hero';
	}
	$esito = sanitize_key( $_GET['esito'] ?? '' ); // phpcs:ignore WordPress.Security.NonceVerification
	if ( $esito ) {
		echo '<div class="notice notice-success"><p>' . ( 'ripristinato' === $esito ? 'Modello riportato all’originale.' : 'Modello salvato: ricarica la pagina del sito per vedere la modifica.' ) . '</p></div>';
	}
	$origine = MO_Tpl::origin( $name );
	?>
	<p>Qui modifichi l’<strong>HTML</strong> di ogni parte del sito. Le modifiche restano anche quando aggiorni il plugin. I segnaposto tra doppie graffe (es. <code>{{titolo}}</code>) vengono sostituiti dai testi dei campi: l’elenco è nel commento in cima a ogni modello. Le classi che iniziano con <code>mo-</code> servono a stile e animazioni: se ne togli una, quella parte perde lo stile o l’animazione. Tutto è spiegato nella scheda <a href="<?php echo esc_url( admin_url( 'admin.php?page=moveon&tab=guida' ) ); ?>">Guida</a>.</p>
	<form method="get" style="margin:12px 0">
		<input type="hidden" name="page" value="moveon"><input type="hidden" name="tab" value="modelli">
		<label for="mo-sel-modello"><strong>Modello:</strong></label>
		<select id="mo-sel-modello" name="modello" onchange="this.form.submit()">
			<optgroup label="Sezioni e parti fisse">
				<?php foreach ( $names as $n ) : if ( 0 === strpos( $n, 'parti/' ) ) { continue; } ?>
					<option value="<?php echo esc_attr( $n ); ?>" <?php selected( $name, $n ); ?>><?php echo esc_html( $n ); ?><?php echo 'plugin' !== MO_Tpl::origin( $n ) ? ' (modificato)' : ''; ?></option>
				<?php endforeach; ?>
			</optgroup>
			<optgroup label="Illustrazioni, icone e altre parti">
				<?php foreach ( $names as $n ) : if ( 0 !== strpos( $n, 'parti/' ) ) { continue; } ?>
					<option value="<?php echo esc_attr( $n ); ?>" <?php selected( $name, $n ); ?>><?php echo esc_html( substr( $n, 6 ) ); ?><?php echo 'plugin' !== MO_Tpl::origin( $n ) ? ' (modificato)' : ''; ?></option>
				<?php endforeach; ?>
			</optgroup>
		</select>
		<noscript><button class="button">Apri</button></noscript>
	</form>
	<p class="description">In uso: <?php echo 'pannello' === $origine ? '<strong>versione modificata qui</strong>' : ( 'tema' === $origine ? 'file nel tema figlio (cartella <code>moveon/</code>)' : 'originale del plugin' ); ?>.</p>
	<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
		<input type="hidden" name="action" value="moveon_salva_modello">
		<input type="hidden" name="nome" value="<?php echo esc_attr( $name ); ?>">
		<?php wp_nonce_field( 'moveon_modello' ); ?>
		<textarea id="mo-tpl-codice" name="codice" rows="28" class="large-text code"><?php echo esc_textarea( MO_Tpl::source( $name ) ); ?></textarea>
		<p>
			<?php submit_button( 'Salva il modello', 'primary', 'salva', false ); ?>
			<button type="submit" name="ripristina" value="1" class="button" onclick="return confirm('Riportare il modello all’originale del plugin? Le tue modifiche a questo modello andranno perse.');">Ripristina originale</button>
		</p>
	</form>
	<?php
}

function mo_admin_strumenti(): void {
	$esito = get_transient( 'moveon_esito_' . get_current_user_id() );
	if ( $esito ) {
		delete_transient( 'moveon_esito_' . get_current_user_id() );
		echo '<div class="notice notice-success"><ul style="margin:.6em 0">';
		if ( ! empty( $esito['pagina'] ) ) {
			printf( '<li>Pagina creata: <a href="%s">apri nel sito</a> · <a href="%s">modifica</a></li>', esc_url( get_permalink( $esito['pagina'] ) ), esc_url( get_edit_post_link( $esito['pagina'] ) ) );
		}
		if ( isset( $esito['progetti'] ) ) {
			printf( '<li>Progetti di esempio creati: %d (quelli già presenti non vengono duplicati).</li>', (int) $esito['progetti'] );
		}
		if ( ! empty( $esito['menu'] ) ) {
			echo '<li>Menu «MoveOn · menu principale» pronto: lo modifichi in Aspetto → Menu.</li>';
		}
		if ( ! empty( $esito['home'] ) ) {
			echo '<li>La pagina è ora la <strong>home</strong> del sito (Impostazioni → Lettura).</li>';
		}
		echo '</ul></div>';
	}
	$form = function ( $azione, $titolo, $testo, $bottone, $extra = '' ) {
		?>
		<div class="card" style="max-width:720px">
			<h2><?php echo esc_html( $titolo ); ?></h2>
			<p><?php echo wp_kses_post( $testo ); ?></p>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<input type="hidden" name="action" value="moveon_strumenti">
				<input type="hidden" name="azione" value="<?php echo esc_attr( $azione ); ?>">
				<?php wp_nonce_field( 'moveon_strumenti' ); ?>
				<?php echo $extra; // phpcs:ignore ?>
				<?php submit_button( $bottone, 'primary', 'submit', false ); ?>
			</form>
		</div>
		<?php
	};
	$form( 'demo', 'Crea la pagina demo', 'Crea una pagina «Home MoveOn» con il modello <strong>MoveOn · pagina intera</strong> e tutti gli 8 elementi già compilati con i testi del prototipo, più i progetti di esempio e il menu. Puoi crearla più volte: ogni volta è una pagina nuova.', 'Crea la pagina demo', '<p><label><input type="checkbox" name="home" value="1"> Imposta la pagina come home del sito</label></p>' );
	$form( 'progetti', 'Crea i progetti di esempio', 'Crea gli 8 progetti di esempio del prototipo in «Progetti portfolio», con le copertine nella Libreria media. Quelli già creati non vengono duplicati.', 'Crea i progetti' );
	$form( 'menu', 'Crea il menu', 'Crea il menu «MoveOn · menu principale» con le voci Chi siamo, Servizi, Portfolio, Contatti e lo assegna all’header.', 'Crea il menu' );
}
