<?php
/**
 * Progetti del portfolio: ogni lavoro è una scheda a sé (menu "Progetti portfolio").
 * - Titolo = nome del progetto / cliente
 * - Immagine in evidenza = copertina (4:3): card del Portfolio e grande immagine in cima alla pagina del progetto
 * - Immagine del carosello (verticale 3:4): card del Carosello progetti (se manca si usa la copertina)
 * - Galleria: le immagini della pagina del progetto
 * - Testo (editor): racconto facoltativo nella pagina del progetto; Riassunto = descrizione breve
 * - Attributi → Ordine = posizione nel sito (numeri più bassi prima)
 * - Riquadro "Dettagli del progetto": area, tipo, testi, galleria, in evidenza
 */

defined( 'ABSPATH' ) || exit;

const MO_CPT = 'mo_progetto';

function mo_aree(): array {
	return array( 'branding' => 'Branding', 'web' => 'Web', 'social' => 'Social', 'stampa' => 'Stampa' );
}

/* La copertina usa l'immagine in evidenza: si attiva per i progetti anche se il tema la limita ad articoli e pagine */
add_action(
	'after_setup_theme',
	function () {
		add_theme_support( 'post-thumbnails', array( MO_CPT ) );
	},
	99
);

add_action(
	'init',
	function () {
		register_post_type(
			MO_CPT,
			array(
				'labels'          => array(
					'name'               => 'Progetti portfolio',
					'singular_name'      => 'Progetto',
					'add_new'            => 'Aggiungi progetto',
					'add_new_item'       => 'Aggiungi un progetto',
					'edit_item'          => 'Modifica progetto',
					'new_item'           => 'Nuovo progetto',
					'view_item'          => 'Vedi progetto',
					'search_items'       => 'Cerca progetti',
					'not_found'          => 'Nessun progetto',
					'not_found_in_trash' => 'Nessun progetto nel cestino',
					'all_items'          => 'Tutti i progetti',
					'menu_name'          => 'Progetti portfolio',
					'featured_image'     => 'Copertina (orizzontale 4:3, almeno 1600 px)',
					'set_featured_image' => 'Scegli la copertina',
					'remove_featured_image' => 'Rimuovi la copertina',
					'use_featured_image' => 'Usa come copertina',
				),
				// Ogni progetto ha la sua pagina (/progetti/nome-progetto/) e c'è la pagina con tutti i lavori (/progetti/)
				'public'          => true,
				'has_archive'     => 'progetti',
				'rewrite'         => array( 'slug' => 'progetti', 'with_front' => false ),
				'show_ui'         => true,
				'show_in_menu'    => true,
				'menu_position'   => 21,
				'menu_icon'       => 'dashicons-portfolio',
				'supports'        => array( 'title', 'editor', 'thumbnail', 'page-attributes', 'excerpt' ),
				'hierarchical'    => false,
				'show_in_rest'    => false,
			)
		);
	}
);

/** ID delle immagini della galleria, nell'ordine scelto. */
function mo_galleria_ids( int $post_id ): array {
	return array_values( array_filter( array_map( 'absint', explode( ',', (string) get_post_meta( $post_id, '_mo_galleria', true ) ) ) ) );
}

/** Tutti i dati di un progetto, per il Portfolio, il Carosello e la sua pagina. */
function mo_progetto_dati( WP_Post $p ): array {
	$cover    = mo_image( get_post_thumbnail_id( $p ), '', 'large' );
	$cover_xl = mo_image( get_post_thumbnail_id( $p ), '', '2048x2048' );
	$car_id   = absint( get_post_meta( $p->ID, '_mo_carosello_img', true ) );
	$car      = $car_id ? mo_image( $car_id, '', 'large' ) : null;
	$galleria = array();
	foreach ( mo_galleria_ids( $p->ID ) as $gid ) {
		$g = mo_image( $gid, '', '2048x2048' );
		if ( $g ) {
			$galleria[] = array( 'url' => $g['url'], 'alt' => $g['alt'], 'width' => $g['w'], 'height' => $g['h'] );
		}
	}
	$area = (string) get_post_meta( $p->ID, '_mo_area', true ) ?: 'branding';
	return array(
		'id'        => $p->ID,
		'url'       => get_permalink( $p ),
		'nome'      => get_the_title( $p ),
		'area'      => $area,
		'area_nome' => mo_aree()[ $area ] ?? $area,
		'tipo'      => (string) get_post_meta( $p->ID, '_mo_tipo', true ),
		'richiesta' => (string) get_post_meta( $p->ID, '_mo_richiesta', true ),
		'lavoro'    => (string) get_post_meta( $p->ID, '_mo_lavoro', true ),
		'risultato' => (string) get_post_meta( $p->ID, '_mo_risultato', true ),
		'copertina' => $cover ? array( 'url' => $cover['url'], 'alt' => $cover['alt'], 'pos' => '50% 50%', 'w' => $cover['w'], 'h' => $cover['h'] ) : null,
		'cover_xl'  => $cover_xl,
		// Card del carosello: l'immagine verticale scelta, altrimenti la copertina ritagliata al centro
		'carosello' => $car ?: $cover,
		'galleria'  => $galleria,
	);
}

