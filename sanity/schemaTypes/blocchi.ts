import {
  BlockElementIcon,
  CommentIcon,
  ImageIcon,
  PresentationIcon,
  ProjectsIcon,
  StarIcon,
  ThListIcon,
  UsersIcon,
  CheckmarkCircleIcon,
} from '../icons';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { ParolaInput } from '../components/inputs';
import { etichettaSezione, etichette, immagine, portaA, pulsante, quantita, testo } from './helpers';

const singolo = (title: string) => ({ prepare: () => ({ title }) });

/* ============ HERO ============ */
export const hero = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'document',
  icon: StarIcon,
  fields: [
    testo({
      name: 'titolo',
      title: 'Titolo principale',
      description: 'Il titolo grande a inizio pagina. Va a capo dove premi Invio: ogni riga compare con la sua animazione. Es. «Creatività, / strategia / e risultati.»',
      righe: 3,
      maxParole: 8,
    }),
    defineField({
      name: 'parolaEvidenziata',
      title: 'Parola sottolineata in giallo',
      type: 'string',
      description: 'Clicca la parola del titolo che riceve la pennellata gialla.',
      components: { input: ParolaInput },
    }),
    testo({
      name: 'testo',
      title: 'Testo sotto il titolo',
      description: 'Il paragrafo sotto il titolo: beneficio prima della caratteristica. Es. «Diamo forma alle tue idee, pixel dopo pixel: …»',
      righe: 3,
      maxFrasi: 2,
    }),
    pulsante('pulsante', 'Pulsante', 'Il pulsante sotto il testo. La lampadina in pixel accanto è un’animazione fissa del sito.', 'Scopri i Servizi'),
  ],
  preview: singolo('Hero'),
});

