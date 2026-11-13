<?php
/**
 * Gli 8 elementi MoveOn: campi (per WPBakery) e preparazione dei dati per i modelli HTML.
 * Ogni elemento è anche uno shortcode, es. [mo_hero]: funziona così anche senza WPBakery.
 */

defined( 'ABSPATH' ) || exit;

/* ---------- Costruttori dei campi di WPBakery ---------- */

function mo_p( string $type, string $name, string $heading, string $desc = '', string $group = 'Testi', array $extra = array() ): array {
	return array_merge(
		array(
			'type'        => $type,
			'param_name'  => $name,
			'heading'     => $heading,
			'description' => $desc,
			'group'       => $group,
			'admin_label' => false,
		),
		$extra
	);
}
function mo_p_text( $n, $h, $d = '', $g = 'Testi', $std = '' ) {
	return mo_p( 'textfield', $n, $h, $d, $g, array( 'std' => $std ) );
}
function mo_p_area( $n, $h, $d = '', $g = 'Testi', $std = '' ) {
	return mo_p( 'textarea', $n, $h, $d, $g, array( 'std' => $std ) );
}
function mo_p_img( $n, $h, $d = '', $g = 'Immagini' ) {
	return mo_p( 'attach_image', $n, $h, $d, $g );
}
function mo_p_drop( $n, $h, array $values, $std, $d = '', $g = 'Testi' ) {
	return mo_p( 'dropdown', $n, $h, $d, $g, array( 'value' => $values, 'std' => $std ) );
}
function mo_p_group( $n, $h, array $params, array $default, $d = '', $g = 'Elenchi' ) {
	return mo_p( 'param_group', $n, $h, $d, $g, array( 'params' => $params, 'value' => rawurlencode( wp_json_encode( $default ) ) ) );
}
function mo_p_anchor( $std ) {
	return mo_p_text( 'anchor', 'Ancora (indirizzo della sezione)', 'Il nome usato dai link del menu, es. «' . $std . '» → il link è #' . $std . '. Solo lettere minuscole e trattini.', 'Avanzate', $std );
}

/** Campi della scheda "Sfondo", uguali per tutti gli elementi. */
function mo_p_sfondo(): array {
	$opacita = array();
	foreach ( array( 5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100 ) as $n ) {
		$opacita[ $n . '%' ] = (string) $n;
	}
	return array(
		mo_p( 'colorpicker', 'sfondo_colore', 'Colore di sfondo (facoltativo)', 'Sostituisce il colore della sezione. Colori del sito: blu #2563eb, navy #0f172a, grigio chiaro #f8fafc, azzurro chiaro #eff6ff, giallo #f59e0b. Lascia vuoto per il colore originale.', 'Sfondo' ),
		mo_p_drop( 'sfondo_testi', 'Stile dei testi e delle card', array( 'Automatico (come la sezione)' => '', 'Chiari, per sfondi scuri' => 'chiari', 'Scuri, per sfondi chiari' => 'scuri' ), '', 'Se cambi il colore di sfondo, scegli i testi adatti perché restino leggibili. Funziona sulle sezioni chiare (Nastro, Chi siamo, Servizi, Portfolio, Garanzie); Hero, Pausa e Contatti hanno già testi chiari.', 'Sfondo' ),
		mo_p( 'colorpicker', 'colore_titoli', 'Colore dei titoli (facoltativo)', 'Titoli e frasi grandi della sezione. Lascia vuoto per il colore automatico.', 'Sfondo' ),
		mo_p( 'colorpicker', 'colore_testi', 'Colore dei testi (facoltativo)', 'Paragrafi, frasi sotto i titoli, note. Lascia vuoto per il colore automatico.', 'Sfondo' ),
		mo_p( 'colorpicker', 'colore_etichette', 'Colore di etichette e link (facoltativo)', 'Il piccolo titolo in maiuscolo sopra la sezione, i link e i numeri. Lascia vuoto per il blu del sito.', 'Sfondo' ),
		mo_p_img( 'sfondo_img', 'Immagine di sfondo', 'JPG o PNG. Sta sopra il colore e sotto testi e illustrazioni. Lascia vuoto per nessuna immagine.', 'Sfondo' ),
		mo_p_drop( 'sfondo_opacita', 'Opacità dell’immagine', $opacita, '30', '100% = piena; più è bassa, più l’immagine si fonde con il colore di sfondo.', 'Sfondo' ),
		mo_p_drop( 'sfondo_dimensione', 'Dimensione dell’immagine', array( 'Copre tutta la sezione' => 'cover', 'Intera, senza tagli' => 'contain', 'Grandezza originale' => 'auto' ), 'cover', '«Copre tutta la sezione» può tagliare i bordi dell’immagine; «Intera» la mostra tutta.', 'Sfondo' ),
		mo_p_text( 'sfondo_posizione', 'Posizione dell’immagine', 'In percentuale orizzontale e verticale: «50% 50%» = centrata, «50% 0%» = in alto, «100% 50%» = a destra. Vale anche per il video.', 'Sfondo', '50% 50%' ),
		mo_p_text( 'sfondo_video', 'Video di sfondo (facoltativo)', 'Carica il video in Media → Aggiungi file multimediale, aprilo, premi «Copia URL negli appunti» e incollalo qui. MP4, senza audio, 10–20 secondi (si ripete), al massimo 10–15 MB. Sta sopra l’immagine: l’immagine, se c’è, si vede mentre il video si carica e per chi ha scelto «riduci movimento».', 'Sfondo' ),
		mo_p_drop( 'sfondo_video_opacita', 'Opacità del video', $opacita, '40', '100% = pieno; più è bassa, più il video si fonde con il colore di sfondo.', 'Sfondo' ),
		mo_p_drop( 'sfondo_video_telefono', 'Video sul telefono', array( 'Sì, anche sul telefono' => '', 'No: sul telefono solo l’immagine (risparmia dati)' => 'no' ), '', '', 'Sfondo' ),
		mo_p_drop( 'sfondo_sfumatura', 'Sfumatura di video e immagine', mo_sfumature_sfondo(), '', 'Video e immagine svaniscono nel colore di sfondo verso i bordi scelti.', 'Sfondo' ),
		mo_p_drop( 'sfondo_sfumatura_ampiezza', 'Ampiezza della sfumatura', array( 'Corta' => '20', 'Media' => '35', 'Lunga' => '55' ), '35', 'Quanta parte della sezione occupa la sfumatura.', 'Sfondo' ),
	);
}

