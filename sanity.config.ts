'use client';

/* Configurazione del pannello contenuti (Sanity Studio), raggiungibile su /studio. */
import { UploadIcon } from './sanity/icons';
import { itITLocale } from '@sanity/locale-it-it';
import { defineConfig } from 'sanity';
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
  plugins: [structureTool({ title: 'Contenuti', structure }), itITLocale()],
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
