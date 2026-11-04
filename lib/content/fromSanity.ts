import { createImageUrlBuilder } from '@sanity/image-url';
import { stegaClean } from 'next-sanity';
import { dataset, projectId } from '@/sanity/env';
import { seed } from './seed';
import type { Block, BlockType, Img, Progetto, Settings, SiteContent } from './types';

/*
 * Converte le schede del pannello Sanity nel modello dei contenuti del sito (types.ts).
 * Regola: se una scheda esiste nel pannello, il sito usa i suoi valori; se manca del tutto
 * (es. prima dell'importazione), usa quella dei contenuti iniziali.
 *
 * Nell'anteprima i testi contengono caratteri invisibili (stega) per il clic-per-modificare:
 * i valori che il codice confronta o usa come indirizzi vengono ripuliti con `c()`.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = Record<string, any>;

const builder = createImageUrlBuilder({ projectId, dataset });
const c = <T,>(v: T): T => stegaClean(v) as T;
const s = (v: unknown) => (typeof v === 'string' ? v : '');
const arr = <T = Raw,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const clamp = (n: number) => Math.min(1, Math.max(0, n));

/** Immagine del pannello → { url ottimizzato, alt, dimensioni, punto focale }. */
export function toImg(i: Raw | undefined, maxW: number): Img | undefined {
  const ref: string | undefined = i?.asset?._ref;
  const m = ref ? /^image-([a-zA-Z0-9]+)-(\d+)x(\d+)-(\w+)$/.exec(ref) : null;
  if (!i || !m) return undefined;
  const [, id, W, H, ext] = m;
  let width = +W;
  let height = +H;
  let hotspot = i.hotspot ? { x: i.hotspot.x, y: i.hotspot.y } : undefined;
  const alt = c(s(i.alt));
  // SVG (es. il logo): file originale, resta vettoriale e nitido a ogni dimensione
  if (ext === 'svg') return { url: `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${W}x${H}.svg`, alt, width, height, hotspot };
  const crop = i.crop;
  if (crop) {
    const cw = 1 - (crop.left ?? 0) - (crop.right ?? 0);
    const ch = 1 - (crop.top ?? 0) - (crop.bottom ?? 0);
    width = Math.round(width * cw);
    height = Math.round(height * ch);
    if (hotspot) hotspot = { x: clamp((hotspot.x - (crop.left ?? 0)) / cw), y: clamp((hotspot.y - (crop.top ?? 0)) / ch) };
  }
  const outW = Math.min(maxW, width);
  return {
    url: builder.image(i).width(outW).fit('max').auto('format').quality(82).url(),
    alt,
    width: outW,
    height: Math.round((height * outW) / width),
    hotspot,
  };
}

const link = (v: Raw | undefined) => (v ? { testo: s(v.testo), blocco: c(v.blocco) as BlockType } : undefined);

function settingsFrom(d: Raw | undefined): Settings {
  if (!d) return seed.settings;
  return {
    logoChiaro: toImg(d.logoChiaro, 900) ?? seed.settings.logoChiaro,
    logoScuro: toImg(d.logoScuro, 900) ?? seed.settings.logoScuro,
    telefono: c(s(d.telefono)),
    whatsapp: c(s(d.whatsapp)),
    email: c(s(d.email)),
    headerCta: s(d.headerCta),
    mobileCta: s(d.mobileCta),
    menu: arr(d.menu).map((m) => ({ testo: s(m.testo), blocco: c(m.blocco) as BlockType })),
    footerClaim: s(d.footerClaim),
    datiLegali: s(d.datiLegali),
    privacyUrl: c(s(d.privacyUrl)),
    cookieUrl: c(s(d.cookieUrl)) || undefined,
    seoTitolo: c(s(d.seoTitolo)),
    seoDescrizione: c(s(d.seoDescrizione)),
    immagineCondivisione: d.immagineCondivisione?.asset
      ? { ...toImg(d.immagineCondivisione, 1200)!, url: builder.image(d.immagineCondivisione).width(1200).height(630).fit('crop').auto('format').url() }
      : undefined,
  };
}