/** Dove sfumano video e immagine di sfondo. */
function mo_sfumature_sfondo(): array {
	return array( 'Nessuna' => '', 'In basso' => 'basso', 'In alto' => 'alto', 'In alto e in basso' => 'entrambi', 'Tutto intorno' => 'bordi' );
}

/** Indirizzo del video di sfondo: un URL (anche /wp-content/…) o il numero di un file della Libreria media. */
function mo_video_url( $v ): string {
	$v = trim( mo_text( (string) $v ) );
	if ( '' === $v ) {
		return '';
	}
	if ( ctype_digit( $v ) ) {
		$mime = (string) get_post_mime_type( (int) $v );
		return 0 === strpos( $mime, 'video/' ) ? (string) wp_get_attachment_url( (int) $v ) : '';
	}
	if ( '/' === $v[0] && '/' !== ( $v[1] ?? '' ) ) {
		return esc_url_raw( home_url( $v ) );
	}
	return esc_url_raw( $v, array( 'http', 'https' ) );
}

/** Colore sicuro: #rgb, #rrggbb(aa), rgb() o rgba(); altrimenti vuoto. */
function mo_colore( $v ): string {
	$v = trim( (string) $v );
	if ( preg_match( '/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i', $v ) ) {
		return $v;
	}
	if ( preg_match( '/^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*(?:0|1|0?\.\d+)\s*)?\)$/i', $v ) ) {
		return $v;
	}
	return '';
}

/**
 * Livelli di sfondo della sezione: colore (sotto) e immagine (sopra), entrambi sotto i contenuti.
 * Vuoto se nella scheda Sfondo non è stato scelto niente.
 */
function mo_sfondo_html( array $a ): string {
	$out   = '';
	$col   = mo_colore( $a['sfondo_colore'] ?? '' );
	$testi = in_array( $a['sfondo_testi'] ?? '', array( 'chiari', 'scuri' ), true ) ? $a['sfondo_testi'] : '';
	if ( $col || $testi ) {
		$out .= '<div class="mo-bg mo-bg--colore" aria-hidden="true"' . ( $testi ? ' data-testi="' . $testi . '"' : '' ) . ( $col ? ' style="background-color:' . esc_attr( $col ) . '"' : '' ) . '></div>';
	}
	// Colori dei testi scelti a mano: valgono solo per questa sezione
	$vars = array();
	foreach ( array( 'colore_titoli' => array( '--mo-ink' ), 'colore_testi' => array( '--mo-body', '--mo-muted' ), 'colore_etichette' => array( '--mo-link', '--mo-chip-ink' ) ) as $campo => $nomi ) {
		$c = mo_colore( $a[ $campo ] ?? '' );
		foreach ( $c ? $nomi : array() as $n ) {
			$vars[] = $n . ':' . $c;
		}
	}
	if ( $vars ) {
		$id   = 'mo-s' . substr( md5( implode( ';', $vars ) . wp_json_encode( $a ) ), 0, 10 );
		// I colori valgono per i contenuti della sezione (i figli), così la sezione conserva quelli
		// automatici in --mo-…-base: pulsanti e card, che hanno un loro sfondo, li riprendono (vedi moveon.css).
		$sel  = '.mo-block.mo-block:has(> .mo-bg-stile[data-mo-stile="' . $id . '"])';
		$testo = mo_colore( $a['colore_testi'] ?? '' );
		$out .= '<style>' . ( $testo ? $sel . '{color:' . $testo . '}' : '' ) . $sel . ' > *{' . implode( ';', $vars ) . '}</style><span hidden data-mo-stile="' . $id . '" class="mo-bg-stile"></span>';
	}
	$img   = absint( $a['sfondo_img'] ?? 0 ) ? mo_image( $a['sfondo_img'], '', '2048x2048' ) : null;
	$video = mo_video_url( $a['sfondo_video'] ?? '' );
	$dim   = in_array( $a['sfondo_dimensione'] ?? '', array( 'cover', 'contain', 'auto' ), true ) ? $a['sfondo_dimensione'] : 'cover';
	list( $x, $y ) = mo_focus( $a['sfondo_posizione'] ?? '50% 50%' );
	// Sfumatura di video e immagine verso il colore di sfondo
	$dove  = in_array( $a['sfondo_sfumatura'] ?? '', mo_sfumature_sfondo(), true ) ? (string) $a['sfondo_sfumatura'] : '';
	$amp   = (string) ( $a['sfondo_sfumatura_ampiezza'] ?? '35' );
	$amp   = in_array( $amp, array( '20', '35', '55' ), true ) ? $amp : '35';
	$sfuma = $dove ? ' data-sfuma="' . $dove . '"' : '';
	$amp   = $dove ? ';--mo-sf-amp:' . $amp . '%' : '';
	if ( $img ) {
		$op   = max( 0, min( 100, (int) ( $a['sfondo_opacita'] ?? 30 ) ) ) / 100;
		$out .= '<div class="mo-bg mo-bg--foto" aria-hidden="true"' . $sfuma . ' style="background-image:url(\'' . esc_url( $img['url'] ) . '\');background-size:' . $dim . ';background-position:' . $x . '% ' . $y . '%;opacity:' . $op . $amp . '"></div>';
	}
	if ( $video ) {
		// Il video parte solo quando la sezione è vicina allo schermo e si ferma quando esce (moveon.js)
		$op   = max( 0, min( 100, (int) ( $a['sfondo_video_opacita'] ?? 40 ) ) ) / 100;
		$tel  = 'no' === ( $a['sfondo_video_telefono'] ?? '' ) ? ' data-telefono="no"' : '';
		$out .= '<div class="mo-bg mo-bg--video" aria-hidden="true"' . $sfuma . ' style="opacity:' . $op . $amp . '"><video class="mo-bg-video" muted loop playsinline disablepictureinpicture preload="none" tabindex="-1" data-src="' . esc_url( $video ) . '"' . $tel . ' style="object-fit:' . ( 'contain' === $dim ? 'contain' : 'cover' ) . ';object-position:' . $x . '% ' . $y . '%"></video></div>';
	}
	return $out;
}

/**
 * Simboli dei timbri delle Garanzie (dentro il cerchio, viewBox 80×80, tratto del colore dei link).
 * Senza scelta nel pannello, le garanzie li prendono in quest'ordine.
 */
