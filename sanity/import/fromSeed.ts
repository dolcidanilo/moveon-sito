import { LexoRank } from 'lexorank';
import type { Img, SiteContent } from '@/lib/content/types';

/* Converte i contenuti iniziali (lib/content/seed.ts) nei documenti del pannello Sanity. */

export type Carica = (url: string) => Promise<string>;
type Doc = { _id: string; _type: string; [k: string]: unknown };

const chiave = (() => {
  let n = 0;
  return (p = 'k') => `${p}${(n++).toString(36)}${Math.random().toString(36).slice(2, 7)}`;
})();

async function img(i: Img | undefined, carica: Carica) {
  if (!i) return undefined;
  const ref = await carica(i.url);
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: ref },
    alt: i.alt,
    ...(i.hotspot ? { hotspot: { _type: 'sanity.imageHotspot', x: i.hotspot.x, y: i.hotspot.y, width: 0.5, height: 0.5 } } : {}),
  };
}

export async function documentiDaSeed(seed: SiteContent, carica: Carica): Promise<Doc[]> {
  const s = seed.settings;
  const docs: Doc[] = [];

  docs.push({
    _id: 'impostazioni',
    _type: 'impostazioni',
    logoChiaro: await img(s.logoChiaro, carica),
    logoScuro: await img(s.logoScuro, carica),
    telefono: s.telefono,
    whatsapp: s.whatsapp,
    email: s.email,
    headerCta: s.headerCta,
    mobileCta: s.mobileCta,
    menu: s.menu.map((m) => ({ _key: chiave('m'), _type: 'voceMenu', testo: m.testo, blocco: m.blocco })),
    footerClaim: s.footerClaim,
    datiLegali: s.datiLegali,
    privacyUrl: s.privacyUrl,
    cookieUrl: s.cookieUrl,
    seoTitolo: s.seoTitolo,
    seoDescrizione: s.seoDescrizione,
  });

  docs.push({
    _id: 'pagina',
    _type: 'pagina',
    blocchi: seed.blocks.map((b) => ({ _key: b._type, _type: 'voceBlocco', blocco: b._type, visibile: b.visibile })),
  });

  for (const b of seed.blocks) {
    switch (b._type) {
      case 'hero':
        docs.push({ _id: 'hero', _type: 'hero', titolo: b.titolo, parolaEvidenziata: b.parolaEvidenziata, testo: b.testo, pulsante: b.pulsante });
        break;
      case 'nastro': {
        const riga = (r: typeof b.riga1) => r.map((w) => ({ _key: chiave('w'), _type: 'parola', testo: w.testo, stile: w.stile }));
        docs.push({ _id: 'nastro', _type: 'nastro', riga1: riga(b.riga1), riga2: riga(b.riga2), foto: await img(b.foto, carica) });
        break;
      }
      case 'chiSiamo':
        docs.push({
          _id: 'chiSiamo',
          _type: 'chiSiamo',
          etichetta: b.etichetta,
          numero: b.numero,
          fotoNumero: await img(b.fotoNumero, carica),
          fraseNumero: b.fraseNumero,
          manifesto: b.manifesto,
          ideaTitolo: b.ideaTitolo,
          ideaTesto: b.ideaTesto,
          ideaPassi: b.ideaPassi,
          ideaImmagine: await img(b.ideaImmagine, carica),
          motiviTitolo: b.motiviTitolo,
          motivi: b.motivi.map((m) => ({ _key: m._key, _type: 'motivo', titolo: m.titolo, testo: m.testo, icona: m.icona, etichette: m.etichette ?? [] })),
          chiusura: b.chiusura,
          link: b.link,
        });
        break;
      case 'pausa':
        docs.push({ _id: 'pausa', _type: 'pausa', foto: await img(b.foto, carica), frase: b.frase });
        break;
      case 'servizi': {
        const servizi = [];
        for (const x of b.servizi) {
          servizi.push({
            _key: x._key,
            _type: 'servizio',
            nome: x.nome,
            beneficio: x.beneficio,
            voci: x.voci,
            immagine: await img(x.immagine, carica),
            illustrazione: x.illustrazione,
            parolaSfondo: x.parolaSfondo,
            colore: x.colore,
          });
        }
        docs.push({ _id: 'servizi', _type: 'servizi', etichetta: b.etichetta, apertura: b.apertura, servizi, finale: b.finale });
        break;
      }
      case 'portfolio':
        docs.push({ _id: 'portfolio', _type: 'portfolio', etichetta: b.etichetta, titolo: b.titolo, istruzioni: b.istruzioni, modalita: b.modalita });
        break;
      case 'garanzie':
        docs.push({
          _id: 'garanzie',
          _type: 'garanzie',
          etichetta: b.etichetta,
          titolo: b.titolo,
          sottotitolo: b.sottotitolo,
          garanzie: b.garanzie.map((g) => ({ _key: g._key, _type: 'garanzia', titolo: g.titolo, testo: g.testo })),
          sigillo: b.sigillo,
        });
        break;
      case 'contatti':
        docs.push({
          _id: 'contatti',
          _type: 'contatti',
          etichetta: b.etichetta,
          titolo: b.titolo,
          testo: b.testo,
          foto: await img(b.foto, carica),
          bollino: b.bollino,
          opzioni: b.opzioni,
          titoloPulsanti: b.titoloPulsanti,
          conferma: b.conferma,
        });
        break;
    }
  }

  let rank = LexoRank.min();
  for (const p of seed.progetti) {
    rank = rank.genNext().genNext();
    const galleria = [];
    for (const g of p.galleria ?? []) galleria.push({ _key: chiave('g'), ...(await img(g, carica)) });
    docs.push({
      _id: `progetto-${p._id}`,
      _type: 'progetto',
      orderRank: rank.toString(),
      nome: p.nome,
      area: p.area,
      tipo: p.tipo,
      inEvidenza: true,
      copertina: await img(p.copertina, carica),
      galleria,
      richiesta: p.richiesta,
      lavoro: p.lavoro,
      risultato: p.risultato,
    });
  }

  // Niente campi vuoti: Sanity non ama i valori undefined
  return docs.map((d) => JSON.parse(JSON.stringify(d)));
}
