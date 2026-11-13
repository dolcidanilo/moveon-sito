<?php
/**
 * Elementi per comporre le pagine (Chi sono, Servizi, Contatti…) e la versione breve di «Chi sono» per la home.
 * Si aggiungono agli elementi della home in mo_blocks(). Ognuno ha il suo modello HTML in templates/ e la scheda Sfondo.
 */

defined( 'ABSPATH' ) || exit;

/** Definizioni dei nuovi elementi (stesso formato di mo_blocks()). */
function mo_sezioni_def( array $d ): array {
	$aree = array( 'Tutte le aree' => 'tutte' );
	foreach ( mo_aree() as $k => $nome ) {
		$aree[ $nome ] = $k;
	}
	$trattino = 'Scrivi - (un trattino) per non mostrarlo.';
	return array(
		'chi_breve'    => array(
			'name'   => 'MoveOn · Chi sono (breve, per la home)',
			'desc'   => 'Il numero grande, una frase e tre punti di forza, con il pulsante verso la pagina Chi sono.',
			'params' => array(
				mo_p_text( 'etichetta', 'Etichetta in alto', '', 'Testi', $d['chi_breve']['etichetta'] ),
				mo_p_text( 'numero', 'Numero grande', 'Es. «25».', 'Testi', $d['chi_breve']['numero'] ),
				mo_p_text( 'frase_numero', 'Frase sotto il numero', 'Numero e frase insieme sono alti quanto i testi a destra (su computer).', 'Testi', $d['chi_breve']['frase_numero'] ),
				mo_p_drop( 'animazione', 'Animazione del numero', array( 'Colori che scorrono e bagliore' => 'tutto', 'Solo colori che scorrono' => 'colori', 'Solo bagliore' => 'bagliore', 'Nessuna' => 'nessuna' ), 'tutto', 'Un movimento leggero e continuo dentro il numero. Si ferma da solo per chi ha scelto «riduci movimento».', 'Testi' ),
				mo_p_area( 'titolo', 'Frase principale', 'Una o due frasi, in parole semplici.', 'Testi', $d['chi_breve']['titolo'] ),
				mo_p_area( 'punti', 'Tre punti di forza', 'Uno per riga, brevi.', 'Testi', $d['chi_breve']['punti'] ),
				mo_p_text( 'pulsante', 'Pulsante: testo', $trattino, 'Testi', $d['chi_breve']['pulsante'] ),
				mo_p_text( 'link', 'Pulsante: porta a', 'Es. /chi-sono/ (pagina del sito) oppure #contatti.', 'Testi', $d['chi_breve']['link'] ),
				mo_p_anchor( $d['chi_breve']['anchor'] ),
				...mo_p_sfondo(),
			),
		),
		'intestazione' => array(
			'name'   => 'MoveOn · Intestazione di pagina',
			'desc'   => 'La parte alta di una pagina: etichetta, titolo grande, testo e pulsante. Con la scheda Sfondo puoi metterci una foto.',
			'params' => array(
				mo_p_text( 'etichetta', 'Etichetta in alto', $trattino, 'Testi', $d['intestazione']['etichetta'] ),
				mo_p_area( 'titolo', 'Titolo della pagina', 'È il titolo principale (per Google conta molto): dì cosa offri e dove, es. «Siti web per la tua attività, a Pescara».', 'Testi', $d['intestazione']['titolo'] ),
				mo_p_area( 'testo', 'Testo', $trattino, 'Testi', $d['intestazione']['testo'] ),
				mo_p_text( 'pulsante', 'Pulsante: testo', $trattino, 'Testi', $d['intestazione']['pulsante'] ),
				mo_p_text( 'link', 'Pulsante: porta a', 'Es. /contatti/ oppure #contatti.', 'Testi', $d['intestazione']['link'] ),
				mo_p_drop( 'sfumatura', 'Sfumatura in basso', array( 'Nessuna' => '0', '120 px' => '120', '200 px' => '200', '300 px' => '300' ), $d['intestazione']['sfumatura'], 'La foto di sfondo prosegue sotto la sezione successiva, svanendo.', 'Sfondo' ),
				mo_p_anchor( $d['intestazione']['anchor'] ),
				...mo_p_sfondo(),
			),
		),
		'numeri'       => array(
			'name'   => 'MoveOn · Numeri',
			'desc'   => 'Numeri grandi con una breve spiegazione (anni, progetti…).',
			'params' => array(
				mo_p_text( 'etichetta', 'Etichetta in alto', $trattino, 'Testi', $d['numeri']['etichetta'] ),
				mo_p_group( 'numeri', 'Numeri', array( mo_p_text( 'numero', 'Numero', 'Es. «25+».', '' ), mo_p_text( 'testo', 'Spiegazione', '', '' ) ), $d['numeri']['numeri'], 'Da 2 a 4.' ),
				mo_p_anchor( $d['numeri']['anchor'] ),
				...mo_p_sfondo(),
			),
		),
		'punti'        => array(
			'name'   => 'MoveOn · Punti di forza',
			'desc'   => 'Card brevi con titolo, testo e, se vuoi, una foto.',
			'params' => array(
				mo_p_text( 'etichetta', 'Etichetta in alto', $trattino, 'Testi', $d['punti']['etichetta'] ),
				mo_p_area( 'titolo', 'Titolo', $trattino, 'Testi', $d['punti']['titolo'] ),
				mo_p_group(
					'punti',
					'Card',
					array(
						mo_p_text( 'titolo', 'Titolo', '', '' ),
						mo_p_area( 'testo', 'Testo', 'Una o due frasi.', '' ),
						mo_p_img( 'immagine', 'Foto (facoltativa)', 'JPG o PNG, orizzontale.', '' ),
					),
					$d['punti']['punti'],
					'Trascinale per cambiare l’ordine.'
				),
				mo_p_anchor( $d['punti']['anchor'] ),
				...mo_p_sfondo(),
			),
		),
		'passi'        => array(
			'name'   => 'MoveOn · Come lavoro (passi)',
			'desc'   => 'I passi del lavoro, numerati.',
			'params' => array(
				mo_p_text( 'etichetta', 'Etichetta in alto', $trattino, 'Testi', $d['passi']['etichetta'] ),
				mo_p_area( 'titolo', 'Titolo', $trattino, 'Testi', $d['passi']['titolo'] ),
				mo_p_group( 'passi', 'Passi', array( mo_p_text( 'titolo', 'Titolo', '', '' ), mo_p_area( 'testo', 'Testo', '', '' ) ), $d['passi']['passi'], 'Di solito 3 o 4.' ),
				mo_p_anchor( $d['passi']['anchor'] ),
				...mo_p_sfondo(),
			),
		),
		'elenco'       => array(
			'name'   => 'MoveOn · Cosa realizzo (elenco)',
			'desc'   => 'Tutto quello che puoi realizzare, come etichette, anche divise in gruppi.',
			'params' => array(
				mo_p_text( 'etichetta', 'Etichetta in alto', $trattino, 'Testi', $d['elenco']['etichetta'] ),
				mo_p_area( 'titolo', 'Titolo', $trattino, 'Testi', $d['elenco']['titolo'] ),
				mo_p_group( 'gruppi', 'Gruppi', array( mo_p_text( 'titolo', 'Titolo del gruppo', 'Es. «Grafica». ' . $trattino, '' ), mo_p_area( 'voci', 'Voci', 'Una per riga.', '' ) ), $d['elenco']['gruppi'], 'Con un solo gruppo puoi togliere il titolo del gruppo.' ),
				mo_p_anchor( $d['elenco']['anchor'] ),
				...mo_p_sfondo(),
			),
		),
		'situazioni'   => array(
			'name'   => 'MoveOn · Non sai da dove partire?',
			'desc'   => 'Situazioni scritte come le direbbe il cliente, con i lavori consigliati e il pulsante «Chiedimi un consiglio» (scrive già il messaggio nel modulo contatti).',
			'params' => array(
				mo_p_text( 'etichetta', 'Etichetta in alto', $trattino, 'Testi', $d['situazioni']['etichetta'] ),
				mo_p_area( 'titolo', 'Titolo', $trattino, 'Testi', $d['situazioni']['titolo'] ),
				mo_p_group( 'situazioni', 'Situazioni', array( mo_p_text( 'situazione', 'Situazione', 'Come la direbbe il cliente, es. «Apro una nuova attività».', '' ), mo_p_area( 'consigli', 'Cosa consigli', 'Uno per riga.', '' ) ), $d['situazioni']['situazioni'], 'Da 3 a 6.' ),
				mo_p_text( 'pulsante', 'Pulsante: testo', $trattino, 'Testi', $d['situazioni']['pulsante'] ),
				mo_p_text( 'link', 'Pulsante: porta a', 'Il modulo contatti: #contatti (nella stessa pagina) oppure /contatti/.', 'Testi', $d['situazioni']['link'] ),
				mo_p_anchor( $d['situazioni']['anchor'] ),
				...mo_p_sfondo(),
			),
		),
		'faq'          => array(
			'name'   => 'MoveOn · Domande frequenti',
			'desc'   => 'Domande che si aprono con un clic.',
			'params' => array(
				mo_p_text( 'etichetta', 'Etichetta in alto', $trattino, 'Testi', $d['faq']['etichetta'] ),
				mo_p_area( 'titolo', 'Titolo', $trattino, 'Testi', $d['faq']['titolo'] ),
				mo_p_group( 'domande', 'Domande', array( mo_p_text( 'domanda', 'Domanda', '', '' ), mo_p_area( 'risposta', 'Risposta', '', '' ) ), $d['faq']['domande'], 'Trascinale per cambiare l’ordine.' ),
				mo_p_anchor( $d['faq']['anchor'] ),
				...mo_p_sfondo(),
			),
		),
		'recensioni'   => array(
			'name'   => 'MoveOn · Recensioni',
			'desc'   => 'Le parole dei clienti. Quelle di serie sono segnaposto da sostituire prima della messa online.',
			'params' => array(
				mo_p_text( 'etichetta', 'Etichetta in alto', $trattino, 'Testi', $d['recensioni']['etichetta'] ),
				mo_p_area( 'titolo', 'Titolo', $trattino, 'Testi', $d['recensioni']['titolo'] ),
				mo_p_group( 'recensioni', 'Recensioni', array( mo_p_area( 'testo', 'Recensione', 'Le parole del cliente, con il suo permesso.', '' ), mo_p_text( 'nome', 'Nome', '', '' ), mo_p_text( 'attivita', 'Attività e città', '', '' ) ), $d['recensioni']['recensioni'], 'Usa solo recensioni vere, con il permesso del cliente.' ),
				mo_p_anchor( $d['recensioni']['anchor'] ),
				...mo_p_sfondo(),
			),
		),
		'lavori'       => array(
			'name'   => 'MoveOn · Progetti scelti',
			'desc'   => 'Alcuni progetti del portfolio, anche di una sola area, con il link alla pagina Progetti.',
			'params' => array(
				mo_p_text( 'etichetta', 'Etichetta in alto', $trattino, 'Testi', $d['lavori']['etichetta'] ),
				mo_p_area( 'titolo', 'Titolo', $trattino, 'Testi', $d['lavori']['titolo'] ),
				mo_p_drop( 'area', 'Quali progetti', $aree, $d['lavori']['area'], 'I primi nell’ordine di «Progetti portfolio».' ),
				mo_p_drop( 'quanti', 'Quanti', array( '3' => '3', '6' => '6' ), $d['lavori']['quanti'] ),
				mo_p_text( 'pulsante', 'Pulsante verso la pagina Progetti', $trattino, 'Testi', $d['lavori']['pulsante'] ),
				mo_p_anchor( $d['lavori']['anchor'] ),
				...mo_p_sfondo(),
			),
		),
		'invito'       => array(
			'name'   => 'MoveOn · Invito finale',
			'desc'   => 'La fascia finale che invita a contattarti.',
			'params' => array(
				mo_p_area( 'titolo', 'Titolo', '', 'Testi', $d['invito']['titolo'] ),
				mo_p_area( 'testo', 'Testo', $trattino, 'Testi', $d['invito']['testo'] ),
				mo_p_text( 'pulsante', 'Pulsante: testo', '', 'Testi', $d['invito']['pulsante'] ),
				mo_p_text( 'link', 'Pulsante: porta a', 'Es. /contatti/ oppure #contatti.', 'Testi', $d['invito']['link'] ),
				mo_p_anchor( $d['invito']['anchor'] ),
				...mo_p_sfondo(),
			),
		),
	);
}