/* ============ NASTRO PAROLE CHIAVE ============ */
const parola = defineArrayMember({
  type: 'object',
  name: 'parola',
  title: 'Parola',
  fields: [
    testo({ name: 'testo', title: 'Parola', description: 'Una o poche parole, es. «Strategia».', maxParole: 5 }),
    defineField({
      name: 'stile',
      title: 'Stile della parola',
      type: 'string',
      description: 'Il colore della parola. «Riempita con foto» usa la foto qui sotto dentro le lettere.',
      options: {
        list: [
          { title: 'Navy', value: 'navy' },
          { title: 'Blu', value: 'blu' },
          { title: 'Blu chiaro', value: 'bluChiaro' },
          { title: 'Riempita con foto', value: 'foto' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'navy',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'testo', stile: 'stile' },
    prepare: ({ title, stile }) => ({
      title,
      subtitle: ({ navy: 'Navy', blu: 'Blu', bluChiaro: 'Blu chiaro', foto: 'Riempita con foto' } as Record<string, string>)[stile] ?? '',
    }),
  },
});

export const nastro = defineType({
  name: 'nastro',
  title: 'Nastro parole chiave',
  type: 'document',
  icon: ThListIcon,
  fields: [
    defineField({
      name: 'riga1',
      title: 'Prima riga',
      type: 'array',
      description: 'Le parole della prima riga in movimento, da 4 a 6. Trascinale per cambiare l’ordine.',
      of: [parola],
      validation: quantita(4, 6, 'parole'),
    }),
    defineField({
      name: 'riga2',
      title: 'Seconda riga',
      type: 'array',
      description: 'Le parole della seconda riga, che scorre nel verso opposto. Da 4 a 6.',
      of: [parola],
      validation: quantita(4, 6, 'parole'),
    }),
    immagine({
      name: 'foto',
      title: 'Foto per le parole riempite',
      description: 'La foto che si vede dentro le lettere delle parole con stile «Riempita con foto». Colori saturi e contrastati funzionano meglio.',
      minLarghezza: 1200,
      esempioAlt: 'Ragazza con i capelli color arcobaleno',
    }),
  ],
  preview: singolo('Nastro parole chiave'),
});

/* ============ CHI SIAMO ============ */
const ICONE = [
  { title: 'Orologio (esperienza)', value: 'orologio' },
  { title: 'Bussola (consulenza)', value: 'bussola' },
  { title: 'Rete (contatti, partner)', value: 'rete' },
  { title: 'Scatola (servizio completo)', value: 'scatola' },
  { title: 'Lampadina (idee)', value: 'lampadina' },
  { title: 'Stella (qualità)', value: 'stella' },
  { title: 'Cuore (passione)', value: 'cuore' },
  { title: 'Grafico (risultati)', value: 'grafico' },
];

export const chiSiamo = defineType({
  name: 'chiSiamo',
  title: 'Chi siamo',
  type: 'document',
  icon: UsersIcon,
  groups: [
    { name: 'apertura', title: 'Numero e manifesto', default: true },
    { name: 'idea', title: 'Dall’idea al prodotto' },
    { name: 'motivi', title: 'Motivi' },
    { name: 'chiusura', title: 'Chiusura' },
  ],
  fields: [
    etichettaSezione('Chi siamo', 'apertura'),
    testo({
      name: 'numero',
      title: 'Numero grande',
      description: 'Il numero gigante che si riempie con la foto mentre scorri. Es. «25».',
      max: 3,
      group: 'apertura',
    }),
    immagine({
      name: 'fotoNumero',
      title: 'Foto che riempie il numero',
      description: 'La foto che compare dentro il numero grande. Colori saturi e contrastati funzionano meglio.',
      minLarghezza: 1200,
      group: 'apertura',
      esempioAlt: 'Ragazza con i capelli color arcobaleno',
    }),
    testo({
      name: 'fraseNumero',
      title: 'Frase accanto al numero',
      description: 'Completa il numero. Es. «anni di creatività e innovazione».',
      maxParole: 8,
      group: 'apertura',
    }),
    testo({
      name: 'manifesto',
      title: 'Manifesto',
      description: 'Il testo grande che si accende parola per parola mentre scorri.',
      righe: 6,
      maxParole: 80,
      group: 'apertura',
    }),
    testo({
      name: 'ideaTitolo',
      title: 'Titolo «Dall’idea al prodotto finito»',
      description: 'Il titolo accanto al cubo che si disegna. Es. «Dall’idea al prodotto finito».',
      maxParole: 8,
      group: 'idea',
    }),
    testo({
      name: 'ideaTesto',
      title: 'Testo «Dall’idea al prodotto finito»',
      description: 'Il paragrafo sotto il titolo: 2–3 frasi, beneficio prima della caratteristica.',
      righe: 4,
      maxFrasi: 3,
      group: 'idea',
    }),
    defineField({
      name: 'ideaPassi',
      title: 'Etichette della linea',
      type: 'object',
      group: 'idea',
      description: 'Le due parole ai lati della linea gialla che si riempie, es. «Idea» → «Prodotto finito».',
      options: { columns: 2 },
      fields: [
        testo({ name: 'da', title: 'Inizio', description: 'Es. «Idea».', maxParole: 3 }),
        testo({ name: 'a', title: 'Fine', description: 'Es. «Prodotto finito».', maxParole: 3 }),
      ],
    }),
    immagine({
      name: 'ideaImmagine',
      title: 'Immagine dell’idea',
      description: 'Facoltativa. Se la lasci vuota resta l’animazione del cubo che si disegna.',
      minLarghezza: 1000,
      obbligatoria: false,
      group: 'idea',
    }),
    testo({
      name: 'motiviTitolo',
      title: 'Titolo dei motivi',
      description: 'Il titolo sopra le card che si impilano. Es. «Tanti buoni motivi per sceglierci».',
      maxParole: 8,
      group: 'motivi',
    }),
    defineField({
      name: 'motivi',
      title: 'Motivi',
      type: 'array',
      group: 'motivi',
      description: 'Le card che si impilano mentre scorri, da 3 a 5. Il colore delle card si alterna da solo. Trascinale per cambiare l’ordine.',
      validation: quantita(3, 5, 'card'),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'motivo',
          title: 'Motivo',
          fields: [
            testo({ name: 'titolo', title: 'Titolo', description: 'Es. «25 Anni di Esperienza».', maxParole: 8 }),
            testo({ name: 'testo', title: 'Testo', description: 'Il paragrafo della card: 2–3 frasi.', righe: 4, maxFrasi: 3 }),
            defineField({
              name: 'icona',
              title: 'Icona',
              type: 'string',
              description: 'Scegli tra le icone del sito.',
              options: { list: ICONE },
              initialValue: 'stella',
              validation: (rule) => rule.required(),
            }),
            etichette('etichette', 'Etichette (facoltative)', 'Piccole etichette sotto il testo, es. «Logo e Brand Identity». Scrivi e premi Invio per aggiungerne una.'),
          ],
          preview: { select: { title: 'titolo', subtitle: 'testo' } },
        }),
      ],
    }),
    testo({
      name: 'chiusura',
      title: 'Frase di chiusura',
      description: 'La frase grande in fondo alla sezione, che si accende parola per parola.',
      righe: 3,
      maxParole: 40,
      group: 'chiusura',
    }),
    defineField({
      name: 'link',
      title: 'Link finale',
      type: 'object',
      group: 'chiusura',
      description: 'La riga sotto la frase di chiusura: un link seguito da un testo. Es. «Contattaci oggi stesso» + «e scopri come possiamo far crescere la tua attività!»',
      fields: [
        testo({ name: 'testo', title: 'Testo del link', description: 'La parte cliccabile, es. «Contattaci oggi stesso».', maxParole: 4 }),
        testo({ name: 'resto', title: 'Testo dopo il link', description: 'Es. «e scopri come possiamo far crescere la tua attività!»', maxParole: 14 }),
        portaA(),
      ],
    }),
  ],
  preview: singolo('Chi siamo'),
});

/* ============ PAUSA EMOZIONALE ============ */
export const pausa = defineType({
  name: 'pausa',
  title: 'Pausa emozionale',
  type: 'document',
  icon: ImageIcon,
  fields: [
    immagine({
      name: 'foto',
      title: 'Foto',
      description:
        'Foto orizzontale che si apre da un cerchio fino a tutto schermo. Il punto focale (clicca la foto, poi «Modifica» → «Punto focale») è il centro del cerchio iniziale. Controlla che i bordi non abbiano strisce chiare.',
      minLarghezza: 1600,
      esempioAlt: 'Ritratto di una ragazza con le cuffie, illuminata da luci rosse e azzurre',
    }),
    testo({
      name: 'frase',
      title: 'Frase',
      description: 'La frase bianca che compare sopra la foto, con una velatura navy. Va a capo dove premi Invio. Es. «Le idee che emozionano / si ricordano.»',
      righe: 2,
      maxParole: 8,
    }),
  ],
  preview: singolo('Pausa emozionale'),
});

/* ============ SERVIZI ============ */
const COLORI_SCHEDA = [
  { title: 'Bianco', value: 'bianco' },
  { title: 'Grigio chiaro', value: 'grigio' },
  { title: 'Blu', value: 'blu' },
  { title: 'Navy', value: 'navy' },
];
const ILLUSTRAZIONI = [
  { title: 'Identità (rombo e cerchio)', value: 'identita' },
  { title: 'Web (finestra con cursore)', value: 'web' },
  { title: 'Social (telefono e cuori)', value: 'social' },
  { title: 'App (sito che diventa app)', value: 'app' },
  { title: 'Rete (pianeti in orbita)', value: 'rete' },
  { title: 'Formazione (livelli)', value: 'formazione' },
];

export const servizi = defineType({
  name: 'servizi',
  title: 'Servizi',
  type: 'document',
  icon: BlockElementIcon,
  fields: [
    etichettaSezione('Servizi'),
    testo({
      name: 'apertura',
      title: 'Frase di apertura',
      description: 'La frase grande prima delle schede. Es. «Dall’idea al prodotto finito, sei competenze in un unico studio.»',
      righe: 2,
      maxParole: 14,
    }),
    defineField({
      name: 'servizi',
      title: 'Servizi',
      type: 'array',
      description: 'Le schede che scorrono in orizzontale su computer e a swipe su telefono. Trascinale per cambiare l’ordine.',
      validation: quantita(1, 8, 'servizi'),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'servizio',
          title: 'Servizio',
          fields: [
            testo({ name: 'nome', title: 'Nome', description: 'Es. «Grafica & Identità Visiva».', maxParole: 5 }),
            testo({
              name: 'beneficio',
              title: 'Frase di beneficio',
              description: 'Cosa ottiene il cliente. Es. «Un’immagine riconoscibile e coerente, ovunque i tuoi clienti ti incontrino.»',
              righe: 2,
              maxFrasi: 2,
            }),
            etichette('voci', 'Voci incluse', 'Le etichette con cosa comprende il servizio. Scrivi e premi Invio per aggiungerne una.', true),
            immagine({
              name: 'immagine',
              title: 'Immagine',
              description: 'Formato 4:3 o 1:1. Se la lasci vuota resta l’illustrazione animata scelta qui sotto.',
              minLarghezza: 1200,
              obbligatoria: false,
            }),
            defineField({
              name: 'illustrazione',
              title: 'Illustrazione di riserva',
              type: 'string',
              description: 'L’illustrazione animata che compare se non carichi un’immagine.',
              options: { list: ILLUSTRAZIONI },
              initialValue: 'identita',
            }),
            testo({ name: 'parolaSfondo', title: 'Parola di sfondo', description: 'La parola gigante e trasparente dietro la scheda. Es. «Brand».', maxParole: 1, max: 8 }),
            defineField({
              name: 'colore',
              title: 'Colore della scheda',
              type: 'string',
              options: { list: COLORI_SCHEDA, layout: 'radio', direction: 'horizontal' },
              initialValue: 'bianco',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'nome', colore: 'colore', media: 'immagine' },
            prepare: ({ title, colore, media }) => ({
              title,
              subtitle: `Scheda ${COLORI_SCHEDA.find((c) => c.value === colore)?.title.toLowerCase() ?? ''}`,
              media: media ?? PresentationIcon,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'finale',
      title: 'Frase finale e pulsante',
      type: 'object',
      description: 'L’ultima scheda, dopo i servizi.',
      fields: [
        testo({ name: 'frase', title: 'Frase finale', description: 'Es. «Hai un’idea? Le diamo forma noi.»', maxParole: 10 }),
        pulsante('pulsante', 'Pulsante', 'Il pulsante giallo sotto la frase.', 'Contattaci Ora'),
      ],
    }),
  ],
  preview: singolo('Servizi'),
});

/* ============ PORTFOLIO (testi del blocco) ============ */
export const portfolio = defineType({
  name: 'portfolio',
  title: 'Portfolio: testi del blocco',
  type: 'document',
  icon: ProjectsIcon,
  fields: [
    etichettaSezione('Portfolio'),
    testo({
      name: 'titolo',
      title: 'Titolo',
      description: 'La frase grande del blocco. Es. «Ogni progetto nasce sul tavolo da lavoro.»',
      maxParole: 10,
    }),
    testo({
      name: 'istruzioni',
      title: 'Testo d’istruzioni',
      description: 'Spiega come usare il tavolo. Es. «Sposta i lavori come fogli sul tavolo, oppure mettili in ordine e filtrali per area.»',
      righe: 3,
      maxFrasi: 3,
    }),
    defineField({
      name: 'modalita',
      title: 'Modalità iniziale',
      type: 'string',
      description: 'Come appaiono i lavori all’apertura su computer; su telefono partono sempre «In ordine». I progetti si aggiungono dalla voce «Portfolio: progetti» del menu.',
      options: { list: [{ title: 'Sul tavolo', value: 'tavolo' }, { title: 'In ordine', value: 'ordine' }], layout: 'radio', direction: 'horizontal' },
      initialValue: 'tavolo',
    }),
  ],
  preview: singolo('Portfolio: testi del blocco'),
});

/* ============ LE NOSTRE GARANZIE ============ */
export const garanzie = defineType({
  name: 'garanzie',
  title: 'Le nostre garanzie',
  type: 'document',
  icon: CheckmarkCircleIcon,
  fields: [
    etichettaSezione('Le nostre garanzie'),
    testo({ name: 'titolo', title: 'Titolo', description: 'La frase grande. Es. «Meglio andare sul sicuro, non credi?»', maxParole: 8 }),
    testo({
      name: 'sottotitolo',
      title: 'Sottotitolo',
      description: 'Il paragrafo sotto il titolo. Es. «Impegni concreti che mettiamo per iscritto, …»',
      righe: 2,
      maxFrasi: 2,
    }),
    defineField({
      name: 'garanzie',
      title: 'Garanzie',
      type: 'array',
      description: 'Le card con il timbro, da 3 a 6. Scrivi solo impegni che puoi mantenere. Trascinale per cambiare l’ordine.',
      validation: (rule) => [
        quantita(3, 6, 'garanzie')(rule),
        rule
          .custom((v: unknown) =>
            JSON.stringify(v ?? '').includes('[N]') ? 'Alcune garanzie contengono ancora «[N]»: sostituiscilo con il numero reale.' : true,
          )
          .warning(),
      ],
      of: [
        defineArrayMember({
          type: 'object',
          name: 'garanzia',
          title: 'Garanzia',
          fields: [
            testo({ name: 'titolo', title: 'Titolo', description: 'Es. «Revisioni incluse».', maxParole: 6 }),
            testo({ name: 'testo', title: 'Testo', description: 'Es. «2 giri di modifiche compresi nel prezzo, …»', righe: 3, maxFrasi: 2 }),
          ],
          preview: { select: { title: 'titolo', subtitle: 'testo' } },
        }),
      ],
    }),
    testo({
      name: 'sigillo',
      title: 'Scritta del sigillo',
      description: 'Il testo che gira intorno allo scudo, ripetuto due volte. Separa le parti con una virgola. Es. «Garanzia MoveOn Studio, scelta sicura».',
      max: 40,
    }),
  ],
  preview: singolo('Le nostre garanzie'),
});

/* ============ CONTATTI ============ */
export const contatti = defineType({
  name: 'contatti',
  title: 'Contatti',
  type: 'document',
  icon: CommentIcon,
  fields: [
    etichettaSezione('Contatti'),
    testo({
      name: 'titolo',
      title: 'Titolo',
      description: 'Il titolo grande bianco. Va a capo dove premi Invio. Es. «Parliamo del / tuo progetto.»',
      righe: 2,
      maxParole: 8,
    }),
    testo({
      name: 'testo',
      title: 'Testo',
      description: 'Il paragrafo sotto il titolo. Es. «Raccontaci la tua idea: ti diciamo come darle forma, con tempi e costi chiari.»',
      righe: 2,
      maxFrasi: 2,
    }),
    immagine({
      name: 'foto',
      title: 'Foto',
      description: 'Foto verticale in formato 4:5, accanto al titolo.',
      minLarghezza: 800,
      esempioAlt: 'Un personaggio viola e peloso legge un libro seduto su una poltrona azzurra',
    }),
    testo({
      name: 'bollino',
      title: 'Scritta del bollino rotante',
      description: 'Il testo che gira nel bollino blu sulla foto, ripetuto due volte. Es. «Raccontaci la tua idea».',
      max: 24,
    }),
    defineField({
      name: 'opzioni',
      title: 'Voci di «Di cosa hai bisogno?»',
      type: 'array',
      description: 'Le opzioni del menu a tendina nel modulo. Trascinale per cambiare l’ordine. Conviene lasciare per ultima «Non lo so ancora, consigliatemi».',
      of: [defineArrayMember({ type: 'string' })],
      validation: (rule) => rule.min(2).error('Servono almeno due opzioni.'),
    }),
    testo({
      name: 'titoloPulsanti',
      title: 'Titolo dei pulsanti',
      description: 'Il titolo sopra i pulsanti Chiamaci, Chatta, Scrivici. Es. «Preferisci parlarci subito?»',
      maxParole: 6,
    }),
    testo({
      name: 'conferma',
      title: 'Messaggio di conferma',
      description: 'Mostrato dopo l’invio del modulo, sotto «Grazie, [nome]!». Es. «Ti ricontattiamo al più presto.»',
      righe: 2,
      maxFrasi: 2,
    }),
  ],
  preview: singolo('Contatti'),
});

export const BLOCCHI_TIPI = [hero, nastro, chiSiamo, pausa, servizi, portfolio, garanzie, contatti];

// Icone per il menu del pannello
export const ICONE_BLOCCHI: Record<string, typeof StarIcon> = {
  hero: StarIcon,
  nastro: ThListIcon,
  chiSiamo: UsersIcon,
  pausa: ImageIcon,
  servizi: BlockElementIcon,
  portfolio: ProjectsIcon,
  garanzie: CheckmarkCircleIcon,
  contatti: CommentIcon,
};

