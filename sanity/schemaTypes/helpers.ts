import { defineArrayMember, defineField, type Rule } from 'sanity';
import { ContatoreInput } from '../components/inputs';

/* Mattoncini comuni a tutti i campi del pannello: testi con contatore e avvisi gentili,
   immagini con testo alternativo obbligatorio e punto focale, scelta del blocco di destinazione. */

export const contaParole = (s?: string) => (s ?? '').trim().split(/\s+/).filter(Boolean).length;
export const contaFrasi = (s?: string) => (s ?? '').split(/[.!?]+(?:\s|$)/).map((x) => x.trim()).filter(Boolean).length;

type Limiti = { max?: number; maxParole?: number; maxFrasi?: number };

/** Avvisi (non bloccanti) quando si superano i limiti del Design System. */
function avvisiLimiti(rule: Rule, l: Limiti, obbligatorio: boolean) {
  const list: Rule[] = [];
  if (obbligatorio) list.push(rule.required().error('Questo campo non può restare vuoto.'));
  list.push(
    rule
      .custom((v: unknown) => {
        const s = typeof v === 'string' ? v : '';
        if (l.max && s.length > l.max) return `Consigliati al massimo ${l.max} caratteri: ora sono ${s.length}.`;
        if (l.maxParole && contaParole(s) > l.maxParole) return `Consigliate al massimo ${l.maxParole} parole: ora sono ${contaParole(s)}.`;
        if (l.maxFrasi && contaFrasi(s) > l.maxFrasi) return `Consigliate al massimo ${l.maxFrasi} frasi: ora sono ${contaFrasi(s)}.`;
        return true;
      })
      .warning(),
  );
  return list;
}

type TestoOpts = Limiti & {
  name: string;
  title: string;
  description: string;
  /** Testo su più righe (area di testo). */
  righe?: number;
  obbligatorio?: boolean;
  group?: string;
  fieldset?: string;
  initialValue?: string;
};

/** Campo di testo con spiegazione, contatore e avviso sui limiti. */
export function testo(o: TestoOpts) {
  const limiti = { max: o.max, maxParole: o.maxParole, maxFrasi: o.maxFrasi };
  return defineField({
    name: o.name,
    title: o.title,
    description: o.description,
    type: o.righe ? 'text' : 'string',
    ...(o.righe ? { rows: o.righe } : {}),
    group: o.group,
    fieldset: o.fieldset,
    initialValue: o.initialValue,
    options: limiti as never,
    components: o.max || o.maxParole || o.maxFrasi ? { input: ContatoreInput } : undefined,
    validation: (rule: Rule) => avvisiLimiti(rule, limiti, o.obbligatorio !== false),
  } as never);
}

type ImmagineOpts = {
  name: string;
  title: string;
  description: string;
  /** Larghezza minima consigliata in pixel. */
  minLarghezza?: number;
  obbligatoria?: boolean;
  accetta?: string;
  group?: string;
  esempioAlt?: string;
};

/** Dimensioni dall'identificativo dell'immagine di Sanity, es. image-abc-1920x954-jpg. */
const dimensioni = (ref?: string) => {
  const m = /-(\d+)x(\d+)-/.exec(ref ?? '');
  return m ? { w: +m[1], h: +m[2] } : null;
};