function mo_simboli_garanzie(): array {
	return array(
		'documento'   => array( 'Documento (preventivo)', '<path d="M31 25h13l7 7v23H31z"/><path d="M44 25v7h7"/><path d="M35.5 40h11M35.5 45.5h11M35.5 51h6"/>' ),
		'calendario'  => array( 'Calendario (tempi)', '<rect x="26" y="29" width="28" height="25" rx="3"/><path d="M26 37h28M33 25v7M47 25v7"/><path d="M34 45.5l4 4 8-8"/>' ),
		'revisioni'   => array( 'Frecce in cerchio (revisioni)', '<path d="M51.5 36.5A12 12 0 0 0 29.5 33"/><path d="M28.5 43.5A12 12 0 0 0 50.5 47"/><path d="M29 26.5v6.5h6.5"/><path d="M51 53.5V47h-6.5"/>' ),
		'cartella'    => array( 'Cartella (i file sono tuoi)', '<path d="M26 31a2 2 0 0 1 2-2h8l3 4h13a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H28a2 2 0 0 1-2-2z"/><path d="M40 37.5v10M35.5 43l4.5 4.5 4.5-4.5"/>' ),
		'persona'     => array( 'Persona (un referente)', '<circle cx="40" cy="33" r="6.5"/><path d="M28 53.5c1.5-7 6.2-10.5 12-10.5s10.5 3.5 12 10.5"/>' ),
		'assistenza'  => array( 'Cuffie (assistenza)', '<path d="M28 45v-5a12 12 0 0 1 24 0v5"/><rect x="25" y="43" width="7" height="11" rx="2.5"/><rect x="48" y="43" width="7" height="11" rx="2.5"/><path d="M51.5 54c0 2.5-3 4-8.5 4"/>' ),
		'spunta'      => array( 'Spunta', '<path d="M28 41l8 8 16-17"/>' ),
		'scudo'       => array( 'Scudo (sicurezza)', '<path d="M40 25l12 4.5v9c0 8-5.2 13.3-12 16.5-6.8-3.2-12-8.5-12-16.5v-9z"/><path d="M34.5 40.5l4 4 7.5-7.5"/>' ),
		'stella'      => array( 'Stella (qualità)', '<path d="M40 26l4.2 8.6 9.4 1.4-6.8 6.6 1.6 9.4L40 47.6 31.6 52l1.6-9.4-6.8-6.6 9.4-1.4z"/>' ),
		'euro'        => array( 'Euro (prezzo)', '<path d="M51 30.5a11 11 0 1 0 0 19"/><path d="M28 37.5h14M28 43h14"/>' ),
		'lucchetto'   => array( 'Lucchetto (riservatezza)', '<rect x="29" y="38" width="22" height="16" rx="3"/><path d="M33.5 38v-4.5a6.5 6.5 0 0 1 13 0V38"/><path d="M40 44v4"/>' ),
		'fulmine'     => array( 'Fulmine (velocità)', '<path d="M43 25L31 43h9l-3 12 12-18h-9z"/>' ),
	);
}