/** Progetti visibili nel sito ("Mostra questo progetto nel sito" attivo), nell'ordine scelto. */
function mo_progetti_visibili(): array {
	return get_posts(
		array(
			'post_type'      => MO_CPT,
			'post_status'    => 'publish',
			'posts_per_page' => 60,
			'orderby'        => array( 'menu_order' => 'ASC', 'date' => 'DESC' ),
			'meta_query'     => array(
				'relation' => 'OR',
				array( 'key' => '_mo_evidenza', 'value' => '1' ),
				array( 'key' => '_mo_evidenza', 'compare' => 'NOT EXISTS' ),
			),
		)
	);
}

/** Progetti per Portfolio e Carosello: solo quelli con un'immagine (le card ne hanno bisogno). */
function mo_progetti_in_evidenza(): array {
	$out = array();
	foreach ( mo_progetti_visibili() as $p ) {
		$dati = mo_progetto_dati( $p );
		if ( $dati['copertina'] || $dati['carosello'] ) {
			$out[] = $dati;
		}
	}
	return $out;
}

/* ---------------- Riquadro "Dettagli del progetto" ---------------- */

add_action(
	'add_meta_boxes',
	function () {
		add_meta_box( 'mo_dettagli', 'Dettagli del progetto', 'mo_progetto_metabox', MO_CPT, 'normal', 'high' );
	}
);

/** Una miniatura della galleria nel pannello, con Sostituisci e ×. */
function mo_galleria_voce( int $id ): string {
	$img = wp_get_attachment_image( $id, 'thumbnail' );
	if ( ! $img ) {
		return '';
	}
	return '<li class="mo-galleria-voce" data-id="' . (int) $id . '">' . $img
		. '<button type="button" class="mo-galleria-sostituisci">Sostituisci</button>'
		. '<button type="button" class="mo-galleria-togli" aria-label="Togli questa immagine">×</button></li>';
}

function mo_progetto_metabox( WP_Post $post ): void {
	wp_nonce_field( 'mo_progetto_salva', 'mo_progetto_nonce' );
	$m = function ( $k ) use ( $post ) {
		return (string) get_post_meta( $post->ID, $k, true );
	};
	$evid     = metadata_exists( 'post', $post->ID, '_mo_evidenza' ) ? $m( '_mo_evidenza' ) : '1';
	$galleria = $m( '_mo_galleria' );
	$car_id   = absint( $m( '_mo_carosello_img' ) );
	?>
	<p class="description">Il <strong>titolo</strong> qui sopra è il nome del progetto. La <strong>copertina</strong> si sceglie nel riquadro «Copertina» a destra. L’<strong>ordine</strong> nel sito si imposta in «Attributi → Ordine» (numeri più bassi prima). Il <strong>testo</strong> nell’editor è facoltativo: compare nella pagina del progetto, utile per Google.</p>
	<table class="form-table" role="presentation">
		<tr>
			<th><label for="mo_area">Area</label></th>
			<td><select name="mo_area" id="mo_area">
				<?php foreach ( mo_aree() as $k => $label ) : ?>
					<option value="<?php echo esc_attr( $k ); ?>" <?php selected( $m( '_mo_area' ) ?: 'branding', $k ); ?>><?php echo esc_html( $label ); ?></option>
				<?php endforeach; ?>
			</select><p class="description">Decide in quale filtro compare il lavoro.</p></td>
		</tr>
		<tr>
			<th><label for="mo_tipo">Tipo di lavoro</label></th>
			<td><input type="text" class="regular-text" name="mo_tipo" id="mo_tipo" value="<?php echo esc_attr( $m( '_mo_tipo' ) ); ?>"><p class="description">Breve, es. «Logo e packaging».</p></td>
		</tr>
		<tr>
			<th><label for="mo_richiesta">La richiesta</label></th>
			<td><textarea class="large-text" rows="3" name="mo_richiesta" id="mo_richiesta"><?php echo esc_textarea( $m( '_mo_richiesta' ) ); ?></textarea></td>
		</tr>
		<tr>
			<th><label for="mo_lavoro">Il nostro lavoro</label></th>
			<td><textarea class="large-text" rows="3" name="mo_lavoro" id="mo_lavoro"><?php echo esc_textarea( $m( '_mo_lavoro' ) ); ?></textarea></td>
		</tr>
		<tr>
			<th><label for="mo_risultato">Il risultato</label></th>
			<td><textarea class="large-text" rows="3" name="mo_risultato" id="mo_risultato"><?php echo esc_textarea( $m( '_mo_risultato' ) ); ?></textarea><p class="description">Con dati reali, es. «+40% di prenotazioni nei primi tre mesi».</p></td>
		</tr>
		<tr>
			<th>Immagine del carosello</th>
			<td>
				<input type="hidden" name="mo_carosello_img" id="mo_carosello_img" value="<?php echo $car_id ? (int) $car_id : ''; ?>">
				<div id="mo_carosello_img-anteprima" class="mo-car-anteprima"><?php echo $car_id ? wp_get_attachment_image( $car_id, 'medium' ) : ''; ?></div>
				<button type="button" class="button mo-scegli-immagine" data-target="mo_carosello_img"><?php echo $car_id ? 'Sostituisci' : 'Scegli l’immagine'; ?></button>
				<button type="button" class="button-link mo-togli-immagine" data-target="mo_carosello_img">Rimuovi</button>
				<p class="description">Verticale (3:4, almeno 900×1200 px). È la card del «Carosello progetti». Se manca si usa la copertina, ritagliata al centro.</p>
			</td>
		</tr>
		<tr>
			<th>Immagini del progetto</th>
			<td>
				<input type="hidden" name="mo_galleria" id="mo_galleria" value="<?php echo esc_attr( $galleria ); ?>">
				<ul class="mo-galleria" data-target="mo_galleria"><?php
				foreach ( array_filter( array_map( 'absint', explode( ',', $galleria ) ) ) as $gid ) {
					echo mo_galleria_voce( $gid ); // phpcs:ignore WordPress.Security.EscapeOutput
				}
				?></ul>
				<button type="button" class="button mo-aggiungi-galleria" data-target="mo_galleria">Aggiungi immagini</button>
				<button type="button" class="button-link mo-svuota-galleria" data-target="mo_galleria">Togli tutte</button>
				<p class="description">Compaiono nella pagina del progetto (e nella sua scheda nel Portfolio). <strong>Trascinale</strong> per cambiare l’ordine; su ogni immagine: <strong>Sostituisci</strong> o <strong>×</strong> per toglierla. Le immagini restano comunque nella Libreria media.</p>
			</td>
		</tr>
		<tr>
			<th>In evidenza</th>
			<td><label><input type="checkbox" name="mo_evidenza" value="1" <?php checked( $evid, '1' ); ?>> Mostra questo progetto nel sito</label><p class="description">Spento: il progetto sparisce da Portfolio, Carosello e pagina Progetti, e la sua pagina non si apre.</p></td>
		</tr>
	</table>
	<?php
}

