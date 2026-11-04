'use client';

/* Configurazione del pannello contenuti (Sanity Studio), raggiungibile su /studio. */
import { DesktopIcon, UploadIcon } from './sanity/icons';
import { itITLocale } from '@sanity/locale-it-it';
import { defineConfig } from 'sanity';
import { defineDocuments, defineLocations, presentationTool } from 'sanity/presentation';
import { structureTool } from 'sanity/structure';
import { dataset, projectId } from './sanity/env';
import { ImportTool } from './sanity/import/ImportTool';
import { SINGOLI, schemaTypes } from './sanity/schemaTypes';
import { structure } from './sanity/structure';

export default defineConfig({
  name: 'moveon',
  title: 'MoveOn Studio',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [
    structureTool({ title: 'Contenuti', structure }),
    // Anteprima: il sito accanto ai campi, con le bozze; clic su un testo per aprire il suo campo
    presentationTool({
      title: 'Anteprima',
      icon: DesktopIcon,
      previewUrl: { initial: '/', previewMode: { enable: '/api/draft-mode/enable', disable: '/api/draft-mode/disable' } },
      resolve: {
        mainDocuments: defineDocuments([{ route: '/', filter: `_id == "pagina"` }]),
        locations: Object.fromEntries(
          [...SINGOLI, 'progetto'].map((t) => [t, defineLocations({ locations: [{ title: 'Pagina principale', href: '/' }] })]),
        ),
      },
    }),
    itITLocale(),
  ],
  // Funzioni avanzate di Sanity che qui non servono: il pannello resta essenziale
  releases: { enabled: false },
  scheduledDrafts: { enabled: false },
  tasks: { enabled: false },
  announcements: { enabled: false },
  tools: (prev) => [...prev, { name: 'importa', title: 'Importa contenuti', icon: UploadIcon, component: ImportTool }],
  schema: {
    types: schemaTypes,
    // Le schede uniche (impostazioni, blocchi) non si creano dal pulsante "+"
    templates: (prev) => prev.filter((t) => !SINGOLI.includes(t.schemaType)),
  },
  document: {
    // Sulle schede uniche: solo pubblica, annulla modifiche e ripristina versioni precedenti
    actions: (prev, { schemaType }) =>
      SINGOLI.includes(schemaType) ? prev.filter((a) => ['publish', 'discardChanges', 'restore'].includes(a.action ?? '')) : prev,
    newDocumentOptions: (prev) => prev.filter((o) => !SINGOLI.includes(o.templateId)),
  },
});