function blockFrom(type: BlockType, d: Raw, visibile: boolean): Block {
  const base = { _key: type, visibile };
  switch (type) {
    case 'hero':
      return { ...base, _type: 'hero', titolo: s(d.titolo), parolaEvidenziata: c(s(d.parolaEvidenziata)) || undefined, testo: s(d.testo), pulsante: link(d.pulsante) };
    case 'nastro': {
      const riga = (r: unknown) => arr(r).map((w) => ({ testo: s(w.testo), stile: c(w.stile) || 'navy' }));
      return { ...base, _type: 'nastro', riga1: riga(d.riga1), riga2: riga(d.riga2), foto: toImg(d.foto, 1600) ?? (seed.blocks.find((b) => b._type === 'nastro') as any).foto };
    }
    case 'chiSiamo':
      return {
        ...base,
        _type: 'chiSiamo',
        etichetta: s(d.etichetta),
        numero: c(s(d.numero)),
        fotoNumero: toImg(d.fotoNumero, 1600) ?? (seed.blocks.find((b) => b._type === 'chiSiamo') as any).fotoNumero,
        fraseNumero: s(d.fraseNumero),
        manifesto: s(d.manifesto),
        ideaTitolo: s(d.ideaTitolo),
        ideaTesto: s(d.ideaTesto),
        ideaImmagine: toImg(d.ideaImmagine, 1200),
        ideaPassi: { da: s(d.ideaPassi?.da), a: s(d.ideaPassi?.a) },
        motiviTitolo: s(d.motiviTitolo),
        motivi: arr(d.motivi).map((m) => ({ _key: m._key, titolo: s(m.titolo), testo: s(m.testo), icona: c(m.icona) || 'stella', etichette: arr<string>(m.etichette) })),
        chiusura: s(d.chiusura),
        link: d.link ? { testo: s(d.link.testo), resto: s(d.link.resto), blocco: c(d.link.blocco) } : undefined,
      };
    case 'pausa':
      return { ...base, _type: 'pausa', foto: toImg(d.foto, 2400) ?? (seed.blocks.find((b) => b._type === 'pausa') as any).foto, frase: s(d.frase) };
    case 'servizi':
      return {
        ...base,
        _type: 'servizi',
        etichetta: s(d.etichetta),
        apertura: s(d.apertura),
        servizi: arr(d.servizi).map((x) => ({
          _key: x._key,
          nome: s(x.nome),
          beneficio: s(x.beneficio),
          voci: arr<string>(x.voci),
          immagine: toImg(x.immagine, 1000),
          parolaSfondo: s(x.parolaSfondo),
          colore: c(x.colore) || 'bianco',
          illustrazione: c(x.illustrazione) || 'identita',
        })),
        finale: { frase: s(d.finale?.frase), pulsante: link(d.finale?.pulsante) },
      };
    case 'portfolio':
      return { ...base, _type: 'portfolio', etichetta: s(d.etichetta), titolo: s(d.titolo), istruzioni: s(d.istruzioni), modalita: c(d.modalita) === 'ordine' ? 'ordine' : 'tavolo' };
    case 'garanzie':
      return {
        ...base,
        _type: 'garanzie',
        etichetta: s(d.etichetta),
        titolo: s(d.titolo),
        sottotitolo: s(d.sottotitolo),
        garanzie: arr(d.garanzie).map((g) => ({ _key: g._key, titolo: s(g.titolo), testo: s(g.testo) })),
        sigillo: c(s(d.sigillo)),
      };
    case 'contatti':
      return {
        ...base,
        _type: 'contatti',
        etichetta: s(d.etichetta),
        titolo: s(d.titolo),
        testo: s(d.testo),
        foto: toImg(d.foto, 1000) ?? (seed.blocks.find((b) => b._type === 'contatti') as any).foto,
        bollino: c(s(d.bollino)),
        opzioni: arr<string>(d.opzioni).map((o) => c(o)),
        titoloPulsanti: s(d.titoloPulsanti),
        conferma: s(d.conferma),
      };
  }
}

function progettoFrom(d: Raw): Progetto {
  return {
    _id: d._id,
    nome: s(d.nome),
    area: (c(d.area) || 'branding') as Progetto['area'],
    tipo: s(d.tipo),
    copertina: toImg(d.copertina, 1200) ?? { url: '/seed/portfolio-forno-aurora.svg', alt: '', width: 1200, height: 900 },
    galleria: arr(d.galleria).map((g) => toImg(g, 1600)).filter((g): g is Img => !!g),
    richiesta: s(d.richiesta),
    lavoro: s(d.lavoro),
    risultato: s(d.risultato),
  };
}

const TIPI: BlockType[] = ['hero', 'nastro', 'chiSiamo', 'pausa', 'servizi', 'portfolio', 'garanzie', 'contatti'];

/** Risultato della query SITE_QUERY → contenuti del sito. */
export function contentFromSanity(data: { docs?: Raw[]; progetti?: Raw[] } | null): SiteContent {
  // Pannello ancora vuoto (prima dell'importazione): tutto dai contenuti iniziali
  if (!arr(data?.docs).length && !arr(data?.progetti).length) return seed;
  const docs = new Map(arr(data?.docs).map((d) => [String(d._id).replace(/^drafts\./, ''), d]));
  const pagina = docs.get('pagina');

  // Ordine e visibilità: dalla scheda "Ordine e visibilità dei blocchi"; i blocchi non elencati restano nascosti
  const ordine: { blocco: BlockType; visibile: boolean }[] = pagina
    ? arr(pagina.blocchi)
        .map((v) => ({ blocco: c(v.blocco) as BlockType, visibile: v.visibile !== false }))
        .filter((v) => TIPI.includes(v.blocco))
    : seed.blocks.map((b) => ({ blocco: b._type, visibile: b.visibile }));
  for (const t of TIPI) if (!ordine.some((o) => o.blocco === t)) ordine.push({ blocco: t, visibile: false });

  const blocks = ordine.map(({ blocco, visibile }) => {
    const d = docs.get(blocco);
    if (!d) {
      const fallback = seed.blocks.find((b) => b._type === blocco)!;
      return { ...fallback, visibile: pagina ? visibile : fallback.visibile };
    }
    return blockFrom(blocco, d, visibile);
  });

  const progetti = data?.progetti ? arr(data.progetti).map(progettoFrom) : seed.progetti;

  return { settings: settingsFrom(docs.get('impostazioni')), blocks, progetti };
}