add_action(
	'save_post_' . MO_CPT,
	function ( $post_id ) {
		if ( ! isset( $_POST['mo_progetto_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['mo_progetto_nonce'] ) ), 'mo_progetto_salva' ) ) {
			return;
		}
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
		$area = sanitize_key( wp_unslash( $_POST['mo_area'] ?? 'branding' ) );
		update_post_meta( $post_id, '_mo_area', array_key_exists( $area, mo_aree() ) ? $area : 'branding' );
		update_post_meta( $post_id, '_mo_tipo', sanitize_text_field( wp_unslash( $_POST['mo_tipo'] ?? '' ) ) );
		foreach ( array( 'richiesta', 'lavoro', 'risultato' ) as $k ) {
			update_post_meta( $post_id, '_mo_' . $k, sanitize_textarea_field( wp_unslash( $_POST[ 'mo_' . $k ] ?? '' ) ) );
		}
		$ids = implode( ',', array_filter( array_map( 'absint', explode( ',', (string) wp_unslash( $_POST['mo_galleria'] ?? '' ) ) ) ) );
		update_post_meta( $post_id, '_mo_galleria', $ids );
		$car = absint( wp_unslash( $_POST['mo_carosello_img'] ?? 0 ) );
		if ( $car && wp_attachment_is_image( $car ) ) {
			update_post_meta( $post_id, '_mo_carosello_img', $car );
		} else {
			delete_post_meta( $post_id, '_mo_carosello_img' );
		}
		update_post_meta( $post_id, '_mo_evidenza', empty( $_POST['mo_evidenza'] ) ? '0' : '1' );
	}
);

/* ---------------- Colonne dell'elenco progetti ---------------- */

add_filter(
	'manage_' . MO_CPT . '_posts_columns',
	function ( $cols ) {
		return array(
			'cb'          => $cols['cb'],
			'mo_cover'    => 'Copertina',
			'title'       => 'Progetto',
			'mo_area'     => 'Area',
			'mo_evidenza' => 'In evidenza',
			'mo_ordine'   => 'Ordine',
		);
	}
);
add_action(
	'manage_' . MO_CPT . '_posts_custom_column',
	function ( $col, $post_id ) {
		if ( 'mo_cover' === $col ) {
			echo get_the_post_thumbnail( $post_id, array( 80, 60 ) );
		} elseif ( 'mo_area' === $col ) {
			echo esc_html( mo_aree()[ get_post_meta( $post_id, '_mo_area', true ) ] ?? '' );
		} elseif ( 'mo_evidenza' === $col ) {
			echo '0' === get_post_meta( $post_id, '_mo_evidenza', true ) ? 'No' : 'Sì';
		} elseif ( 'mo_ordine' === $col ) {
			echo (int) get_post_field( 'menu_order', $post_id );
		}
	},
	10,
	2
);
add_action(
	'pre_get_posts',
	function ( $q ) {
		if ( is_admin() && $q->is_main_query() && MO_CPT === $q->get( 'post_type' ) && ! $q->get( 'orderby' ) ) {
			$q->set( 'orderby', array( 'menu_order' => 'ASC', 'date' => 'DESC' ) );
		}
	}
);