/** Definizioni degli elementi: nome, descrizione, campi. */
function mo_blocks(): array {
	$d     = mo_defaults();
	$stili = array( 'Navy' => 'navy', 'Blu' => 'blu', 'Blu chiaro' => 'bluchiaro', 'Riempita con foto' => 'foto' );
	$icone = array( 'Orologio (esperienza)' => 'orologio', 'Bussola (consulenza)' => 'bussola', 'Rete (contatti, partner)' => 'rete', 'Scatola (servizio completo)' => 'scatola', 'Lampadina (idee)' => 'lampadina', 'Stella (qualità)' => 'stella', 'Cuore (passione)' => 'cuore', 'Grafico (risultati)' => 'grafico' );
	$colori = array( 'Bianco' => 'bianco', 'Grigio chiaro' => 'grigio', 'Blu' => 'blu', 'Navy' => 'navy' );
	$illu  = array( 'Identità (rombo e cerchio)' => 'identita', 'Web (finestra con cursore)' => 'web', 'Social (telefono e cuori)' => 'social', 'App (sito che diventa app)' => 'app', 'Rete (pianeti in orbita)' => 'rete', 'Formazione (livelli)' => 'formazione' );
	$simboli = array( 'Automatica' => '' );
	foreach ( mo_simboli_garanzie() as $k => $v ) {
		$simboli[ $v[0] ] = $k;
	}
	$fuoco = 'Il punto della foto da tenere sempre visibile, in percentuale orizzontale e verticale. Es. «50% 50%» = centro, «30% 40%» = un po’ a sinistra e in alto.';

	$blocchi = array(
		'hero'      => array(
			'name'   => 'MoveOn · Hero',
			'desc'   => 'Titolo grande parola per parola su immagini a tutto schermo (una per settore) che si compongono pixel dopo pixel; in alternativa la lampadina in pixel.',
			'params' => array(
				mo_p_area( 'titolo', 'Titolo principale', 'Massimo 8 parole. Va a capo dove premi Invio (oppure scrivi | dove vuoi andare a capo). Es. «Creatività, | strategia | e risultati.»', 'Testi', $d['hero']['titolo'] ),
				mo_p_text( 'parola', 'Parola sottolineata in giallo', 'Scrivi esattamente una parola del titolo, punteggiatura compresa (es. «risultati.»). Scrivi - (un trattino) per nessuna sottolineatura.', 'Testi', $d['hero']['parola'] ),
				mo_p_area( 'testo', 'Testo sotto il titolo', 'Massimo 2 frasi: beneficio prima della caratteristica.', 'Testi', $d['hero']['testo'] ),
				mo_p_text( 'pulsante_testo', 'Pulsante: testo', 'Verbo all’imperativo + oggetto, es. «Scopri i Servizi». Scrivi - (un trattino) per non mostrarlo.', 'Testi', $d['hero']['pulsante_testo'] ),
				mo_p_text( 'pulsante_link', 'Pulsante: porta a', 'L’ancora di una sezione (es. #servizi) oppure un indirizzo intero.', 'Testi', $d['hero']['pulsante_link'] ),
				mo_p_drop( 'stile', 'Dietro al titolo', array( 'Immagini a tutto schermo (una per settore)' => 'slide', 'Lampadina in pixel (versione precedente)' => 'lampadina' ), $d['hero']['stile'], '', 'Immagini' ),
				mo_p_group(
					'slide',
					'Immagini (una per settore)',
					array(
						mo_p_text( 'settore', 'Settore', 'Breve, es. «Grafica»: compare in basso, sotto la barra che si riempie.', '' ),
						mo_p_img( 'immagine', 'Immagine (orizzontale, almeno 1920 px)', 'JPG o PNG. Se manca si usa un’immagine di prova.', '' ),
						mo_p_text( 'posizione', 'Punto focale', 'La parte da tenere sempre visibile: 50% 50% = centro; 30% 40% = più a sinistra e in alto.', '' ),
					),
					$d['hero']['slide'],
					'Trascinale per cambiare l’ordine. Con una sola immagine non scorre.',
					'Immagini'
				),
				mo_p_drop( 'durata', 'Tempo per ogni immagine', array( '4 secondi' => '4', '6 secondi' => '6', '8 secondi' => '8', '10 secondi' => '10' ), $d['hero']['durata'], '', 'Immagini' ),
				mo_p_drop( 'transizione', 'Passaggio tra le immagini', array( 'Pixel che si compongono (disegno diverso ogni volta)' => 'pixel', 'Dissolvenza' => 'dissolvenza' ), $d['hero']['transizione'], '', 'Immagini' ),
				mo_p_drop( 'scurimento', 'Velo scuro sulle immagini', array( 'Leggero (30%)' => '30', 'Medio (45%)' => '45', 'Forte (60%)' => '60' ), $d['hero']['scurimento'], 'Rende il testo leggibile su qualsiasi foto.', 'Immagini' ),
				mo_p_anchor( $d['hero']['anchor'] ),
				...mo_p_sfondo(),
			),
		),
		'nastro'    => array(
			'name'   => 'MoveOn · Nastro parole chiave',
			'desc'   => 'Due righe di parole in movimento continuo, legate alla velocità di scroll.',
			'params' => array(
				mo_p_group( 'riga1', 'Prima riga', array( mo_p_text( 'testo', 'Parola', '', '' ), mo_p_drop( 'stile', 'Stile', $stili, 'navy', '«Riempita con foto» usa la foto della scheda Immagini dentro le lettere.', '' ) ), $d['nastro']['riga1'], 'Da 4 a 6 parole. Trascinale per cambiare l’ordine.' ),
				mo_p_group( 'riga2', 'Seconda riga', array( mo_p_text( 'testo', 'Parola', '', '' ), mo_p_drop( 'stile', 'Stile', $stili, 'navy', '', '' ) ), $d['nastro']['riga2'], 'Scorre nel verso opposto. Da 4 a 6 parole.' ),
				mo_p_img( 'foto', 'Foto per le parole riempite', 'Colori saturi e contrastati funzionano meglio. Almeno 1200 px di larghezza.' ),
				mo_p_text( 'foto_pos', 'Punto focale della foto', $fuoco, 'Immagini', $d['nastro']['foto_pos'] ),
				mo_p_anchor( $d['nastro']['anchor'] ),
				...mo_p_sfondo(),
			),
		),
		'chi_siamo' => array(
			'name'   => 'MoveOn · Chi siamo',
			'desc'   => 'Numero grande riempito dalla foto, manifesto, "dall’idea al prodotto", motivi che si impilano.',
			'params' => array(
				mo_p_text( 'etichetta', 'Etichetta in alto', 'Il piccolo titolo blu in maiuscolo sopra la sezione (il maiuscolo lo mette il sito).', 'Testi', $d['chi_siamo']['etichetta'] ),
				mo_p_text( 'numero', 'Numero grande', 'Massimo 3 caratteri, es. «25».', 'Testi', $d['chi_siamo']['numero'] ),
				mo_p_text( 'frase_numero', 'Frase accanto al numero', 'Es. «anni di creatività e innovazione».', 'Testi', $d['chi_siamo']['frase_numero'] ),
				mo_p_area( 'manifesto', 'Manifesto', 'Massimo 80 parole: si accende parola per parola mentre scorri.', 'Testi', $d['chi_siamo']['manifesto'] ),
				mo_p_text( 'idea_titolo', 'Titolo «Dall’idea al prodotto finito»', '', 'Testi', $d['chi_siamo']['idea_titolo'] ),
				mo_p_area( 'idea_testo', 'Testo «Dall’idea al prodotto finito»', '2–3 frasi.', 'Testi', $d['chi_siamo']['idea_testo'] ),
				mo_p_text( 'passo_da', 'Etichetta della linea: inizio', 'Es. «Idea».', 'Testi', $d['chi_siamo']['passo_da'] ),
				mo_p_text( 'passo_a', 'Etichetta della linea: fine', 'Es. «Prodotto finito».', 'Testi', $d['chi_siamo']['passo_a'] ),
				mo_p_text( 'motivi_titolo', 'Titolo dei motivi', '', 'Testi', $d['chi_siamo']['motivi_titolo'] ),
				mo_p_area( 'chiusura', 'Frase di chiusura', 'Si accende parola per parola.', 'Testi', $d['chi_siamo']['chiusura'] ),
				mo_p_text( 'link_testo', 'Link finale: testo cliccabile', 'Es. «Contattaci oggi stesso». Scrivi - (un trattino) per non mostrare la riga.', 'Testi', $d['chi_siamo']['link_testo'] ),
				mo_p_text( 'link_resto', 'Link finale: testo dopo il link', '', 'Testi', $d['chi_siamo']['link_resto'] ),
				mo_p_text( 'link_href', 'Link finale: porta a', 'Es. #contatti', 'Testi', $d['chi_siamo']['link_href'] ),
				mo_p_group(
					'motivi',
					'Motivi',
					array(
						mo_p_text( 'titolo', 'Titolo', '', '' ),
						mo_p_area( 'testo', 'Testo', '', '' ),
						mo_p_drop( 'icona', 'Icona', $icone, 'stella', '', '' ),
						mo_p_img( 'icona_img', 'Icona personalizzata (facoltativa)', 'Un’immagine tua al posto dell’icona scelta sopra: meglio SVG o PNG trasparente, quadrata, a tinta unita.', '' ),
						mo_p_area( 'etichette', 'Etichette (facoltative)', 'Una per riga.', '' ),
					),
					$d['chi_siamo']['motivi'],
					'Le card che si impilano, da 3 a 5. Il colore si alterna da solo.'
				),
				mo_p_img( 'foto_numero', 'Foto che riempie il numero', 'Almeno 1200 px di larghezza.' ),
				mo_p_text( 'foto_pos', 'Punto focale della foto', $fuoco, 'Immagini', $d['chi_siamo']['foto_pos'] ),
				mo_p_img( 'idea_immagine', 'Immagine dell’idea (facoltativa)', 'Se la lasci vuota resta l’animazione del cubo che si disegna.' ),
				mo_p_anchor( $d['chi_siamo']['anchor'] ),
				...mo_p_sfondo(),
			),
		),
		'pausa'     => array(
			'name'   => 'MoveOn · Pausa emozionale',
			'desc'   => 'Foto che si apre da un cerchio a tutto schermo, con pixel e onde. Mettila in una riga senza margini.',
			'params' => array(
				mo_p_area( 'frase', 'Frase', 'Massimo 8 parole. Va a capo dove premi Invio (oppure con |).', 'Testi', $d['pausa']['frase'] ),
				mo_p_img( 'foto', 'Foto', 'Orizzontale, almeno 1600 px. Controlla che i bordi non abbiano strisce chiare.' ),
				mo_p_text( 'punto_focale', 'Punto focale (centro del cerchio iniziale)', $fuoco, 'Immagini', $d['pausa']['punto_focale'] ),
				mo_p_anchor( $d['pausa']['anchor'] ),
				...mo_p_sfondo(),
			),
		),
		'servizi'   => array(
			'name'   => 'MoveOn · Servizi',
			'desc'   => 'Schede in scorrimento orizzontale su computer, carosello a swipe su telefono. Mettila in una riga senza margini.',
			'params' => array(
				mo_p_text( 'etichetta', 'Etichetta in alto', '', 'Testi', $d['servizi']['etichetta'] ),
				mo_p_area( 'apertura', 'Frase di apertura', '', 'Testi', $d['servizi']['apertura'] ),
				mo_p_text( 'finale_frase', 'Frase finale', 'L’ultima scheda, dopo i servizi.', 'Testi', $d['servizi']['finale_frase'] ),
				mo_p_text( 'pulsante_testo', 'Pulsante finale: testo', 'Scrivi - (un trattino) per non mostrarlo.', 'Testi', $d['servizi']['pulsante_testo'] ),
				mo_p_text( 'pulsante_link', 'Pulsante finale: porta a', '', 'Testi', $d['servizi']['pulsante_link'] ),
				mo_p_group(
					'servizi',
					'Servizi',
					array(
						mo_p_text( 'nome', 'Nome', '', '' ),
						mo_p_area( 'beneficio', 'Frase di beneficio', 'Massimo 2 frasi.', '' ),
						mo_p_area( 'voci', 'Voci incluse', 'Una per riga.', '' ),
						mo_p_img( 'immagine', 'Immagine (4:3 o 1:1)', 'Facoltativa: se vuota resta l’illustrazione animata scelta sotto.', '' ),
						mo_p_drop( 'illustrazione', 'Illustrazione di riserva', $illu, 'identita', '', '' ),
						mo_p_text( 'parola_sfondo', 'Parola di sfondo', 'La parola gigante e trasparente dietro la scheda.', '' ),
						mo_p_text( 'link', '«Scopri di più» porta a', 'La pagina del servizio, es. /servizi/grafica/. Vuoto = niente link.', '' ),
						mo_p_drop( 'colore', 'Colore della scheda', $colori, 'bianco', '', '' ),
					),
					$d['servizi']['servizi'],
					'Trascinali per cambiare l’ordine.'
				),
				mo_p_anchor( $d['servizi']['anchor'] ),
				...mo_p_sfondo(),
			),
		),
		'carosello' => array(
			'name'   => 'MoveOn · Portfolio',
			'desc'   => 'I progetti in un carosello 3D da trascinare; ogni progetto apre la sua pagina. I progetti si gestiscono da "Progetti portfolio".',
			'params' => array(
				mo_p_text( 'etichetta', 'Etichetta in alto', '', 'Testi', $d['carosello']['etichetta'] ),
				mo_p_text( 'titolo', 'Titolo', 'Scrivi - (un trattino) per non mostrarlo.', 'Testi', $d['carosello']['titolo'] ),
				mo_p_area( 'testo', 'Testo', 'Scrivi - (un trattino) per non mostrarlo.', 'Testi', $d['carosello']['testo'] ),
				mo_p_drop( 'filtri', 'Filtri per area', array( 'Mostra' => 'si', 'Nascondi' => 'no' ), $d['carosello']['filtri'], 'I pulsanti Tutti, Branding, Web… sopra il carosello.' ),
				mo_p_text( 'pulsante', 'Pulsante verso la pagina Progetti', 'Porta alla pagina con tutti i lavori. Scrivi - (un trattino) per non mostrarlo.', 'Testi', $d['carosello']['pulsante'] ),
				mo_p_anchor( $d['carosello']['anchor'] ),
				...mo_p_sfondo(),
			),
		),
		'garanzie'  => array(
			'name'   => 'MoveOn · Garanzie',
			'desc'   => 'Scudo in pixel che si compone, sigillo rotante, timbri sulle card.',
			'params' => array(
				mo_p_text( 'etichetta', 'Etichetta in alto', '', 'Testi', $d['garanzie']['etichetta'] ),
				mo_p_text( 'titolo', 'Titolo', '', 'Testi', $d['garanzie']['titolo'] ),
				mo_p_area( 'sottotitolo', 'Sottotitolo', '', 'Testi', $d['garanzie']['sottotitolo'] ),
				mo_p_text( 'sigillo', 'Scritta del sigillo', 'Gira intorno allo scudo, ripetuta 2 volte. Separa le parti con una virgola.', 'Testi', $d['garanzie']['sigillo'] ),
				mo_p_group( 'garanzie', 'Garanzie', array( mo_p_text( 'titolo', 'Titolo', '', '' ), mo_p_area( 'testo', 'Testo', '', '' ), mo_p_drop( 'icona', 'Icona del timbro', $simboli, '', '«Automatica»: ogni garanzia prende un’icona diversa, nell’ordine dell’elenco.', '' ) ), $d['garanzie']['garanzie'], 'Da 3 a 6. Solo impegni che puoi mantenere: sostituisci i «[N]» con i numeri reali.' ),
				mo_p_anchor( $d['garanzie']['anchor'] ),
				...mo_p_sfondo(),
			),
		),
		'contatti'  => array(
			'name'   => 'MoveOn · Contatti',
			'desc'   => 'Foto con bollino rotante, modulo che invia l’email, pulsanti Chiamaci / Chatta / Scrivici.',
			'params' => array(
				mo_p_text( 'etichetta', 'Etichetta in alto', '', 'Testi', $d['contatti']['etichetta'] ),
				mo_p_area( 'titolo', 'Titolo', 'Va a capo dove premi Invio (oppure con |).', 'Testi', $d['contatti']['titolo'] ),
				mo_p_area( 'testo', 'Testo', '', 'Testi', $d['contatti']['testo'] ),
				mo_p_text( 'bollino', 'Scritta del bollino rotante', 'Massimo 24 caratteri.', 'Testi', $d['contatti']['bollino'] ),
				mo_p_area( 'opzioni', 'Voci di «Di cosa hai bisogno?»', 'Una per riga.', 'Testi', $d['contatti']['opzioni'] ),
				mo_p_text( 'titolo_pulsanti', 'Titolo dei pulsanti', '', 'Testi', $d['contatti']['titolo_pulsanti'] ),
				mo_p_area( 'conferma', 'Messaggio di conferma', 'Mostrato dopo l’invio, sotto «Grazie, [nome]!».', 'Testi', $d['contatti']['conferma'] ),
				mo_p_img( 'foto', 'Foto (4:5)', 'Almeno 800 px di larghezza.' ),
				mo_p_text( 'foto_pos', 'Punto focale della foto', $fuoco, 'Immagini', $d['contatti']['foto_pos'] ),
				mo_p_anchor( $d['contatti']['anchor'] ),
				...mo_p_sfondo(),
			),
		),
	);
	// Gli elementi per comporre le pagine (sezioni.php) si aggiungono a quelli della home
	return array_merge( $blocchi, mo_sezioni_def( $d ) );
}