/** Immagine con ritaglio e punto focale, testo alternativo obbligatorio e dimensione minima consigliata. */
export function immagine(o: ImmagineOpts) {
  return defineField({
    name: o.name,
    title: o.title,
    description: `${o.description}${o.minLarghezza ? ` Larghezza consigliata: almeno ${o.minLarghezza} px.` : ''}`,
    type: 'image',
    group: o.group,
    options: { hotspot: true, accept: o.accetta ?? 'image/jpeg,image/png,image/webp,image/svg+xml' },
    fields: [
      {
        name: 'alt',
        title: 'Testo alternativo',
        type: 'string',
        description: `Descrivi la foto a chi non può vederla (lo leggono i lettori di schermo e Google).${o.esempioAlt ? ` Es. «${o.esempioAlt}»` : ''}`,
        validation: (rule: Rule) => rule.required().error('Descrivi la foto: serve a chi non può vederla.'),
      },
    ],
    validation: (rule: Rule) => {
      const list: Rule[] = [];
      if (o.obbligatoria !== false) list.push(rule.required().error('Carica un’immagine.'));
      if (o.minLarghezza) {
        list.push(
          rule
            .custom((v: unknown) => {
              const d = dimensioni((v as { asset?: { _ref?: string } } | undefined)?.asset?._ref);
              if (!d || /-svg$/.test((v as { asset?: { _ref?: string } }).asset?._ref ?? '')) return true;
              return d.w < o.minLarghezza!
                ? `L’immagine è larga ${d.w} px: per una resa nitida ne servono almeno ${o.minLarghezza}.`
                : true;
            })
            .warning(),
        );
      }
      return list;
    },
  } as never);
}

/** I blocchi della pagina, come destinazione di menu e pulsanti. */
export const BLOCCHI = [
  { title: 'Hero (inizio pagina)', value: 'hero' },
  { title: 'Nastro parole chiave', value: 'nastro' },
  { title: 'Chi siamo', value: 'chiSiamo' },
  { title: 'Pausa emozionale', value: 'pausa' },
  { title: 'Servizi', value: 'servizi' },
  { title: 'Portfolio', value: 'portfolio' },
  { title: 'Le nostre garanzie', value: 'garanzie' },
  { title: 'Contatti', value: 'contatti' },
];
export const nomeBlocco = (v?: string) => BLOCCHI.find((b) => b.value === v)?.title ?? v ?? '';

export function portaA(name = 'blocco', title = 'Porta a', description = 'Il blocco della pagina che si apre cliccando.') {
  return defineField({
    name,
    title,
    description,
    type: 'string',
    options: { list: BLOCCHI },
    validation: (rule) => rule.required().error('Scegli il blocco a cui portare.'),
  });
}

/** Pulsante: testo + blocco a cui porta. */
export function pulsante(name: string, title: string, description: string, esempio: string) {
  return defineField({
    name,
    title,
    description,
    type: 'object',
    options: { collapsible: false },
    fields: [
      testo({ name: 'testo', title: 'Testo del pulsante', description: `Verbo all’imperativo + oggetto, es. «${esempio}».`, maxParole: 3 }),
      portaA(),
    ],
  });
}

/** Elenco di etichette brevi (es. voci incluse in un servizio). */
export function etichette(name: string, title: string, description: string, obbligatorio = false) {
  return defineField({
    name,
    title,
    description,
    type: 'array',
    of: [defineArrayMember({ type: 'string' })],
    options: { layout: 'tags' },
    validation: obbligatorio ? (rule) => rule.min(1).error('Aggiungi almeno una voce.') : undefined,
  });
}

/** Piccolo titolo blu in maiuscolo sopra ogni sezione. */
export const etichettaSezione = (esempio: string, group?: string) =>
  testo({
    group,
    name: 'etichetta',
    title: 'Etichetta in alto',
    description: `Il piccolo titolo blu in maiuscolo sopra la sezione, es. «${esempio}». Si scrive normale: il maiuscolo lo mette il sito.`,
    maxParole: 4,
  });

/** Avviso gentile sul numero consigliato di elementi in un elenco. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const quantita = (min: number, max: number, cosa: string) => (rule: any) =>
  rule
    .custom((v: unknown) => {
      const n = Array.isArray(v) ? v.length : 0;
      if (n < min) return `Consigliate almeno ${min} ${cosa}: ora sono ${n}.`;
      if (n > max) return `Consigliate al massimo ${max} ${cosa}: ora sono ${n}.`;
      return true;
    })
    .warning();
