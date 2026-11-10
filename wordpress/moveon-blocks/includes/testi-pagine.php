<?php
/**
 * Testi di serie dei nuovi elementi (sezioni delle pagine) e contenuto delle pagine pronte:
 * Chi sono, Servizi (con una pagina per servizio), Contatti.
 * Scritti in parole semplici, in prima persona («io»). Le parti tra [quadre] vanno controllate dal titolare:
 * sono tempi o dettagli d'esempio.
 */

defined( 'ABSPATH' ) || exit;

/** Valori iniziali dei nuovi elementi (si uniscono a quelli di defaults.php). */
function mo_defaults_sezioni(): array {
	return array(
		'chi_breve'   => array(
			'anchor'       => 'chi-siamo',
			'etichetta'    => 'Chi sono',
			'numero'       => '25',
			'frase_numero' => 'anni di comunicazione, dall’idea al prodotto finito',
			'titolo'       => 'Prima capisco cosa serve alla tua attività per avere più clienti. Poi lo realizzo.',
			'punti'        => "Il metodo delle aziende grandi, per la tua attività\nPenso e realizzo io, senza passaggi di mano\nUna rete di professionisti, un solo referente",
			'pulsante'     => 'Scopri come lavoro',
			'link'         => '/chi-sono/',
		),
		'intestazione' => array(
			'anchor'    => 'inizio',
			'etichetta' => 'Chi sono',
			'titolo'    => 'Titolo della pagina',
			'testo'     => 'Una o due frasi che spiegano cosa trova qui chi legge.',
			'pulsante'  => '-',
			'link'      => '#contatti',
			'sfumatura' => '0',
		),
		'numeri'      => array(
			'anchor'    => 'numeri',
			'etichetta' => '-',
			'numeri'    => array(
				array( 'numero' => '25+', 'testo' => 'anni di esperienza' ),
				array( 'numero' => '100+', 'testo' => 'progetti realizzati' ),
				array( 'numero' => '1', 'testo' => 'solo referente, dall’idea alla consegna' ),
			),
		),
		'punti'       => array(
			'anchor'    => 'punti-di-forza',
			'etichetta' => 'Perché scegliermi',
			'titolo'    => 'Quello che fa la differenza.',
			'punti'     => array(
				array( 'titolo' => 'Il metodo delle aziende grandi', 'testo' => 'Ho esperienza diretta nella comunicazione di aziende strutturate: rispettare tempi, costi e obiettivi è il mio pane. Porto lo stesso metodo nel tuo progetto.' ),
				array( 'titolo' => 'Dall’idea al prodotto finito', 'testo' => 'Penso il progetto e lo realizzo io. Ti consegno tutto pronto da stampare o da pubblicare.' ),
				array( 'titolo' => 'Siti che aggiorni da solo', 'testo' => 'Costruisco siti su misura che potrai modificare da solo, senza chiamare nessuno.' ),
				array( 'titolo' => 'Una rete di professionisti', 'testo' => 'Tipografie, fotografi, chi scrive i testi, chi monta le insegne: li coordino io. Tu parli solo con me.' ),
				array( 'titolo' => 'Vicino a te', 'testo' => 'Lavoro a Pescara e in provincia: quando serve, ci vediamo di persona.' ),
				array( 'titolo' => 'Impegni per iscritto', 'testo' => 'Preventivo chiaro, tempi scritti, modifiche incluse e file tuoi alla consegna.' ),
			),
		),
		'passi'       => array(
			'anchor'    => 'come-lavoro',
			'etichetta' => 'Come lavoro',
			'titolo'    => 'Quattro passi, nessuna sorpresa.',
			'passi'     => array(
				array( 'titolo' => 'Ascolto', 'testo' => 'Mi racconti la tua attività e cosa vuoi ottenere.' ),
				array( 'titolo' => 'Proposta', 'testo' => 'Ti mando idea, tempi e costi, chiari e per iscritto.' ),
				array( 'titolo' => 'Realizzazione', 'testo' => 'Ti aggiorno a ogni passo, con le modifiche incluse.' ),
				array( 'titolo' => 'Dopo la consegna', 'testo' => 'I file sono tuoi e resto a disposizione per i ritocchi.' ),
			),
		),
		'elenco'      => array(
			'anchor'    => 'cosa-realizzo',
			'etichetta' => 'Cosa posso realizzare',
			'titolo'    => 'Qualche idea per la tua attività.',
			'gruppi'    => array(
				array( 'titolo' => 'Grafica', 'voci' => "Logo\nBiglietti da visita\nVolantini e brochure\nMenù\nPackaging ed etichette\nInsegne" ),
				array( 'titolo' => 'Web', 'voci' => "Sito vetrina\nNegozio online\nRinnovo del sito\nPrenotazioni online" ),
			),
		),
		'situazioni'  => array(
			'anchor'    => 'da-dove-partire',
			'etichetta' => 'Non sai da dove partire?',
			'titolo'    => 'Dimmi la tua situazione: ti suggerisco io da dove cominciare.',
			'pulsante'  => 'Chiedimi un consiglio',
			'link'      => '#contatti',
			'situazioni' => array(
				array( 'situazione' => 'Apro una nuova attività', 'consigli' => "Logo\nInsegna\nBiglietti da visita\nProfili social\nSito web" ),
				array( 'situazione' => 'Voglio più clienti', 'consigli' => "Volantini\nPubblicità su Facebook e Instagram\nScheda Google\nPromozioni" ),
				array( 'situazione' => 'Voglio vendere online', 'consigli' => "Negozio online\nFoto dei prodotti\nPubblicità online\nNewsletter" ),
				array( 'situazione' => 'La mia immagine è vecchia', 'consigli' => "Rinnovo del logo\nNuovo sito\nMateriali coordinati" ),
				array( 'situazione' => 'Ho un evento o una fiera', 'consigli' => "Manifesti\nRoll-up\nAllestimento dello stand\nInviti\nPost e storie" ),
			),
		),
		'faq'         => array(
			'anchor'    => 'domande',
			'etichetta' => 'Domande frequenti',
			'titolo'    => 'Le risposte alle domande che mi fanno più spesso.',
			'domande'   => array(
				array( 'domanda' => 'Quanto costa?', 'risposta' => 'Dipende da cosa ti serve. Dopo una breve chiacchierata ti mando un preventivo chiaro, voce per voce.' ),
				array( 'domanda' => 'Quanto tempo serve?', 'risposta' => 'Te lo scrivo nel preventivo, prima di iniziare, e ti aggiorno a ogni passo.' ),
			),
		),
		'recensioni'  => array(
			'anchor'    => 'recensioni',
			'etichetta' => 'Dicono di me',
			'titolo'    => 'Le parole dei clienti.',
			'recensioni' => array(
				array( 'testo' => '[Qui la recensione di un cliente: due o tre righe su com’è andata e cosa gli è piaciuto del risultato.]', 'nome' => '[Nome Cognome]', 'attivita' => '[Attività, città]' ),
				array( 'testo' => '[Seconda recensione: cosa serviva al cliente e com’è andata.]', 'nome' => '[Nome Cognome]', 'attivita' => '[Attività, città]' ),
				array( 'testo' => '[Terza recensione, breve.]', 'nome' => '[Nome Cognome]', 'attivita' => '[Attività, città]' ),
			),
		),
		'lavori'      => array(
			'anchor'    => 'lavori',
			'etichetta' => 'Alcuni lavori',
			'titolo'    => 'Progetti realizzati.',
			'area'      => 'tutte',
			'quanti'    => '3',
			'pulsante'  => 'Tutti i progetti',
		),
		'invito'      => array(
			'anchor'   => 'parliamone',
			'titolo'   => 'Hai un progetto in mente? Parliamone.',
			'testo'    => 'Raccontami la tua idea: ti dico come darle forma, con tempi e costi chiari.',
			'pulsante' => 'Contattami',
			'link'     => '/contatti/',
		),
	);
}