/** Testo facoltativo: il trattino lo nasconde. */
function mo_facoltativo( $v ): string {
	$t = mo_text( $v );
	return '-' === $t ? '' : $t;
}

/** Intestazione comune delle sezioni (etichetta, titolo). */
function mo_testa_sezione( array $a, string $anchor ): array {
	return array(
		'anchor'    => $anchor,
		'sfondo'    => mo_sfondo_html( $a ),
		'etichetta' => mo_facoltativo( $a['etichetta'] ?? '' ),
		'titolo'    => mo_facoltativo( $a['titolo'] ?? '' ),
	);
}

function mo_render_chi_breve( $atts ): string {
	$a   = mo_atts( 'chi_breve', $atts );
	$btn = mo_facoltativo( $a['pulsante'] );
	return MO_Tpl::render(
		'chi-breve',
		array_merge(
			mo_testa_sezione( $a, mo_anchor( $a['anchor'], 'chi-siamo' ) ),
			array(
				'numero'       => mo_text( $a['numero'] ),
				'frase_numero' => mo_text( $a['frase_numero'] ),
				'animazione'   => in_array( $a['animazione'], array( 'tutto', 'colori', 'bagliore', 'nessuna' ), true ) ? $a['animazione'] : 'tutto',
				'punti'        => mo_lines( $a['punti'] ),
				'pulsante'     => '' !== $btn ? array( 'testo' => $btn, 'href' => mo_href( $a['link'] ) ) : null,
			)
		)
	);
}

