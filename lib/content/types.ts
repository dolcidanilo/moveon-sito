/*
 * Modello dei contenuti del sito.
 * Rispecchia il "Modello dei contenuti in Sanity" del documento di consegna:
 * nella Fase 2 ogni campo qui sotto diventa un campo del pannello, con la stessa forma.
 */

/** Immagine con testo alternativo e punto focale (0–1, come l'hotspot di Sanity). */
export type Img = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  hotspot?: { x: number; y: number };
};

/** I blocchi della pagina, usati anche come destinazione di menu e pulsanti. */
export type BlockType =
  | 'hero'
  | 'nastro'
  | 'chiSiamo'
  | 'pausa'
  | 'servizi'
  | 'portfolio'
  | 'garanzie'
  | 'contatti';

export type Link = { testo: string; blocco: BlockType };

export type Settings = {
  logoChiaro: Img;
  logoScuro: Img;
  telefono: string;
  whatsapp: string;
  email: string;
  headerCta: string;
  mobileCta: string;
  menu: Link[];
  footerClaim: string;
  datiLegali: string;
  privacyUrl: string;
  cookieUrl?: string;
  seoTitolo: string;
  seoDescrizione: string;
  immagineCondivisione?: Img;
};

type Base = { _key: string; visibile: boolean };

export type HeroBlock = Base & {
  _type: 'hero';
  /** Un a capo nel testo = una nuova riga del titolo. */
  titolo: string;
  parolaEvidenziata?: string;
  testo: string;
  pulsante?: Link;
};

export type StileParola = 'navy' | 'blu' | 'bluChiaro' | 'foto';
export type NastroBlock = Base & {
  _type: 'nastro';
  riga1: { testo: string; stile: StileParola }[];
  riga2: { testo: string; stile: StileParola }[];
  foto: Img;
};

export type Icona =
  | 'orologio'
  | 'bussola'
  | 'rete'
  | 'scatola'
  | 'lampadina'
  | 'stella'
  | 'cuore'
  | 'grafico';

export type ChiSiamoBlock = Base & {
  _type: 'chiSiamo';
  etichetta: string;
  numero: string;
  fotoNumero: Img;
  fraseNumero: string;
  manifesto: string;
  ideaTitolo: string;
  ideaTesto: string;
  ideaImmagine?: Img;
  ideaPassi: { da: string; a: string };
  motiviTitolo: string;
  motivi: { _key: string; titolo: string; testo: string; icona: Icona; etichette?: string[] }[];
  chiusura: string;
  link?: { testo: string; resto: string; blocco: BlockType };
};

export type PausaBlock = Base & {
  _type: 'pausa';
  foto: Img;
  /** Un a capo nel testo = una nuova riga. */
  frase: string;
};

export type ColoreScheda = 'bianco' | 'grigio' | 'blu' | 'navy';
export type Illustrazione = 'identita' | 'web' | 'social' | 'app' | 'rete' | 'formazione';

export type ServiziBlock = Base & {
  _type: 'servizi';
  etichetta: string;
  apertura: string;
  servizi: {
    _key: string;
    nome: string;
    beneficio: string;
    voci: string[];
    immagine?: Img;
    parolaSfondo: string;
    colore: ColoreScheda;
    illustrazione: Illustrazione;
  }[];
  finale: { frase: string; pulsante?: Link };
};

export type Area = 'branding' | 'web' | 'social' | 'stampa';

export type Progetto = {
  _id: string;
  nome: string;
  area: Area;
  tipo: string;
  copertina: Img;
  galleria?: Img[];
  richiesta: string;
  lavoro: string;
  risultato: string;
};

export type PortfolioBlock = Base & {
  _type: 'portfolio';
  etichetta: string;
  titolo: string;
  istruzioni: string;
  modalita: 'tavolo' | 'ordine';
};

export type GaranzieBlock = Base & {
  _type: 'garanzie';
  etichetta: string;
  titolo: string;
  sottotitolo: string;
  garanzie: { _key: string; titolo: string; testo: string }[];
  sigillo: string;
};

export type ContattiBlock = Base & {
  _type: 'contatti';
  etichetta: string;
  /** Un a capo nel testo = una nuova riga. */
  titolo: string;
  testo: string;
  foto: Img;
  bollino: string;
  opzioni: string[];
  titoloPulsanti: string;
  conferma: string;
};

export type Block =
  | HeroBlock
  | NastroBlock
  | ChiSiamoBlock
  | PausaBlock
  | ServiziBlock
  | PortfolioBlock
  | GaranzieBlock
  | ContattiBlock;

export type SiteContent = {
  settings: Settings;
  blocks: Block[];
  /** Solo i progetti "In evidenza", già nell'ordine scelto. */
  progetti: Progetto[];
};
