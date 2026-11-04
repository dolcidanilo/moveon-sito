import { EyeClosedIcon, EyeOpenIcon, HomeIcon } from '../icons';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { BLOCCHI, nomeBlocco } from './helpers';

/** Ordine dei blocchi nella pagina e interruttore Mostra / Nascondi. */
export const pagina = defineType({
  name: 'pagina',
  title: 'Ordine e visibilità dei blocchi',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'blocchi',
      title: 'Blocchi della pagina',
      description:
        'Trascina i blocchi (dalla maniglia a sinistra) per cambiare l’ordine nella pagina. Clicca un blocco per mostrarlo o nasconderlo. I contenuti di ogni blocco si modificano dalla sua voce nel menu a sinistra.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'voceBlocco',
          title: 'Blocco',
          fields: [
            defineField({
              name: 'blocco',
              title: 'Blocco',
              type: 'string',
              options: { list: BLOCCHI },
              readOnly: ({ value }) => !!value,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'visibile',
              title: 'Mostra nel sito',
              description: 'Spegni l’interruttore per nascondere il blocco senza perdere i contenuti.',
              type: 'boolean',
              initialValue: true,
            }),
          ],
          preview: {
            select: { blocco: 'blocco', visibile: 'visibile' },
            prepare: ({ blocco, visibile }) => ({
              title: nomeBlocco(blocco),
              subtitle: visibile === false ? 'Nascosto' : 'Visibile',
              media: visibile === false ? EyeClosedIcon : EyeOpenIcon,
            }),
          },
        }),
      ],
      validation: (rule) =>
        rule.custom((v: unknown) => {
          const list = (Array.isArray(v) ? v : []) as { blocco?: string }[];
          const ids = list.map((x) => x.blocco);
          if (new Set(ids).size !== ids.length) return 'Ogni blocco può comparire una volta sola.';
          const mancanti = BLOCCHI.filter((b) => !ids.includes(b.value)).map((b) => b.title);
          if (mancanti.length) return `Mancano dall’elenco: ${mancanti.join(', ')}. Aggiungili e, se non li vuoi, nascondili.`;
          return true;
        }),
    }),
  ],
  preview: { prepare: () => ({ title: 'Ordine e visibilità dei blocchi' }) },
});