function mo_render_intestazione( $atts ): string {
	$a   = mo_atts( 'intestazione', $atts );
	$btn = mo_facoltativo( $a['pulsante'] );
	$sf  = (int) mo_text( $a['sfumatura'] );
	return MO_Tpl::render(
		'intestazione',
		array_merge(
			mo_testa_sezione( $a, mo_anchor( $a['anchor'], 'inizio' ) ),
			array(
				'righe'     => mo_lines( $a['titolo'] ),
				'testo'     => mo_facoltativo( $a['testo'] ),
				'pulsante'  => '' !== $btn ? array( 'testo' => $btn, 'href' => mo_href( $a['link'] ) ) : null,
				'sfumatura' => in_array( $sf, array( 120, 200, 300 ), true ) ? '--mo-sfumatura:' . $sf . 'px' : '',
			)
		)
	);
}

function mo_render_numeri( $atts ): string {
	$a     = mo_atts( 'numeri', $atts );
	$righe = array();
	foreach ( mo_group( $a['numeri'] ) as $n ) {
		if ( '' !== mo_text( $n['numero'] ?? '' ) ) {
			$righe[] = array( 'numero' => mo_text( $n['numero'] ), 'testo' => mo_text( $n['testo'] ?? '' ) );
		}
	}
	return MO_Tpl::render( 'numeri', array_merge( mo_testa_sezione( $a, mo_anchor( $a['anchor'], 'numeri' ) ), array( 'numeri' => $righe, 'quanti' => max( 1, count( $righe ) ) ) ) );
}