/** Valori iniziali di un elemento (per lo shortcode senza attributi). */
function mo_block_defaults( string $key ): array {
	$d = mo_defaults()[ $key ] ?? array();
	foreach ( $d as $k => $v ) {
		if ( is_array( $v ) ) {
			$d[ $k ] = rawurlencode( wp_json_encode( $v ) );
		}
	}
	return $d;
}

/** Attributi dello shortcode uniti ai valori iniziali. Un campo svuotato in WPBakery resta vuoto. */
function mo_atts( string $key, $atts ): array {
	$atts = is_array( $atts ) ? $atts : array();
	$def  = mo_block_defaults( $key );
	foreach ( mo_blocks()[ $key ]['params'] as $p ) {
		if ( 'attach_image' === $p['type'] ) {
			$def[ $p['param_name'] ] = '';
		}
	}
	return array_merge( $def, $atts );
}

/* ================= Preparazione dei dati per ogni modello ================= */

function mo_render_hero( $atts ): string {
	$a    = mo_atts( 'hero', $atts );
	$mark = mo_text( $a['parola'] );
	$mark = '-' === $mark ? '' : $mark; // il trattino nasconde
	$done = false;
	$rows = array();
	foreach ( mo_lines( $a['titolo'] ) as $line ) {
		$words = preg_split( '/\s+/u', $line );
		$parts = array();
		foreach ( $words as $i => $w ) {
			$is      = ! $done && '' !== $mark && $w === $mark;
			$done    = $done || $is;
			$parts[] = array( 'testo' => $w, 'evidenziata' => $is, 'spazio' => $i < count( $words ) - 1 );
		}
		$rows[] = array( 'parole' => $parts );
	}
	$btn = mo_text( $a['pulsante_testo'] );
	$btn = '-' === $btn ? '' : $btn; // il trattino nasconde
	// Immagini a tutto schermo (una per settore); se manca una foto si usa un'immagine di prova
	$slide_mode = 'lampadina' !== mo_text( $a['stile'] );
	$slides     = array();
	$prova      = array( 'idea', 'pausa', 'contatti' );
	foreach ( mo_group( $a['slide'] ) as $i => $s ) {
		$img = mo_image( $s['immagine'] ?? 0, $prova[ $i % 3 ], '2048x2048' );
		if ( ! $img ) {
			continue;
		}
		list( $x, $y ) = mo_focus( $s['posizione'] ?? '', array( 50, 50 ) );
		$n             = count( $slides );
		$slides[]      = array(
			'n'       => $n,
			'num'     => sprintf( '%02d', $n + 1 ),
			'settore' => mo_text( $s['settore'] ?? '' ),
			'url'     => $img['url'],
			'w'       => $img['w'],
			'h'       => $img['h'],
			'pos'     => $x . '% ' . $y . '%',
			'primo'   => 0 === $n,
		);
	}
	$durata = in_array( mo_text( $a['durata'] ), array( '4', '6', '8', '10' ), true ) ? mo_text( $a['durata'] ) : '6';
	$velo   = in_array( mo_text( $a['scurimento'] ), array( '30', '45', '60' ), true ) ? mo_text( $a['scurimento'] ) : '45';
	return MO_Tpl::render(
		'hero',
		array(
			'anchor'       => mo_anchor( $a['anchor'], 'top' ),
			'sfondo'       => mo_sfondo_html( $a ),
			'righe'        => $rows,
			'titolo_piano' => implode( ' ', mo_lines( $a['titolo'] ) ),
			'testo'        => mo_text( $a['testo'] ),
			'pulsante'     => '' !== $btn ? array( 'testo' => $btn, 'href' => mo_href( $a['pulsante_link'] ) ) : null,
			'bulb'         => $slide_mode && $slides ? '' : mo_pixels( 'bulb' ),
			'slide_mode'   => $slide_mode && $slides,
			'slides'       => $slides,
			'piu_slide'    => count( $slides ) > 1,
			'durata'       => $durata,
			'transizione'  => 'dissolvenza' === mo_text( $a['transizione'] ) ? 'dissolvenza' : 'pixel',
			'velo'         => (string) ( (int) $velo / 100 ),
		)
	);
}