/**
 * Le pagine pronte create da MoveOn → Strumenti → «Crea le pagine».
 * Ogni pagina: chiave => titolo, indirizzo, pagina madre, elenco di elementi (shortcode con i loro testi).
 */
function mo_pagine_pronte(): array {
	$servizi = mo_servizi_pagine();
	$pagine  = array(
		'chi-sono' => array(
			'titolo'  => 'Chi sono',
			'madre'   => '',
			'sezioni' => array(
				array( 'intestazione', array( 'etichetta' => 'Chi sono', 'titolo' => '25 anni di comunicazione. Un solo referente.', 'testo' => 'Sono un freelance: aiuto aziende e professionisti di Pescara e provincia a farsi conoscere e a trovare nuovi clienti, con grafica, siti, social e stampa.' ) ),
				array( 'numeri', array() ),
				array( 'punti', array( 'etichetta' => 'Perché scegliermi' ) ),
				array( 'passi', array() ),
				array( 'lavori', array() ),
				array( 'recensioni', array() ),
				array( 'invito', array() ),
			),
		),
		'servizi'  => array(
			'titolo'  => 'Servizi',
			'madre'   => '',
			'sezioni' => array(
				array( 'intestazione', array( 'etichetta' => 'Servizi', 'titolo' => 'Tutto quello che serve alla tua attività per farsi notare.', 'testo' => 'Grafica, siti, social e stampa: un solo referente, dall’idea al prodotto finito.' ) ),
				array( 'servizi', array() ),
				array( 'situazioni', array( 'link' => '/contatti/' ) ),
				array( 'invito', array() ),
			),
		),
		'contatti' => array(
			'titolo'  => 'Contatti',
			'madre'   => '',
			'sezioni' => array(
				array( 'contatti', array() ),
				array( 'faq', array( 'domande' => array(
					array( 'domanda' => 'Dove lavori?', 'risposta' => 'A Pescara e in tutta la provincia. [Per alcuni lavori anche a distanza.]' ),
					array( 'domanda' => 'Quanto costa un lavoro?', 'risposta' => 'Dipende da cosa ti serve. Dopo una breve chiacchierata ti mando un preventivo chiaro, voce per voce, prima di iniziare.' ),
					array( 'domanda' => 'In quanto tempo mi rispondi?', 'risposta' => '[Di solito entro un giorno lavorativo.]' ),
				) ) ),
			),
		),
	);
	foreach ( $servizi as $slug => $s ) {
		$sezioni = array(
			array( 'intestazione', array( 'etichetta' => 'Servizi', 'titolo' => $s['titolo'], 'testo' => $s['testo'], 'pulsante' => 'Chiedimi un preventivo', 'link' => '/contatti/' ) ),
			array( 'punti', array( 'etichetta' => 'Cosa ottieni', 'titolo' => $s['punti_titolo'], 'punti' => $s['punti'] ) ),
			array( 'elenco', array( 'etichetta' => 'Cosa posso realizzare', 'titolo' => $s['elenco_titolo'], 'gruppi' => array( array( 'titolo' => '-', 'voci' => $s['voci'] ) ) ) ),
		);
		if ( '' !== $s['area'] ) {
			$sezioni[] = array( 'lavori', array( 'area' => $s['area'] ) );
		}
		$sezioni[] = array( 'faq', array( 'domande' => $s['faq'], 'titolo' => 'Le domande che mi fanno più spesso.' ) );
		$sezioni[] = array( 'invito', array() );
		$pagine[ $slug ] = array( 'titolo' => $s['nome'], 'madre' => 'servizi', 'sezioni' => $sezioni );
	}
	return $pagine;
}