function mo_render_punti( $atts ): string {
	$a     = mo_atts( 'punti', $atts );
	$punti = array();
	foreach ( mo_group( $a['punti'] ) as $p ) {
		$img     = absint( $p['immagine'] ?? 0 ) ? mo_image( $p['immagine'], '', 'large' ) : null;
		$punti[] = array( 'titolo' => mo_text( $p['titolo'] ?? '' ), 'testo' => mo_text( $p['testo'] ?? '' ), 'immagine' => $img );
	}
	return MO_Tpl::render( 'punti', array_merge( mo_testa_sezione( $a, mo_anchor( $a['anchor'], 'punti-di-forza' ) ), array( 'punti' => $punti ) ) );
}

function mo_render_passi( $atts ): string {
	$a     = mo_atts( 'passi', $atts );
	$passi = array();
	foreach ( mo_group( $a['passi'] ) as $i => $p ) {
		$passi[] = array( 'num' => sprintf( '%02d', $i + 1 ), 'titolo' => mo_text( $p['titolo'] ?? '' ), 'testo' => mo_text( $p['testo'] ?? '' ) );
	}
	return MO_Tpl::render( 'passi', array_merge( mo_testa_sezione( $a, mo_anchor( $a['anchor'], 'come-lavoro' ) ), array( 'passi' => $passi, 'quanti' => max( 1, count( $passi ) ) ) ) );
}

function mo_render_elenco( $atts ): string {
	$a      = mo_atts( 'elenco', $atts );
	$gruppi = array();
	foreach ( mo_group( $a['gruppi'] ) as $g ) {
		$voci = mo_lines( $g['voci'] ?? '' );
		if ( $voci ) {
			$gruppi[] = array( 'titolo' => mo_facoltativo( $g['titolo'] ?? '' ), 'voci' => $voci );
		}
	}
	return MO_Tpl::render( 'elenco', array_merge( mo_testa_sezione( $a, mo_anchor( $a['anchor'], 'cosa-realizzo' ) ), array( 'gruppi' => $gruppi ) ) );
}