function mo_render_nastro( $atts ): string {
	$a     = mo_atts( 'nastro', $atts );
	$img   = mo_image( $a['foto'], 'idea', '2048x2048' );
	$cls   = array( 'navy' => '', 'blu' => 'mo-blu', 'bluchiaro' => 'mo-bluchiaro', 'foto' => 'mo-photo' );
	$righe = array();
	foreach ( array( 'riga1', 'riga2' ) as $r ) {
		$words = array();
		foreach ( mo_group( $a[ $r ] ) as $i => $w ) {
			$c       = $cls[ $w['stile'] ?? 'navy' ] ?? '';
			$words[] = array( 'testo' => mo_text( $w['testo'] ?? '' ), 'classe' => trim( $c . ( 2 === $i ? ' mo-amber' : '' ) ) );
		}
		// ripetute 3 volte per lo scorrimento continuo, come nel prototipo
		$righe[] = array( 'parole' => array_merge( $words, $words, $words ) );
	}
	return MO_Tpl::render(
		'nastro',
		array(
			'anchor'   => mo_anchor( $a['anchor'], 'parole' ),
			'sfondo'   => mo_sfondo_html( $a ),
			'foto_url' => $img ? $img['url'] : '',
			'foto_pos' => implode( '% ', mo_focus( $a['foto_pos'], array( 30, 45 ) ) ) . '%',
			'righe'    => $righe,
		)
	);
}