/** I servizi con la loro pagina (l'App non c'è: il titolare ha deciso di non mostrarla per ora). */
function mo_servizi_pagine(): array {
	return array(
		'grafica'    => array(
			'nome'          => 'Grafica e immagine',
			'area'          => 'branding',
			'titolo'        => 'Logo e immagine della tua attività, a Pescara e provincia.',
			'testo'         => 'Ti aiuto a farti riconoscere: un logo che resta in mente e materiali coordinati, dal biglietto da visita all’insegna.',
			'punti_titolo'  => 'Un’immagine che lavora per te.',
			'punti'         => array(
				array( 'titolo' => 'Ti riconoscono al primo sguardo', 'testo' => 'Un logo semplice e forte, che funziona ovunque: sull’insegna, sul sito, su un adesivo.' ),
				array( 'titolo' => 'Sembri più grande e affidabile', 'testo' => 'Colori, caratteri e stile sempre uguali: i clienti percepiscono un’attività seria e curata.' ),
				array( 'titolo' => 'Tutto pronto all’uso', 'testo' => 'Ricevi i file pronti per la tipografia, per il web e per i social. Non devi pensare a niente.' ),
			),
			'elenco_titolo' => 'Tutto quello che serve per farti riconoscere.',
			'voci'          => "Logo\nRinnovo del logo\nBiglietti da visita\nCarta intestata e buste\nVolantini e brochure\nCataloghi e listini\nMenù per ristoranti e bar\nPackaging ed etichette\nInsegne e vetrofanie\nManifesti e locandine\nGrafica per veicoli\nPresentazioni aziendali\nInviti e partecipazioni\nGadget personalizzati",
			'faq'           => array(
				array( 'domanda' => 'Quanto tempo serve per un logo?', 'risposta' => 'Di solito [due o tre settimane], modifiche comprese. Te lo scrivo nel preventivo, prima di iniziare.' ),
				array( 'domanda' => 'Ho già un logo: posso solo sistemarlo?', 'risposta' => 'Certo. Spesso basta rinnovarlo, mantenendo quello che i clienti già riconoscono.' ),
				array( 'domanda' => 'Mi aiuti anche con la stampa?', 'risposta' => 'Sì: scelgo carta e tipografia e seguo la stampa fino alla consegna.' ),
			),
		),
		'siti-web'   => array(
			'nome'          => 'Siti web e negozi online',
			'area'          => 'web',
			'titolo'        => 'Siti web e negozi online per la tua attività.',
			'testo'         => 'Un sito chiaro, veloce e facile da trovare su Google, che potrai aggiornare da solo.',
			'punti_titolo'  => 'Un sito che porta clienti.',
			'punti'         => array(
				array( 'titolo' => 'Ti trovano su Google', 'testo' => 'Pagine scritte e costruite per farti trovare da chi cerca quello che offri, a Pescara e dintorni.' ),
				array( 'titolo' => 'Perfetto sul telefono', 'testo' => 'La maggior parte delle visite arriva dallo smartphone: il sito è pensato prima di tutto lì.' ),
				array( 'titolo' => 'Lo aggiorni da solo', 'testo' => 'Testi, foto e prodotti li cambi tu in pochi clic, senza dover chiamare nessuno.' ),
			),
			'elenco_titolo' => 'Dal sito vetrina al negozio online.',
			'voci'          => "Sito vetrina\nSito aziendale\nNegozio online\nPagina per una promozione\nRinnovo di un sito esistente\nPrenotazioni e richieste online\nNotizie e blog\nSito in più lingue\nCollegamento con Google Maps e WhatsApp\nAssistenza e aggiornamenti",
			'faq'           => array(
				array( 'domanda' => 'Quanto costa un sito?', 'risposta' => 'Dipende da quante pagine e funzioni servono. Dopo una breve chiacchierata ti mando un preventivo chiaro, voce per voce.' ),
				array( 'domanda' => 'Potrò modificarlo da solo?', 'risposta' => 'Sì. Ti spiego come fare e resto a disposizione per qualsiasi dubbio.' ),
				array( 'domanda' => 'Ho già un sito: si può rinnovare?', 'risposta' => 'Sì, partendo da quello che funziona già e migliorando il resto.' ),
			),
		),
		'social'     => array(
			'nome'          => 'Social e pubblicità online',
			'area'          => 'social',
			'titolo'        => 'Social e pubblicità online, per avere più clienti.',
			'testo'         => 'Ti aiuto a farti conoscere su Facebook e Instagram e a trasformare chi ti segue in clienti.',
			'punti_titolo'  => 'Più persone ti conoscono, più clienti arrivano.',
			'punti'         => array(
				array( 'titolo' => 'Post belli e costanti', 'testo' => 'Un calendario chiaro e grafiche curate: la tua pagina sempre attiva, senza pensieri.' ),
				array( 'titolo' => 'Pubblicità alle persone giuste', 'testo' => 'Campagne su Facebook e Instagram per chi abita vicino a te e può diventare tuo cliente.' ),
				array( 'titolo' => 'Risultati che vedi', 'testo' => 'Ogni mese ti mostro cosa ha funzionato, con numeri semplici da capire.' ),
			),
			'elenco_titolo' => 'Tutto quello che serve per farti notare online.',
			'voci'          => "Apertura e sistemazione dei profili\nCalendario dei post\nGrafiche per post e storie\nBrevi video (reel)\nFoto dei prodotti\nPubblicità su Facebook e Instagram\nPromozioni ed eventi\nNewsletter\nScheda Google della tua attività\nResoconto mensile",
			'faq'           => array(
				array( 'domanda' => 'Su quali social devo essere?', 'risposta' => 'Dipende dai tuoi clienti. Per molte attività locali Facebook e Instagram bastano: te lo dico dopo aver capito chi vuoi raggiungere.' ),
				array( 'domanda' => 'Quanto devo spendere in pubblicità?', 'risposta' => 'Si può partire con poco e aumentare solo se i risultati arrivano.' ),
				array( 'domanda' => 'Posso continuare a pubblicare anch’io?', 'risposta' => 'Certo: ti preparo grafiche e modelli da usare quando vuoi.' ),
			),
		),
		'stampa'     => array(
			'nome'          => 'Stampa e allestimenti',
			'area'          => 'stampa',
			'titolo'        => 'Stampa e allestimenti, con un solo referente.',
			'testo'         => 'Dai biglietti da visita agli striscioni, dalle fiere alle vetrine: scelgo i fornitori giusti e seguo tutto io.',
			'punti_titolo'  => 'Tu scegli, io penso al resto.',
			'punti'         => array(
				array( 'titolo' => 'Un solo referente', 'testo' => 'Non devi cercare e coordinare tipografie, montatori e fornitori: ci penso io.' ),
				array( 'titolo' => 'Qualità controllata', 'testo' => 'Lavoro con fornitori scelti in 25 anni e controllo ogni prova prima della stampa.' ),
				array( 'titolo' => 'Prezzi e tempi chiari', 'testo' => 'Sai subito quanto spendi e quando ricevi il materiale.' ),
			),
			'elenco_titolo' => 'Dalla tipografia allo stand in fiera.',
			'voci'          => "Biglietti da visita\nVolantini e pieghevoli\nBrochure e cataloghi\nManifesti\nStriscioni e banner\nRoll-up\nAdesivi ed etichette\nVetrofanie\nInsegne\nAllestimenti per fiere\nGrafica per veicoli\nAbbigliamento personalizzato\nGadget\nDistribuzione di volantini\nSMS ed email promozionali",
			'faq'           => array(
				array( 'domanda' => 'Posso stampare anche poche copie?', 'risposta' => 'Sì: scelgo la stampa più adatta, anche per piccole quantità.' ),
				array( 'domanda' => 'Mi prepari anche la grafica?', 'risposta' => 'Sì, preparo io i file, oppure controllo i tuoi prima della stampa.' ),
				array( 'domanda' => 'Pensi anche al montaggio?', 'risposta' => 'Per insegne, vetrofanie e fiere coordino anche il montaggio.' ),
			),
		),
		'formazione' => array(
			'nome'          => 'Formazione',
			'area'          => '',
			'titolo'        => 'Corsi di grafica e WordPress, uno a uno.',
			'testo'         => 'Lezioni individuali, su misura per te o per i tuoi collaboratori: impari a usare gli strumenti dei professionisti.',
			'punti_titolo'  => 'Impari quello che ti serve davvero.',
			'punti'         => array(
				array( 'titolo' => 'Lezioni su misura', 'testo' => 'Partiamo da quello che sai già e da quello che ti serve nel lavoro.' ),
				array( 'titolo' => 'Esempi concreti', 'testo' => 'Impari lavorando sui tuoi materiali: il volantino, la pagina del sito, il post da pubblicare.' ),
				array( 'titolo' => 'Diventi autonomo', 'testo' => 'L’obiettivo è che tu possa fare da solo le cose di tutti i giorni.' ),
			),
			'elenco_titolo' => 'Cosa puoi imparare.',
			'voci'          => "Photoshop\nIllustrator\nInDesign\nWordPress\nPreparare i file per la stampa\nGrafiche per i social\nCorsi per aziende e collaboratori",
			'faq'           => array(
				array( 'domanda' => 'Serve esperienza?', 'risposta' => 'No: si parte dal tuo livello, anche da zero.' ),
				array( 'domanda' => 'Dove si fanno le lezioni?', 'risposta' => '[A Pescara di persona oppure online, come preferisci.]' ),
				array( 'domanda' => 'Quanto dura un corso?', 'risposta' => 'Dipende dagli obiettivi: [di solito da 4 a 10 lezioni].' ),
			),
		),
	);
}
