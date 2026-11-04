import { CaseIcon } from '../icons';
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { immagine, testo } from './helpers';

export const AREE = [
  { title: 'Branding', value: 'branding' },
  { title: 'Web', value: 'web' },
  { title: 'Social', value: 'social' },
  { title: 'Stampa', value: 'stampa' },
];

/** Ogni lavoro del portfolio è una scheda a sé: si aggiungono progetti senza toccare la pagina. */
export const progetto = defineType({
  name: 'progetto',
  title: 'Progetto del portfolio',
  type: 'document',
  icon: CaseIcon,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'progetto', newItemPosition: 'before' }),
    testo({ name: 'nome', title: 'Nome del progetto / cliente', description: 'Compare sotto la copertina e come titolo della scheda. Es. «Forno Aurora».', maxParole: 6 }),
    defineField({
      name: 'area',
      title: 'Area',
      type: 'string',
      description: 'Decide in quale filtro compare il lavoro (Branding, Web, Social, Stampa).',
      options: { list: AREE, layout: 'radio', direction: 'horizontal' },
      validation: (rule) => rule.required().error('Scegli l’area del progetto.'),
    }),
    testo({ name: 'tipo', title: 'Tipo di lavoro', description: 'Breve, compare accanto all’area. Es. «Logo e packaging».', maxParole: 5 }),
    defineField({
      name: 'inEvidenza',
      title: 'In evidenza',
      type: 'boolean',
      description: 'Acceso: il progetto compare nel sito. Spento: resta salvato ma non si vede. L’ordine è quello dell’elenco «Portfolio: progetti» (trascina per cambiarlo).',
      initialValue: true,
    }),
    immagine({
      name: 'copertina',
      title: 'Copertina',
      description: 'Formato 4:3. Usata sul tavolo, nella griglia e in alto nella scheda progetto.',
      minLarghezza: 1200,
      esempioAlt: 'Packaging dei dolci di Forno Aurora con il nuovo logo',
    }),
    defineField({
      name: 'galleria',
      title: 'Galleria',
      type: 'array',
      description: 'Altre immagini del progetto, mostrate in fondo alla scheda. Facoltative. Trascinale per cambiare l’ordine.',
      options: { layout: 'grid' },
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Testo alternativo',
              type: 'string',
              description: 'Descrivi la foto a chi non può vederla.',
              validation: (rule) => rule.required().error('Descrivi la foto: serve a chi non può vederla.'),
            }),
          ],
        }),
      ],
    }),
    testo({ name: 'richiesta', title: 'La richiesta', description: 'Cosa voleva il cliente, in 1–2 frasi.', righe: 3, maxFrasi: 2 }),
    testo({ name: 'lavoro', title: 'Il nostro lavoro', description: 'Cosa avete realizzato, in 1–2 frasi.', righe: 3, maxFrasi: 2 }),
    defineField({
      name: 'risultato',
      title: 'Il risultato',
      type: 'text',
      rows: 3,
      description: 'Con dati reali, es. «+40% di prenotazioni nei primi tre mesi». Meglio niente che un numero non verificabile.',
      validation: (rule) => [
        rule.required().error('Scrivi il risultato.'),
        rule.custom((v?: string) => (v && /\[.*\]/.test(v) ? 'Il testo contiene ancora un segnaposto tra parentesi quadre.' : true)).warning(),
      ],
    }),
  ],
  preview: {
    select: { title: 'nome', area: 'area', tipo: 'tipo', media: 'copertina', inEvidenza: 'inEvidenza' },
    prepare: ({ title, area, tipo, media, inEvidenza }) => ({
      title,
      subtitle: `${AREE.find((a) => a.value === area)?.title ?? ''}${tipo ? `, ${tipo}` : ''}${inEvidenza === false ? ' · non in evidenza' : ''}`,
      media,
    }),
  },
});