function mo_render_situazioni( $atts ): string {
	$a   = mo_atts( 'situazioni', $atts );
	$btn = mo_facoltativo( $a['pulsante'] );
	$sit = array();
	foreach ( mo_group( $a['situazioni'] ) as $s ) {
		$nome = mo_text( $s['situazione'] ?? '' );
		if ( '' === $nome ) {
			continue;
		}
		$sit[] = array(
			'situazione' => $nome,
			'consigli'   => mo_lines( $s['consigli'] ?? '' ),
			'messaggio'  => 'Ciao, la mia situazione è: «' . $nome . '». Da dove mi consigli di partire?',
		);
	}
	return MO_Tpl::render(
		'situazioni',
		array_merge(
			mo_testa_sezione( $a, mo_anchor( $a['anchor'], 'da-dove-partire' ) ),
			array(
				'situazioni' => $sit,
				'pulsante'   => $btn,
				'href'       => mo_href( $a['link'] ),
				'home'       => home_url( '/' ),
			)
		)
	);
}

function mo_render_faq( $atts ): string {
	$a    = mo_atts( 'faq', $atts );
	$dom  = array();
	foreach ( mo_group( $a['domande'] ) as $q ) {
		if ( '' !== mo_text( $q['domanda'] ?? '' ) ) {
			$dom[] = array( 'domanda' => mo_text( $q['domanda'] ), 'risposta' => mo_text( $q['risposta'] ?? '' ) );
		}
	}
	return MO_Tpl::render( 'faq', array_merge( mo_testa_sezione( $a, mo_anchor( $a['anchor'], 'domande' ) ), array( 'domande' => $dom ) ) );
}

function mo_render_recensioni( $atts ): string {
	$a   = mo_atts( 'recensioni', $atts );
	$rec = array();
	foreach ( mo_group( $a['recensioni'] ) as $r ) {
		if ( '' !== mo_text( $r['testo'] ?? '' ) ) {
			$rec[] = array( 'testo' => mo_text( $r['testo'] ), 'nome' => mo_text( $r['nome'] ?? '' ), 'attivita' => mo_text( $r['attivita'] ?? '' ) );
		}
	}
	return MO_Tpl::render( 'recensioni', array_merge( mo_testa_sezione( $a, mo_anchor( $a['anchor'], 'recensioni' ) ), array( 'recensioni' => $rec ) ) );
}

function mo_render_lavori( $atts ): string {
	$a      = mo_atts( 'lavori', $atts );
	$area   = mo_text( $a['area'] );
	$quanti = '6' === mo_text( $a['quanti'] ) ? 6 : 3;
	$lista  = array();
	foreach ( mo_progetti_in_evidenza() as $p ) {
		if ( 'tutte' !== $area && $p['area'] !== $area ) {
			continue;
		}
		$lista[] = array( 'url' => $p['url'], 'nome' => $p['nome'], 'tipo' => $p['tipo'], 'area_nome' => $p['area_nome'], 'immagine' => $p['copertina'] ?: $p['carosello'] );
		if ( count( $lista ) >= $quanti ) {
			break;
		}
	}
	if ( ! $lista ) {
		return ''; // nessun progetto di quest'area: la sezione non compare
	}
	$btn = mo_facoltativo( $a['pulsante'] );
	return MO_Tpl::render(
		'lavori',
		array_merge(
			mo_testa_sezione( $a, mo_anchor( $a['anchor'], 'lavori' ) ),
			array(
				'progetti' => $lista,
				'pulsante' => '' !== $btn ? array( 'testo' => $btn, 'href' => mo_progetti_url() ) : null,
			)
		)
	);
}

function mo_render_invito( $atts ): string {
	$a = mo_atts( 'invito', $atts );
	return MO_Tpl::render(
		'invito',
		array(
			'anchor'   => mo_anchor( $a['anchor'], 'parliamone' ),
			'sfondo'   => mo_sfondo_html( $a ),
			'righe'    => mo_lines( $a['titolo'] ),
			'testo'    => mo_facoltativo( $a['testo'] ),
			'pulsante' => array( 'testo' => mo_text( $a['pulsante'] ), 'href' => mo_href( $a['link'] ) ),
		)
	);
}
