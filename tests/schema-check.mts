/*
 * Controlli sul pannello Sanity che non hanno bisogno di rete:
 * 1) lo schema (campi del pannello) è valido secondo Sanity;
 * 2) i documenti creati da "Importa contenuti iniziali" usano solo campi che esistono nel pannello
 *    e rispettano i valori ammessi (es. colori, aree).
 * 3) i contenuti letti dal pannello (query vera, eseguita con groq-js) ricostruiscono il sito identico
 *    ai contenuti iniziali, e ordine/visibilità/progetti in evidenza vengono rispettati.
 * Uso: npx tsx tests/schema-check.mts
 */
import { groupProblems, validateSchema } from '@sanity/schema/_internal';
import { evaluate, parse } from 'groq-js';
import { contentFromSanity } from '../lib/content/fromSanity';
import { SINGOLI, SITE_QUERY } from '../sanity/queries';
import { seed } from '../lib/content/seed';
import { documentiDaSeed } from '../sanity/import/fromSeed';
import { schemaTypes } from '../sanity/schemaTypes';

let errori = 0;
const ko = (m: string) => { errori++; console.log(`✘ ${m}`); };

// 1) Schema
const problemi = groupProblems(validateSchema(schemaTypes as never).getTypes());
for (const g of problemi) {
  for (const p of g.problems) {
    const where = g.path.map((x: { name?: string; type?: string }) => x.name ?? x.type).join(' › ');
    if (p.severity === 'error') ko(`Schema: ${where}: ${p.message}`);
    else console.log(`! Schema (avviso): ${where}: ${p.message}`);
  }
}
if (!errori) console.log('✔ Schema del pannello valido');

// 2) Documenti dell'importazione
type F = { name: string; type: string; fields?: F[]; of?: F[]; options?: { list?: ({ value: string } | string)[] } };
const tipi = new Map<string, F>((schemaTypes as unknown as F[]).map((t) => [t.name, t]));
const SISTEMA = new Set(['_id', '_type', '_key', '_ref', 'asset', 'hotspot', 'crop']);

function verifica(val: unknown, def: F | undefined, path: string) {
  if (val == null || !def) return;
  const ammessi = def.options?.list?.map((x) => (typeof x === 'string' ? x : x.value));
  if (ammessi && typeof val === 'string' && !ammessi.includes(val)) ko(`${path}: valore «${val}» non ammesso (${ammessi.join(', ')})`);
  if (Array.isArray(val)) {
    val.forEach((item, i) => {
      const t = (item as { _type?: string })?._type;
      const member = def.of?.find((m) => (t ? m.name === t || m.type === t : true)) ?? def.of?.[0];
      if (typeof item === 'object' && !(item as { _key?: string })._key) ko(`${path}[${i}]: manca _key`);
      verifica(item, member, `${path}[${i}]`);
    });
    return;
  }
  if (typeof val === 'object') {
    const campi = def.fields ?? tipi.get(def.type)?.fields ?? [];
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      if (SISTEMA.has(k)) continue;
      const f = campi.find((c) => c.name === k);
      if (!f) ko(`${path}.${k}: campo inesistente nel pannello`);
      else verifica(v, f, `${path}.${k}`);
    }
  }
}

const docs = await documentiDaSeed(seed, async (url) => `image-${url.length.toString(16)}abc-100x100-${url.split('.').pop()}`);
const prima = errori;
for (const d of docs) verifica(d, tipi.get(d._type), d._id);
const singoli = ['impostazioni', 'pagina', 'hero', 'nastro', 'chiSiamo', 'pausa', 'servizi', 'portfolio', 'garanzie', 'contatti'];
for (const id of singoli) if (!docs.some((d) => d._id === id)) ko(`Importazione: manca la scheda ${id}`);
if (docs.filter((d) => d._type === 'progetto').length !== seed.progetti.length) ko('Importazione: numero di progetti diverso dal prototipo');
if (errori === prima) console.log(`✔ Importazione: ${docs.length} schede, tutte con campi validi`);

// 3) Lettura dal pannello → contenuti del sito
async function leggi(dataset: unknown[]) {
  const r = await evaluate(parse(SITE_QUERY), { dataset, params: { singoli: SINGOLI } });
  return contentFromSanity((await r.get()) as never);
}
// Confronto senza indirizzi delle immagini (cambiano: ora vengono dal CDN), senza _key e con le proprietà in ordine alfabetico
const ordina = (v: unknown): unknown =>
  Array.isArray(v) ? v.map(ordina) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, ordina((v as any)[k])])) : v;
const senzaImmagini = (x: unknown) =>
  ordina(JSON.parse(JSON.stringify(x, (k, v) => (v && typeof v === 'object' && 'url' in v && 'alt' in v ? { alt: v.alt } : k === '_key' || k === '_id' || (Array.isArray(v) && !v.length) ? undefined : v))));
const p3 = errori;
const letto = await leggi(docs);
const a = JSON.stringify(senzaImmagini(letto)), b = JSON.stringify(senzaImmagini(seed));
if (a !== b) {
  ko('Lettura: i contenuti letti dal pannello non coincidono con quelli iniziali');
  const la = JSON.stringify(senzaImmagini(letto), null, 1).split('\n'), lb = JSON.stringify(senzaImmagini(seed), null, 1).split('\n');
  const i = la.findIndex((l, k) => l !== lb[k]);
  console.log('   prima differenza:', la.slice(i - 2, i + 2).join(' '), ' ≠ ', lb.slice(i - 2, i + 2).join(' '));
}
const urls = JSON.stringify(letto).match(/https:\/\/cdn\.sanity\.io\/images\/vs8r2mfn\/production\/[^"]+/g) ?? [];
if (urls.length < 10) ko(`Lettura: poche immagini dal CDN di Sanity (${urls.length})`);
// ordine, visibilità e progetti in evidenza
const mod = structuredClone(docs) as any[];
const pag = mod.find((d) => d._id === 'pagina');
pag.blocchi.reverse();
pag.blocchi.find((v: any) => v.blocco === 'nastro').visibile = false;
mod.find((d) => d._id === 'progetto-fitlab').inEvidenza = false;
const l2 = await leggi(mod);
if (l2.blocks[0]._type !== 'contatti') ko('Lettura: ordine dei blocchi non rispettato');
if (l2.blocks.find((x) => x._type === 'nastro')?.visibile !== false) ko('Lettura: blocco nascosto ancora visibile');
if (l2.progetti.some((p) => p._id === 'progetto-fitlab') || l2.progetti.length !== seed.progetti.length - 1) ko('Lettura: progetto non in evidenza ancora mostrato');
const ordine = l2.progetti.map((p) => p.nome).join(',');
if (ordine !== seed.progetti.filter((p) => p._id !== 'fitlab').map((p) => p.nome).join(',')) ko('Lettura: ordine dei progetti diverso da quello dell’elenco');
if (errori === p3) console.log(`✔ Lettura dal pannello: sito identico ai contenuti iniziali, ${urls.length} immagini dal CDN, ordine/visibilità/evidenza rispettati`);

process.exit(errori ? 1 : 0);
