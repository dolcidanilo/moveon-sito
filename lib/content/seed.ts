import type { Progetto, SiteContent } from './types';

/*
 * Contenuti iniziali, ripresi dal prototipo approvato.
 * Nella Fase 3 il pulsante "Importa contenuti iniziali" del pannello li copia in Sanity:
 * da quel momento il sito legge da Sanity e questo file resta solo come riserva.
 */

const img = (url: string, alt: string, width: number, height: number, hotspot?: { x: number; y: number }) => ({
  url,
  alt,
  width,
  height,
  hotspot,
});

const fotoIdea = img(
  '/seed/idea-arcobaleno.jpg',
  'Profilo di una ragazza con i capelli color arcobaleno mossi dal vento',
  784,
  452,
  { x: 0.3, y: 0.45 },
);

const progetti: Progetto[] = [
  {
    _id: 'forno-aurora',
    nome: 'Forno Aurora',
    area: 'branding',
    tipo: 'Logo e packaging',
    richiesta: 'Un forno artigianale che voleva farsi riconoscere anche fuori dal quartiere.',
    lavoro: 'Logo, palette colori, sacchetti e scatole per i dolci, insegna del punto vendita.',
  },
  {
    _id: 'studio-legale-ferri',
    nome: 'Studio Legale Ferri',
    area: 'web',
    tipo: 'Sito istituzionale',
    richiesta: 'Uno studio professionale che cercava un sito chiaro e autorevole.',
    lavoro: 'Struttura dei contenuti, design delle pagine, sito WordPress e schede dei servizi.',
  },
  {
    _id: 'cantina-valtenna',
    nome: 'Cantina Valtenna',
    area: 'stampa',
    tipo: 'Etichette e packaging',
    richiesta: 'Una cantina pronta a lanciare la sua nuova linea di vini.',
    lavoro: 'Sistema di etichette, cartoni da sei bottiglie e materiali per le fiere di settore.',
  },
  {
    _id: 'fitlab',
    nome: 'FitLab',
    area: 'social',
    tipo: 'Campagna Meta Ads',
    richiesta: 'Una palestra che voleva riempire i corsi del nuovo anno.',
    lavoro: 'Piano editoriale, grafiche e video per Instagram, campagne Meta Ads con report mensile.',
  },
  {
    _id: 'ottica-bellavista',
    nome: 'Ottica Bellavista',
    area: 'web',
    tipo: 'E-commerce',
    richiesta: 'Un negozio di ottica che voleva vendere anche online.',
    lavoro: 'E-commerce con catalogo montature, pagamenti, spedizioni e newsletter ai clienti.',
  },
  {
    _id: 'festival-jazz',
    nome: 'Festival Jazz',
    area: 'stampa',
    tipo: 'Manifesti e roll-up',
    richiesta: 'Un festival estivo da far conoscere in tutta la regione.',
    lavoro: 'Identità dell’evento, manifesti, roll-up, affissioni e grafiche per i social.',
  },
  {
    _id: 'dolcemente',
    nome: 'Dolcemente',
    area: 'social',
    tipo: 'Piano editoriale',
    richiesta: 'Una pasticceria che voleva più clienti nel fine settimana.',
    lavoro: 'Shooting dei prodotti, calendario dei post, storie settimanali e gestione delle recensioni.',
  },
  {
    _id: 'hotel-belvedere',
    nome: 'Hotel Belvedere',
    area: 'branding',
    tipo: 'Immagine coordinata',
    richiesta: 'Un hotel storico che voleva un’immagine più moderna senza perdere eleganza.',
    lavoro: 'Restyling del logo, biglietti da visita, carta intestata, segnaletica interna e menù.',
  },
].map((p) => ({
  ...p,
  area: p.area as Progetto['area'],
  copertina: img(`/seed/portfolio-${p._id}.svg`, `Copertina di esempio del progetto ${p.nome}`, 1200, 900),
  galleria: [],
  risultato: '[Da inserire con i risultati reali del cliente]',
}));

