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
		mo_p_text( 'sfondo_posizione', 'Posizione dell’immagine', 'In percentuale orizzontale e verticale: «50% 50%» = centrata, «50% 0%» = in alto, «100% 50%» = a destra.', 'Sfondo', '50% 50%' ),
	);
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
	$img = absint( $a['sfondo_img'] ?? 0 ) ? mo_image( $a['sfondo_img'], '', '2048x2048' ) : null;
	if ( $img ) {
		$op  = max( 0, min( 100, (int) ( $a['sfondo_opacita'] ?? 30 ) ) ) / 100;
		$dim = in_array( $a['sfondo_dimensione'] ?? '', array( 'cover', 'contain', 'auto' ), true ) ? $a['sfondo_dimensione'] : 'cover';
		list( $x, $y ) = mo_focus( $a['sfondo_posizione'] ?? '50% 50%' );
		$out .= '<div class="mo-bg mo-bg--foto" aria-hidden="true" style="background-image:url(\'' . esc_url( $img['url'] ) . '\');background-size:' . $dim . ';background-position:' . $x . '% ' . $y . '%;opacity:' . $op . '"></div>';
	}
	return $out;
}

/** Definizioni degli elementi: nome, descrizione, campi. */
function mo_blocks(): array {
	$d     = mo_defaults();
	$stili = array( 'Navy' => 'navy', 'Blu' => 'blu', 'Blu chiaro' => 'bluchiaro', 'Riempita con foto' => 'foto' );
	$icone = array( 'Orologio (esperienza)' => 'orologio', 'Bussola (consulenza)' => 'bussola', 'Rete (contatti, partner)' => 'rete', 'Scatola (servizio completo)' => 'scatola', 'Lampadina (idee)' => 'lampadina', 'Stella (qualità)' => 'stella', 'Cuore (passione)' => 'cuore', 'Grafico (risultati)' => 'grafico' );
	$colori = array( 'Bianco' => 'bianco', 'Grigio chiaro' => 'grigio', 'Blu' => 'blu', 'Navy' => 'navy' );
	$illu  = array( 'Identità (rombo e cerchio)' => 'identita', 'Web (finestra con cursore)' => 'web', 'Social (telefono e cuori)' => 'social', 'App (sito che diventa app)' => 'app', 'Rete (pianeti in orbita)' => 'rete', 'Formazione (livelli)' => 'formazione' );
	$fuoco = 'Il punto della foto da tenere sempre visibile, in percentuale orizzontale e verticale. Es. «50% 50%» = centro, «30% 40%» = un po’ a sinistra e in alto.';

	return array(
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
			'name'   => 'MoveOn · Le nostre garanzie',
			'desc'   => 'Scudo in pixel che si compone, sigillo rotante, timbri sulle card.',
			'params' => array(
				mo_p_text( 'etichetta', 'Etichetta in alto', '', 'Testi', $d['garanzie']['etichetta'] ),
				mo_p_text( 'titolo', 'Titolo', '', 'Testi', $d['garanzie']['titolo'] ),
				mo_p_area( 'sottotitolo', 'Sottotitolo', '', 'Testi', $d['garanzie']['sottotitolo'] ),
				mo_p_text( 'sigillo', 'Scritta del sigillo', 'Gira intorno allo scudo, ripetuta 2 volte. Separa le parti con una virgola.', 'Testi', $d['garanzie']['sigillo'] ),
				mo_p_group( 'garanzie', 'Garanzie', array( mo_p_text( 'titolo', 'Titolo', '', '' ), mo_p_area( 'testo', 'Testo', '', '' ) ), $d['garanzie']['garanzie'], 'Da 3 a 6. Solo impegni che puoi mantenere: sostituisci i «[N]» con i numeri reali.' ),
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
	foreach ( mo_group( $a['garanzie'] ) as $g ) {
		$gar[] = array( 'titolo' => mo_text( $g['titolo'] ?? '' ), 'testo' => mo_text( $g['testo'] ?? '' ) );
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