function mo_render_chi_siamo( $atts ): string {
	$a      = mo_atts( 'chi_siamo', $atts );
	$img    = mo_image( $a['foto_numero'], 'idea', '2048x2048' );
	$toni   = array( 'mo-r-tint', 'mo-r-blue', 'mo-r-navy', 'mo-r-light' );
	$motivi = array();
	foreach ( mo_group( $a['motivi'] ) as $i => $m ) {
		$et       = mo_list( $m['etichette'] ?? '' );
		$icona    = preg_replace( '/[^a-z]/', '', (string) ( $m['icona'] ?? 'stella' ) );
		$motivi[] = array(
			'tono'          => $toni[ $i % 4 ],
			'i'             => $i,
			'icona'         => mo_icona_motivo( $m, $icona ),
			'titolo'        => mo_text( $m['titolo'] ?? '' ),
			'testo'         => mo_text( $m['testo'] ?? '' ),
			'etichette'     => $et,
			'ha_etichette'  => (bool) $et,
		);
	}
	$idea = absint( $a['idea_immagine'] ) ? mo_image( $a['idea_immagine'], '', 'large' ) : null;
	$link = mo_text( $a['link_testo'] );
	$link = '-' === $link ? '' : $link; // il trattino nasconde
	return MO_Tpl::render(
		'chi-siamo',
		array(
			'anchor'        => mo_anchor( $a['anchor'], 'chi-siamo' ),
			'sfondo'        => mo_sfondo_html( $a ),
			'etichetta'     => mo_text( $a['etichetta'] ),
			'numero'        => mo_text( $a['numero'] ),
			'foto_url'      => $img ? $img['url'] : '',
			'foto_pos'      => implode( '% ', mo_focus( $a['foto_pos'], array( 30, 45 ) ) ) . '%',
			'frase_numero'  => mo_text( $a['frase_numero'] ),
			'manifesto'     => mo_text( $a['manifesto'] ),
			'idea_titolo'   => mo_text( $a['idea_titolo'] ),
			'idea_testo'    => mo_text( $a['idea_testo'] ),
			'passo_da'      => mo_text( $a['passo_da'] ),
			'passo_a'       => mo_text( $a['passo_a'] ),
			'idea_img'      => $idea,
			'motivi_titolo' => mo_text( $a['motivi_titolo'] ),
			'motivi'        => $motivi,
			'chiusura'      => mo_text( $a['chiusura'] ),
			'link'          => '' !== $link ? array( 'testo' => $link, 'resto' => mo_text( $a['link_resto'] ), 'href' => mo_href( $a['link_href'] ) ) : null,
		)
	);
}

/** Icona di un motivo: l'immagine caricata, se c'è, altrimenti l'icona scelta dall'elenco. */
function mo_icona_motivo( array $m, string $icona ): string {
	$img = absint( $m['icona_img'] ?? 0 ) ? mo_image( $m['icona_img'], '', 'thumbnail' ) : null;
	if ( $img ) {
		return '<img class="mo-reason-img" src="' . esc_url( $img['url'] ) . '" alt="">';
	}
	return MO_Tpl::render( 'parti/icona-' . ( $icona ?: 'stella' ) );
}

function mo_render_pausa( $atts ): string {
	$a = mo_atts( 'pausa', $atts );
	list( $fx, $fy ) = mo_focus( $a['punto_focale'], array( 50, 32 ) );
	$img = mo_image( $a['foto'], 'pausa', '2048x2048' );
	if ( $img ) {
		$img['pos'] = $fx . '% ' . $fy . '%';
	}
	$righe = mo_lines( $a['frase'] );
	return MO_Tpl::render(
		'pausa',
		array(
			'anchor'      => mo_anchor( $a['anchor'], 'pausa' ),
			'sfondo'      => mo_sfondo_html( $a ),
			'fx'          => $fx,
			'fy'          => $fy,
			'foto'        => $img,
			'righe'       => $righe,
			'frase_piana' => implode( ' ', $righe ),
		)
	);
}

function mo_render_servizi( $atts ): string {
	$a       = mo_atts( 'servizi', $atts );
	$toni    = array( 'bianco' => 'mo-t-light', 'grigio' => 'mo-t-alt', 'blu' => 'mo-t-blue', 'navy' => 'mo-t-navy' );
	$validi  = array( 'identita', 'web', 'social', 'app', 'rete', 'formazione' );
	$servizi = array();
	foreach ( mo_group( $a['servizi'] ) as $s ) {
		$art       = in_array( $s['illustrazione'] ?? '', $validi, true ) ? $s['illustrazione'] : 'identita';
		$servizi[] = array(
			'nome'          => mo_text( $s['nome'] ?? '' ),
			'beneficio'     => mo_text( $s['beneficio'] ?? '' ),
			'voci'          => mo_list( $s['voci'] ?? '' ),
			'tono'          => $toni[ $s['colore'] ?? 'bianco' ] ?? 'mo-t-light',
			'immagine'      => absint( $s['immagine'] ?? 0 ) ? mo_image( $s['immagine'], '', 'large' ) : null,
			'art_key'       => $art,
			'art'           => MO_Tpl::render( 'parti/illustrazione-' . $art ),
			'parola_sfondo' => mo_text( $s['parola_sfondo'] ?? '' ),
			'link'          => mo_href( $s['link'] ?? '' ),
		);
	}
	$btn = mo_text( $a['pulsante_testo'] );
	$btn = '-' === $btn ? '' : $btn; // il trattino nasconde
	return MO_Tpl::render(
		'servizi',
		array(
			'anchor'       => mo_anchor( $a['anchor'], 'servizi' ),
			'sfondo'       => mo_sfondo_html( $a ),
			'etichetta'    => mo_text( $a['etichetta'] ),
			'apertura'     => mo_text( $a['apertura'] ),
			'servizi'      => $servizi,
			'totale'       => count( $servizi ),
			'primo_nome'   => $servizi[0]['nome'] ?? '',
			'finale_frase' => mo_text( $a['finale_frase'] ),
			'pulsante'     => '' !== $btn ? array( 'testo' => $btn, 'href' => mo_href( $a['pulsante_link'] ) ) : null,
		)
	);
}

