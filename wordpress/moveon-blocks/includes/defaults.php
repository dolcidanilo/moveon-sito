<?php
/**
 * Contenuti iniziali: i testi del prototipo approvato.
 * Sono i valori con cui ogni elemento compare quando lo inserisci in WPBakery:
 * poi li cambi dai campi dell'elemento.
 */

defined( 'ABSPATH' ) || exit;

function mo_defaults(): array {
	static $d = null;
	if ( null !== $d ) {
		return $d;
	}
	$d = array(
		'settings'  => array(
			'logo_chiaro_id'  => 0,
			'logo_scuro_id'   => 0,
			'telefono'        => '+39 347 461 6434',
			'whatsapp'        => '+39 347 461 6434',
			'email'           => 'info@moveonstudio.it',
			'header_cta'      => 'Richiedi Preventivo',
			'cta_link'        => '#contatti',
			'mobile_cta'      => 'Contattaci Ora',
			'claim'           => 'Diamo forma alle tue idee, pixel dopo pixel.',
			'legali'          => 'MoveOn Studio. Tutti i diritti riservati. P. IVA 02117290680',
			'privacy_url'     => 'https://www.iubenda.com/privacy-policy/78862801',
			'cookie_url'      => 'https://www.iubenda.com/privacy-policy/78862801/cookie-policy',
			'carica_tema'     => 0,
			'salva_richieste' => 1,
			'tema_scuro'      => 1,
			'progetti_titolo' => 'Progetti',
			'progetti_testo'  => 'Identità visive, siti, social e stampa: una selezione dei lavori che abbiamo realizzato. Apri un progetto per vedere com’è nato.',
		),
		'hero'      => array(
			'anchor'          => 'top',
			'titolo'          => "Creatività,\nstrategia\ne risultati.",
			'parola'          => 'risultati.',
			'testo'           => 'Diamo forma alle tue idee, pixel dopo pixel: branding, web, social e stampa con un unico partner, da oltre 25 anni.',
			'pulsante_testo'  => 'Scopri i Servizi',
			'pulsante_link'   => '#servizi',
			'stile'           => 'slide',
			// Immagini di prova: da sostituire con le foto di ogni settore
			'slide'           => array(
				array( 'settore' => 'Grafica', 'posizione' => '50% 45%' ),
				array( 'settore' => 'Social', 'posizione' => '60% 35%' ),
				array( 'settore' => 'Web', 'posizione' => '50% 40%' ),
			),
			'durata'          => '6',
			'transizione'     => 'pixel',
			'scurimento'      => '45',
		),
		'nastro'    => array(
			'anchor'   => 'parole',
			'riga1'    => array(
				array( 'testo' => 'Creatività', 'stile' => 'foto' ),
				array( 'testo' => 'Strategia', 'stile' => 'blu' ),
				array( 'testo' => 'Risultati', 'stile' => 'navy' ),
				array( 'testo' => 'Su misura', 'stile' => 'bluchiaro' ),
			),
			'riga2'    => array(
				array( 'testo' => 'A 360°', 'stile' => 'bluchiaro' ),
				array( 'testo' => 'Esperienza', 'stile' => 'foto' ),
				array( 'testo' => 'Consulenza', 'stile' => 'blu' ),
				array( 'testo' => 'Dall’idea al prodotto finito', 'stile' => 'navy' ),
			),
			'foto_pos' => '30% 45%',
		),
		'chi_siamo' => array(
			'anchor'        => 'chi-siamo',
			'etichetta'     => 'Chi siamo',
			'numero'        => '25',
			'foto_pos'      => '30% 45%',
			'frase_numero'  => 'anni di creatività e innovazione',
			'manifesto'     => 'Nel mondo della comunicazione visiva, l’esperienza fa la differenza. Da 25 anni, MoveOn è il partner di riferimento per aziende e professionisti che desiderano distinguersi con un’immagine forte, coerente ed efficace. La nostra forza risiede nella completezza dell’offerta, nella competenza acquisita e nella rete di contatti che mettiamo a disposizione dei nostri clienti per trasformare ogni idea in un progetto concreto e di successo.',
			'idea_titolo'   => 'Dall’idea al prodotto finito',
			'idea_testo'    => 'Ci occupiamo di tutto: dall’ideazione alla progettazione, fino alla realizzazione finale. Non dovrai preoccuparti di coordinare più fornitori o gestire complessità tecniche: pensiamo a tutto noi, lasciandoti libero di concentrarti sul tuo business.',
			'passo_da'      => 'Idea',
			'passo_a'       => 'Prodotto finito',
			'motivi_titolo' => 'Tanti buoni motivi per sceglierci',
			'motivi'        => array(
				array(
					'titolo' => '25 Anni di Esperienza',
					'testo'  => 'Due decenni e mezzo di attività ci hanno permesso di affinare competenze, tecniche e strategie per offrire sempre soluzioni innovative, funzionali e di grande impatto.',
					'icona'  => 'orologio',
				),
				array(
					'titolo' => 'Know-how e Consulenza Strategica',
					'testo'  => 'Grazie alla nostra profonda conoscenza del settore, siamo in grado di offrirti una consulenza mirata per aiutarti a prendere le migliori decisioni per la tua comunicazione. Dall’analisi del brand alla scelta degli strumenti più efficaci, ti guidiamo passo dopo passo per ottenere il massimo risultato.',
					'icona'  => 'bussola',
				),
				array(
					'titolo' => 'Una rete di contatti per ogni esigenza',
					'testo'  => 'Negli anni abbiamo costruito un network di collaboratori qualificati in diversi ambiti: stampa, fotografia, copywriting, marketing e sviluppo tecnologico. Questo ci permette di offrirti soluzioni complete e su misura, riducendo i tempi di realizzazione e garantendo la massima qualità in ogni fase del progetto.',
					'icona'  => 'rete',
				),
				array(
					'titolo'    => 'Un servizio completo, dalla creatività alla realizzazione',
					'testo'     => 'Siamo il tuo unico punto di riferimento per tutto ciò che riguarda la comunicazione visiva e digitale.',
					'icona'     => 'scatola',
					'etichette' => "Editoria e Grafica\nLogo e Brand Identity\nCampagne Pubblicitarie\nSiti Web ed E-commerce\nGestione Social Media\nApp Webview\nCorsi di Formazione",
				),
			),
			'chiusura'      => 'Se cerchi un partner affidabile, esperto e sempre aggiornato, capace di trasformare la tua visione in una comunicazione efficace e vincente, MoveOn è la scelta giusta.',
			'link_testo'    => 'Contattaci oggi stesso',
			'link_resto'    => 'e scopri come possiamo far crescere la tua attività!',
			'link_href'     => '#contatti',
		),
		'pausa'     => array(
			'anchor'       => 'pausa',
			'punto_focale' => '50% 32%',
			'frase'        => "Le idee che emozionano\nsi ricordano.",
		),
		'servizi'   => array(
			'anchor'         => 'servizi',
			'etichetta'      => 'Servizi',
			'apertura'       => 'Dall’idea al prodotto finito, sei competenze in un unico studio.',
			'servizi'        => array(
				array( 'nome' => 'Grafica & Identità Visiva', 'beneficio' => 'Un’immagine riconoscibile e coerente, ovunque i tuoi clienti ti incontrino.', 'voci' => "Logo e branding\nImmagine coordinata\nBrochure e cataloghi\nPackaging ed etichette\nRoll-up e manifesti\nSegnaletica e menù", 'parola_sfondo' => 'Brand', 'colore' => 'bianco', 'illustrazione' => 'identita' ),
				array( 'nome' => 'Siti Web & E-commerce', 'beneficio' => 'Siti veloci e chiari, pensati per trasformare le visite in contatti e vendite.', 'voci' => "Siti istituzionali\nE-commerce\nLanding page\nBlog e magazine\nGestione e aggiornamento\nNewsletter", 'parola_sfondo' => 'Web', 'colore' => 'blu', 'illustrazione' => 'web' ),
				array( 'nome' => 'Digital Marketing & Social', 'beneficio' => 'Pagine curate e campagne misurabili, con report che capisci al volo.', 'voci' => "Facebook e Instagram\nPiani editoriali\nPost grafici e video\nMeta e Google Ads\nReport\nGestione recensioni", 'parola_sfondo' => 'Social', 'colore' => 'grigio', 'illustrazione' => 'social' ),
				array( 'nome' => 'App WebView', 'beneficio' => 'Il tuo sito o e-commerce diventa un’app Android e iOS, pronta per gli store.', 'voci' => "Android\niOS\nPubblicazione sugli store", 'parola_sfondo' => 'App', 'colore' => 'navy', 'illustrazione' => 'app' ),
				array( 'nome' => 'Servizi a 360°', 'beneficio' => 'Una rete di fornitori selezionati: qualità alta, prezzi competitivi e un solo interlocutore.', 'voci' => "Stampa digitale e offset\nImpianti e affissioni\nAllestimenti fiere\nDistribuzione\nMateriali speciali\nSMS e DEM", 'parola_sfondo' => '360°', 'colore' => 'blu', 'illustrazione' => 'rete' ),
				array( 'nome' => 'Formazione', 'beneficio' => 'Corsi individuali per diventare autonomo con gli strumenti dei professionisti.', 'voci' => "Photoshop\nIllustrator\nInDesign\nWordPress", 'parola_sfondo' => 'Corsi', 'colore' => 'bianco', 'illustrazione' => 'formazione' ),
			),
			'finale_frase'   => 'Hai un’idea? Le diamo forma noi.',
			'pulsante_testo' => 'Contattaci Ora',
			'pulsante_link'  => '#contatti',
		),
		'carosello' => array(
			'anchor'    => 'portfolio', // la voce «Portfolio» del menu porta qui
			'etichetta' => 'Progetti',
			'titolo'    => 'Lavori che lasciano il segno.',
			'testo'     => 'Trascina per sfogliarli, oppure usa le frecce. Apri un progetto per vedere com’è nato.',
			'filtri'    => 'si',
			'pulsante'  => 'Tutti i progetti',
		),
		'garanzie'  => array(
			'anchor'      => 'garanzie',
			'etichetta'   => 'Le nostre garanzie',
			'titolo'      => 'Meglio andare sul sicuro, non credi?',
			'sottotitolo' => 'Impegni concreti che mettiamo per iscritto, perché la fiducia si costruisce con i fatti.',
			'garanzie'    => array(
				array( 'titolo' => 'Preventivo chiaro e dettagliato', 'testo' => 'Sai subito cosa comprende ogni voce e quanto costa. Nessuna sorpresa a fine lavoro.' ),
				array( 'titolo' => 'Tempi scritti nero su bianco', 'testo' => 'Le date di consegna sono nel preventivo e ti aggiorniamo a ogni fase del progetto.' ),
				array( 'titolo' => 'Revisioni incluse', 'testo' => '[N] giri di modifiche compresi nel prezzo, per arrivare al risultato che hai in mente.' ),
				array( 'titolo' => 'I file sono tuoi', 'testo' => 'Alla consegna ricevi i file originali e la piena proprietà del lavoro realizzato.' ),
				array( 'titolo' => 'Un unico referente', 'testo' => 'Una persona segue il tuo progetto dall’inizio alla fine: sai sempre a chi chiedere.' ),
				array( 'titolo' => 'Assistenza dopo la consegna', 'testo' => '[N] mesi di supporto per piccoli aggiustamenti, dubbi e aggiornamenti.' ),
			),
			'sigillo'     => 'Garanzia MoveOn Studio, scelta sicura',
		),
		'contatti'  => array(
			'anchor'          => 'contatti',
			'etichetta'       => 'Contatti',
			'titolo'          => "Parliamo del\ntuo progetto.",
			'testo'           => 'Raccontaci la tua idea: ti diciamo come darle forma, con tempi e costi chiari.',
			'foto_pos'        => '50% 50%',
			'bollino'         => 'Raccontaci la tua idea',
			'opzioni'         => "Grafica e identità visiva\nSito web o e-commerce\nSocial e digital marketing\nApp WebView\nStampa e servizi a 360°\nFormazione\nNon lo so ancora, consigliatemi",
			'titolo_pulsanti' => 'Preferisci parlarci subito?',
			'conferma'        => 'Ti ricontattiamo al più presto.',
		),
		'progetti'  => array(
			array( 'slug' => 'forno-aurora', 'nome' => 'Forno Aurora', 'area' => 'branding', 'tipo' => 'Logo e packaging', 'richiesta' => 'Un forno artigianale che voleva farsi riconoscere anche fuori dal quartiere.', 'lavoro' => 'Logo, palette colori, sacchetti e scatole per i dolci, insegna del punto vendita.' ),
			array( 'slug' => 'studio-legale-ferri', 'nome' => 'Studio Legale Ferri', 'area' => 'web', 'tipo' => 'Sito istituzionale', 'richiesta' => 'Uno studio professionale che cercava un sito chiaro e autorevole.', 'lavoro' => 'Struttura dei contenuti, design delle pagine, sito WordPress e schede dei servizi.' ),
			array( 'slug' => 'cantina-valtenna', 'nome' => 'Cantina Valtenna', 'area' => 'stampa', 'tipo' => 'Etichette e packaging', 'richiesta' => 'Una cantina pronta a lanciare la sua nuova linea di vini.', 'lavoro' => 'Sistema di etichette, cartoni da sei bottiglie e materiali per le fiere di settore.' ),
			array( 'slug' => 'fitlab', 'nome' => 'FitLab', 'area' => 'social', 'tipo' => 'Campagna Meta Ads', 'richiesta' => 'Una palestra che voleva riempire i corsi del nuovo anno.', 'lavoro' => 'Piano editoriale, grafiche e video per Instagram, campagne Meta Ads con report mensile.' ),
			array( 'slug' => 'ottica-bellavista', 'nome' => 'Ottica Bellavista', 'area' => 'web', 'tipo' => 'E-commerce', 'richiesta' => 'Un negozio di ottica che voleva vendere anche online.', 'lavoro' => 'E-commerce con catalogo montature, pagamenti, spedizioni e newsletter ai clienti.' ),
			array( 'slug' => 'festival-jazz', 'nome' => 'Festival Jazz', 'area' => 'stampa', 'tipo' => 'Manifesti e roll-up', 'richiesta' => 'Un festival estivo da far conoscere in tutta la regione.', 'lavoro' => 'Identità dell’evento, manifesti, roll-up, affissioni e grafiche per i social.' ),
			array( 'slug' => 'dolcemente', 'nome' => 'Dolcemente', 'area' => 'social', 'tipo' => 'Piano editoriale', 'richiesta' => 'Una pasticceria che voleva più clienti nel fine settimana.', 'lavoro' => 'Shooting dei prodotti, calendario dei post, storie settimanali e gestione delle recensioni.' ),
			array( 'slug' => 'hotel-belvedere', 'nome' => 'Hotel Belvedere', 'area' => 'branding', 'tipo' => 'Immagine coordinata', 'richiesta' => 'Un hotel storico che voleva un’immagine più moderna senza perdere eleganza.', 'lavoro' => 'Restyling del logo, biglietti da visita, carta intestata, segnaletica interna e menù.' ),
		),
	);
	return $d;
}

/** Immagini incluse nel plugin, usate finché non ne scegli una dalla Libreria media. */
function mo_default_images(): array {
	return array(
		'logo_chiaro' => array( 'file' => 'logo-chiaro.png', 'alt' => 'MoveOn Studio', 'w' => 216, 'h' => 49 ),
		'logo_scuro'  => array( 'file' => 'logo-scuro.png', 'alt' => 'MoveOn Studio', 'w' => 216, 'h' => 49 ),
		'idea'        => array( 'file' => 'idea-arcobaleno.jpg', 'alt' => 'Profilo di una ragazza con i capelli color arcobaleno mossi dal vento', 'w' => 784, 'h' => 452 ),
		'pausa'       => array( 'file' => 'pausa-cuffie.jpg', 'alt' => 'Ritratto di una ragazza con le cuffie, illuminata da luci rosse e azzurre', 'w' => 1920, 'h' => 954 ),
		'contatti'    => array( 'file' => 'contatti-lettore.jpg', 'alt' => 'Un personaggio viola e peloso legge un libro seduto su una poltrona azzurra', 'w' => 784, 'h' => 827 ),
	);
}
