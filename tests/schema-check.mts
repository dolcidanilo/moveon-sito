/*
 * Controlli sul pannello Sanity che non hanno bisogno di rete:
 * 1) lo schema (campi del pannello) è valido secondo Sanity;
 * 2) i documenti creati da "Importa contenuti iniziali" usano solo campi che esistono nel pannello
 *    e rispettano i valori ammessi (es. colori, aree).
 * Uso: npx tsx tests/schema-check.mts
 */
import { groupProblems, validateSchema } from '@sanity/schema/_internal';
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

process.exit(errori ? 1 : 0);