function mo_render_carosello( $atts ): string {
	$a        = mo_atts( 'carosello', $atts );
	$progetti = array();
	foreach ( mo_progetti_in_evidenza() as $i => $p ) {
		if ( empty( $p['carosello'] ) ) {
			continue;
		}
		$progetti[] = array(
			'i'         => count( $progetti ),
			'url'       => $p['url'],
			'nome'      => $p['nome'],
			'tipo'      => $p['tipo'],
			'area'      => $p['area'],
			'area_nome' => $p['area_nome'],
			'immagine'  => $p['carosello'],
		);
	}
	$filtri = array();
	if ( 'no' !== mo_text( $a['filtri'] ) ) {
		$presenti = array_unique( array_column( $progetti, 'area' ) );
		foreach ( mo_aree() as $k => $nome ) {
			if ( in_array( $k, $presenti, true ) ) {
				$filtri[] = array( 'valore' => $k, 'nome' => $nome );
			}
		}
	}
	$pulsante = mo_text( $a['pulsante'] );
	$totale   = count( $progetti );
	return MO_Tpl::render(
		'carosello',
		array(
			'anchor'    => mo_anchor( $a['anchor'], 'progetti' ),
			'sfondo'    => mo_sfondo_html( $a ),
			'etichetta' => mo_text( $a['etichetta'] ),
			'titolo'    => '-' === mo_text( $a['titolo'] ) ? '' : mo_text( $a['titolo'] ),
			'testo'     => '-' === mo_text( $a['testo'] ) ? '' : mo_text( $a['testo'] ),
			'filtri'    => $filtri,
			'ha_filtri' => count( $filtri ) > 1,
			'progetti'  => $progetti,
			'primo'     => $progetti[0] ?? null,
			'totale'    => sprintf( '%02d', $totale ),
			'pulsante'  => '' !== $pulsante && '-' !== $pulsante ? array( 'testo' => $pulsante, 'href' => mo_progetti_url() ) : null,
		)
	);
}

function mo_render_garanzie( $atts ): string {
	$a   = mo_atts( 'garanzie', $atts );
	$gar = array();
	$sim = mo_simboli_garanzie();
	$ord = array_keys( $sim );
	foreach ( array_values( mo_group( $a['garanzie'] ) ) as $i => $g ) {
		$k     = (string) ( $g['icona'] ?? '' );
		$k     = isset( $sim[ $k ] ) ? $k : $ord[ $i % 6 ];
		$gar[] = array( 'titolo' => mo_text( $g['titolo'] ?? '' ), 'testo' => mo_text( $g['testo'] ?? '' ), 'simbolo' => $sim[ $k ][1], 'icona' => $k );
	}
	return MO_Tpl::render(
		'garanzie',
		array(
			'anchor'      => mo_anchor( $a['anchor'], 'garanzie' ),
			'sfondo'      => mo_sfondo_html( $a ),
			'etichetta'   => mo_text( $a['etichetta'] ),
			'titolo'      => mo_text( $a['titolo'] ),
			'sottotitolo' => mo_text( $a['sottotitolo'] ),
			'sigillo'     => mo_ring_text( mo_text( $a['sigillo'] ) ),
			'garanzie'    => $gar,
			'shield'      => mo_pixels( 'shield' ),
		)
	);
}

function mo_render_contatti( $atts ): string {
	$a   = mo_atts( 'contatti', $atts );
	$s   = mo_settings();
	$img = mo_image( $a['foto'], 'contatti', 'large' );
	if ( $img ) {
		$img['pos'] = implode( '% ', mo_focus( $a['foto_pos'] ) ) . '%';
	}
	return MO_Tpl::render(
		'contatti',
		array(
			'anchor'          => mo_anchor( $a['anchor'], 'contatti' ),
			'sfondo'          => mo_sfondo_html( $a ),
			'etichetta'       => mo_text( $a['etichetta'] ),
			'righe_titolo'    => mo_lines( $a['titolo'] ),
			'testo'           => mo_text( $a['testo'] ),
			'foto'            => $img,
			'bollino'         => mo_ring_text( mo_text( $a['bollino'] ) ),
			'opzioni'         => mo_list( $a['opzioni'] ),
			'titolo_pulsanti' => mo_text( $a['titolo_pulsanti'] ),
			'conferma'        => mo_text( $a['conferma'] ),
			'privacy_url'     => $s['privacy_url'],
			'endpoint'        => rest_url( 'moveon/v1/contatti' ),
			'ts'              => time(),
			'tel_href'        => mo_tel_href( $s['telefono'] ),
			'wa_href'         => mo_wa_href( $s['whatsapp'] ),
			'email_href'      => $s['email'] ? 'mailto:' . $s['email'] : '',
		)
	);
}

/** Registra gli shortcode [mo_hero], [mo_nastro], … */
add_action(
	'init',
	function () {
		foreach ( array_keys( mo_blocks() ) as $key ) {
			add_shortcode( 'mo_' . $key, 'mo_render_' . $key );
		}
	}
);

/* Il vecchio Portfolio («Sul tavolo» / «In ordine») è stato sostituito dal carosello (versione 1.2.0).
   Le pagine che lo contengono ancora non mostrano niente al suo posto (né codice): basta togliere la riga in WPBakery. */
add_action(
	'init',
	function () {
		add_shortcode( 'mo_portfolio', '__return_empty_string' );
	},
	20
);
