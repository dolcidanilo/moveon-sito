import { CogIcon } from '../icons';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { AnteprimaGoogleInput } from '../components/inputs';
import { BLOCCHI, immagine, nomeBlocco, portaA, testo } from './helpers';

const telefonoValido = (v?: string) => !v || /^\+?[\d\s./-]{6,}$/.test(v);

export const impostazioni = defineType({
  name: 'impostazioni',
  title: 'Impostazioni generali',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'logo', title: 'Logo', default: true },
    { name: 'contatti', title: 'Contatti' },
    { name: 'menu', title: 'Menu e pulsanti' },
    { name: 'footer', title: 'Footer e note legali' },
    { name: 'google', title: 'Google e condivisione' },
  ],
  fields: [
    immagine({
      name: 'logoChiaro',
      title: 'Logo per sfondi chiari',
      description: 'Compare nell’header dopo lo scroll, su sfondo bianco. Meglio in SVG, oppure PNG trasparente.',
      minLarghezza: 900,
      accetta: 'image/svg+xml,image/png',
      group: 'logo',
      esempioAlt: 'MoveOn Studio',
    }),
    immagine({
      name: 'logoScuro',
      title: 'Logo per sfondi scuri',
      description: 'Compare nella hero, nel menu mobile e nel footer, su sfondo navy. Meglio in SVG, oppure PNG trasparente.',
      minLarghezza: 900,
      accetta: 'image/svg+xml,image/png',
      group: 'logo',
      esempioAlt: 'MoveOn Studio',
    }),

    defineField({
      name: 'telefono',
      title: 'Telefono',
      type: 'string',
      group: 'contatti',
      description: 'Usato dal pulsante «Chiamaci» e dalla barra in basso su mobile. Non compare mai scritto nella pagina. Es. +39 347 461 6434',
      validation: (rule) => [
        rule.required().error('Inserisci il numero di telefono.'),
        rule.custom((v?: string) => (telefonoValido(v) ? true : 'Usa solo numeri, spazi e il + iniziale.')),
      ],
    }),
    defineField({
      name: 'whatsapp',
      title: 'Numero WhatsApp',
      type: 'string',
      group: 'contatti',
      description: 'Usato dal pulsante «Chatta». Se manca il prefisso, viene aggiunto +39. Es. +39 347 461 6434',
      validation: (rule) => rule.custom((v?: string) => (telefonoValido(v) ? true : 'Usa solo numeri, spazi e il + iniziale.')),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'email',
      group: 'contatti',
      description: 'Usata dal pulsante «Scrivici». È anche l’indirizzo a cui arrivano le richieste del modulo contatti. Es. info@moveonstudio.it',
      validation: (rule) => rule.required().error('Inserisci l’email.'),
    }),

    testo({
      name: 'headerCta',
      title: 'Testo del pulsante nell’header',
      description: 'Il pulsante blu in alto a destra, porta ai Contatti. Es. «Richiedi Preventivo».',
      maxParole: 3,
      group: 'menu',
    }),
    testo({
      name: 'mobileCta',
      title: 'Testo del pulsante nella barra mobile',
      description: 'Il pulsante giallo nella barra in basso su telefono, porta ai Contatti. Es. «Contattaci Ora».',
      maxParole: 3,
      group: 'menu',
    }),
    defineField({
      name: 'menu',
      title: 'Voci del menu',
      type: 'array',
      group: 'menu',
      description: 'Le voci in alto nella pagina. Trascinale per cambiare l’ordine. Le voci che portano a un blocco nascosto non vengono mostrate.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'voceMenu',
          title: 'Voce del menu',
          fields: [
            testo({ name: 'testo', title: 'Testo', description: 'Breve, es. «Servizi».', maxParole: 3 }),
            portaA('blocco', 'Blocco a cui porta'),
          ],
          preview: {
            select: { title: 'testo', blocco: 'blocco' },
            prepare: ({ title, blocco }) => ({ title, subtitle: `Porta a: ${nomeBlocco(blocco)}` }),
          },
        }),
      ],
      validation: (rule) => rule.max(6).warning('Con più di 6 voci il menu rischia di non stare su una riga.'),
    }),

    testo({
      name: 'footerClaim',
      title: 'Claim del footer',
      description: 'La frase nel footer, accanto al logo. Es. «Diamo forma alle tue idee, pixel dopo pixel.»',
      max: 80,
      group: 'footer',
    }),
    testo({
      name: 'datiLegali',
      title: 'Dati legali',
      description: 'Compare nel footer dopo «© anno». Ragione sociale e P. IVA, es. «MoveOn Studio. Tutti i diritti riservati. P. IVA 02117290680».',
      group: 'footer',
    }),
    defineField({
      name: 'privacyUrl',
      title: 'Link Privacy Policy',
      type: 'url',
      group: 'footer',
      description: 'L’indirizzo della Privacy Policy su iubenda. Usato nel footer e nel consenso del modulo contatti.',
      validation: (rule) => rule.required().error('Inserisci il link alla Privacy Policy.'),
    }),
    defineField({
      name: 'cookieUrl',
      title: 'Link Cookie Policy',
      type: 'url',
      group: 'footer',
      description: 'L’indirizzo della Cookie Policy su iubenda. Usato nel footer. Se lo lasci vuoto, il link non compare.',
    }),

    testo({
      name: 'seoTitolo',
      title: 'Titolo per Google',
      description: 'Il titolo blu nei risultati di Google e nella scheda del browser. Es. «MoveOn Studio · Creatività, strategia e risultati».',
      max: 60,
      group: 'google',
    }),
    defineField({
      name: 'seoDescrizione',
      title: 'Descrizione per Google',
      type: 'text',
      rows: 3,
      group: 'google',
      description: 'Le due righe sotto il titolo nei risultati di Google. Racconta cosa fate e invita a contattarvi.',
      options: { max: 160 } as never,
      components: { input: AnteprimaGoogleInput },
      validation: (rule) => [
        rule.required().error('Scrivi la descrizione per Google.'),
        rule.max(160).warning('Google mostra circa 160 caratteri: il resto viene tagliato.'),
      ],
    }),
    immagine({
      name: 'immagineCondivisione',
      title: 'Immagine per la condivisione',
      description: 'Compare quando il link del sito viene condiviso su WhatsApp, Facebook, LinkedIn. Formato 1200 × 630 px.',
      minLarghezza: 1200,
      obbligatoria: false,
      group: 'google',
    }),
  ],
  preview: { prepare: () => ({ title: 'Impostazioni generali' }) },
});

export { BLOCCHI };