export const seed: SiteContent = {
  settings: {
    logoChiaro: img('/seed/logo-chiaro.png', 'MoveOn Studio', 216, 49),
    logoScuro: img('/seed/logo-scuro.png', 'MoveOn Studio', 216, 49),
    telefono: '+39 347 461 6434',
    whatsapp: '+39 347 461 6434',
    email: 'info@moveonstudio.it',
    headerCta: 'Richiedi Preventivo',
    mobileCta: 'Contattaci Ora',
    menu: [
      { testo: 'Chi siamo', blocco: 'chiSiamo' },
      { testo: 'Servizi', blocco: 'servizi' },
      { testo: 'Portfolio', blocco: 'portfolio' },
      { testo: 'Contatti', blocco: 'contatti' },
    ],
    footerClaim: 'Diamo forma alle tue idee, pixel dopo pixel.',
    datiLegali: 'MoveOn Studio. Tutti i diritti riservati. P. IVA 02117290680',
    privacyUrl: 'https://www.iubenda.com/privacy-policy/78862801',
    cookieUrl: 'https://www.iubenda.com/privacy-policy/78862801/cookie-policy',
    seoTitolo: 'MoveOn Studio · Creatività, strategia e risultati',
    seoDescrizione:
      'Agenzia creativa con oltre 25 anni di esperienza: branding, siti web, social e stampa con un unico partner. Raccontaci la tua idea.',
  },

  blocks: [
    {
      _type: 'hero',
      _key: 'hero',
      visibile: true,
      titolo: 'Creatività,\nstrategia\ne risultati.',
      parolaEvidenziata: 'risultati.',
      testo:
        'Diamo forma alle tue idee, pixel dopo pixel: branding, web, social e stampa con un unico partner, da oltre 25 anni.',
      pulsante: { testo: 'Scopri i Servizi', blocco: 'servizi' },
    },
    {
      _type: 'nastro',
      _key: 'nastro',
      visibile: true,
      riga1: [
        { testo: 'Creatività', stile: 'foto' },
        { testo: 'Strategia', stile: 'blu' },
        { testo: 'Risultati', stile: 'navy' },
        { testo: 'Su misura', stile: 'bluChiaro' },
      ],
      riga2: [
        { testo: 'A 360°', stile: 'bluChiaro' },
        { testo: 'Esperienza', stile: 'foto' },
        { testo: 'Consulenza', stile: 'blu' },
        { testo: 'Dall’idea al prodotto finito', stile: 'navy' },
      ],
      foto: fotoIdea,
    },
    {
      _type: 'chiSiamo',
      _key: 'chiSiamo',
      visibile: true,
      etichetta: 'Chi siamo',
      numero: '25',
      fotoNumero: fotoIdea,
      fraseNumero: 'anni di creatività e innovazione',
      manifesto:
        'Nel mondo della comunicazione visiva, l’esperienza fa la differenza. Da 25 anni, MoveOn è il partner di riferimento per aziende e professionisti che desiderano distinguersi con un’immagine forte, coerente ed efficace. La nostra forza risiede nella completezza dell’offerta, nella competenza acquisita e nella rete di contatti che mettiamo a disposizione dei nostri clienti per trasformare ogni idea in un progetto concreto e di successo.',
      ideaTitolo: 'Dall’idea al prodotto finito',
      ideaTesto:
        'Ci occupiamo di tutto: dall’ideazione alla progettazione, fino alla realizzazione finale. Non dovrai preoccuparti di coordinare più fornitori o gestire complessità tecniche: pensiamo a tutto noi, lasciandoti libero di concentrarti sul tuo business.',
      ideaPassi: { da: 'Idea', a: 'Prodotto finito' },
      motiviTitolo: 'Tanti buoni motivi per sceglierci',
      motivi: [
        {
          _key: 'm1',
          titolo: '25 Anni di Esperienza',
          testo:
            'Due decenni e mezzo di attività ci hanno permesso di affinare competenze, tecniche e strategie per offrire sempre soluzioni innovative, funzionali e di grande impatto.',
          icona: 'orologio',
        },
        {
          _key: 'm2',
          titolo: 'Know-how e Consulenza Strategica',
          testo:
            'Grazie alla nostra profonda conoscenza del settore, siamo in grado di offrirti una consulenza mirata per aiutarti a prendere le migliori decisioni per la tua comunicazione. Dall’analisi del brand alla scelta degli strumenti più efficaci, ti guidiamo passo dopo passo per ottenere il massimo risultato.',
          icona: 'bussola',
        },
        {
          _key: 'm3',
          titolo: 'Una rete di contatti per ogni esigenza',
          testo:
            'Negli anni abbiamo costruito un network di collaboratori qualificati in diversi ambiti: stampa, fotografia, copywriting, marketing e sviluppo tecnologico. Questo ci permette di offrirti soluzioni complete e su misura, riducendo i tempi di realizzazione e garantendo la massima qualità in ogni fase del progetto.',
          icona: 'rete',
        },
        {
          _key: 'm4',
          titolo: 'Un servizio completo, dalla creatività alla realizzazione',
          testo: 'Siamo il tuo unico punto di riferimento per tutto ciò che riguarda la comunicazione visiva e digitale.',
          icona: 'scatola',
          etichette: [
            'Editoria e Grafica',
            'Logo e Brand Identity',
            'Campagne Pubblicitarie',
            'Siti Web ed E-commerce',
            'Gestione Social Media',
            'App Webview',
            'Corsi di Formazione',
          ],
        },
      ],
      chiusura:
        'Se cerchi un partner affidabile, esperto e sempre aggiornato, capace di trasformare la tua visione in una comunicazione efficace e vincente, MoveOn è la scelta giusta.',
      link: {
        testo: 'Contattaci oggi stesso',
        resto: 'e scopri come possiamo far crescere la tua attività!',
        blocco: 'contatti',
      },
    },
    {
      _type: 'pausa',
      _key: 'pausa',
      visibile: true,
      foto: img(
        '/seed/pausa-cuffie.jpg',
        'Ritratto di una ragazza con le cuffie, illuminata da luci rosse e azzurre',
        1920,
        954,
        { x: 0.5, y: 0.32 },
      ),
      frase: 'Le idee che emozionano\nsi ricordano.',
    },
    {
      _type: 'servizi',
      _key: 'servizi',
      visibile: true,
      etichetta: 'Servizi',
      apertura: 'Dall’idea al prodotto finito, sei competenze in un unico studio.',
      servizi: [
        {
          _key: 's1',
          nome: 'Grafica & Identità Visiva',
          beneficio: 'Un’immagine riconoscibile e coerente, ovunque i tuoi clienti ti incontrino.',
          voci: [
            'Logo e branding',
            'Immagine coordinata',
            'Brochure e cataloghi',
            'Packaging ed etichette',
            'Roll-up e manifesti',
            'Segnaletica e menù',
          ],
          parolaSfondo: 'Brand',
          colore: 'bianco',
          illustrazione: 'identita',
        },
        {
          _key: 's2',
          nome: 'Siti Web & E-commerce',
          beneficio: 'Siti veloci e chiari, pensati per trasformare le visite in contatti e vendite.',
          voci: ['Siti istituzionali', 'E-commerce', 'Landing page', 'Blog e magazine', 'Gestione e aggiornamento', 'Newsletter'],
          parolaSfondo: 'Web',
          colore: 'blu',
          illustrazione: 'web',
        },
        {
          _key: 's3',
          nome: 'Digital Marketing & Social',
          beneficio: 'Pagine curate e campagne misurabili, con report che capisci al volo.',
          voci: ['Facebook e Instagram', 'Piani editoriali', 'Post grafici e video', 'Meta e Google Ads', 'Report', 'Gestione recensioni'],
          parolaSfondo: 'Social',
          colore: 'grigio',
          illustrazione: 'social',
        },
        {
          _key: 's4',
          nome: 'App WebView',
          beneficio: 'Il tuo sito o e-commerce diventa un’app Android e iOS, pronta per gli store.',
          voci: ['Android', 'iOS', 'Pubblicazione sugli store'],
          parolaSfondo: 'App',
          colore: 'navy',
          illustrazione: 'app',
        },
        {
          _key: 's5',
          nome: 'Servizi a 360°',
          beneficio: 'Una rete di fornitori selezionati: qualità alta, prezzi competitivi e un solo interlocutore.',
          voci: [
            'Stampa digitale e offset',
            'Impianti e affissioni',
            'Allestimenti fiere',
            'Distribuzione',
            'Materiali speciali',
            'SMS e DEM',
          ],
          parolaSfondo: '360°',
          colore: 'blu',
          illustrazione: 'rete',
        },
        {
          _key: 's6',
          nome: 'Formazione',
          beneficio: 'Corsi individuali per diventare autonomo con gli strumenti dei professionisti.',
          voci: ['Photoshop', 'Illustrator', 'InDesign', 'WordPress'],
          parolaSfondo: 'Corsi',
          colore: 'bianco',
          illustrazione: 'formazione',
        },
      ],
      finale: {
        frase: 'Hai un’idea? Le diamo forma noi.',
        pulsante: { testo: 'Contattaci Ora', blocco: 'contatti' },
      },
    },
    {
      _type: 'portfolio',
      _key: 'portfolio',
      visibile: true,
      etichetta: 'Portfolio',
      titolo: 'Ogni progetto nasce sul tavolo da lavoro.',
      istruzioni:
        'Sposta i lavori come fogli sul tavolo, oppure mettili in ordine e filtrali per area. Sono progetti di esempio, da sostituire con quelli reali.',
      modalita: 'tavolo',
    },
    {
      _type: 'garanzie',
      _key: 'garanzie',
      visibile: true,
      etichetta: 'Le nostre garanzie',
      titolo: 'Meglio andare sul sicuro, non credi?',
      sottotitolo: 'Impegni concreti che mettiamo per iscritto, perché la fiducia si costruisce con i fatti.',
      garanzie: [
        {
          _key: 'g1',
          titolo: 'Preventivo chiaro e dettagliato',
          testo: 'Sai subito cosa comprende ogni voce e quanto costa. Nessuna sorpresa a fine lavoro.',
        },
        {
          _key: 'g2',
          titolo: 'Tempi scritti nero su bianco',
          testo: 'Le date di consegna sono nel preventivo e ti aggiorniamo a ogni fase del progetto.',
        },
        {
          _key: 'g3',
          titolo: 'Revisioni incluse',
          testo: '[N] giri di modifiche compresi nel prezzo, per arrivare al risultato che hai in mente.',
        },
        {
          _key: 'g4',
          titolo: 'I file sono tuoi',
          testo: 'Alla consegna ricevi i file originali e la piena proprietà del lavoro realizzato.',
        },
        {
          _key: 'g5',
          titolo: 'Un unico referente',
          testo: 'Una persona segue il tuo progetto dall’inizio alla fine: sai sempre a chi chiedere.',
        },
        {
          _key: 'g6',
          titolo: 'Assistenza dopo la consegna',
          testo: '[N] mesi di supporto per piccoli aggiustamenti, dubbi e aggiornamenti.',
        },
      ],
      sigillo: 'Garanzia MoveOn Studio, scelta sicura',
    },
    {
      _type: 'contatti',
      _key: 'contatti',
      visibile: true,
      etichetta: 'Contatti',
      titolo: 'Parliamo del\ntuo progetto.',
      testo: 'Raccontaci la tua idea: ti diciamo come darle forma, con tempi e costi chiari.',
      foto: img(
        '/seed/contatti-lettore.jpg',
        'Un personaggio viola e peloso legge un libro seduto su una poltrona azzurra',
        784,
        827,
        { x: 0.5, y: 0.5 },
      ),
      bollino: 'Raccontaci la tua idea',
      opzioni: [
        'Grafica e identità visiva',
        'Sito web o e-commerce',
        'Social e digital marketing',
        'App WebView',
        'Stampa e servizi a 360°',
        'Formazione',
        'Non lo so ancora, consigliatemi',
      ],
      titoloPulsanti: 'Preferisci parlarci subito?',
      conferma: 'Ti ricontattiamo al più presto.',
    },
  ],

  progetti,
};
