# MoveOn Studio · sito one-page

Il sito definitivo di MoveOn Studio, ricostruito dal prototipo approvato, con il pannello contenuti Sanity in italiano su `/studio`.

## Dove sono le cose

| Cartella | Contenuto |
| --- | --- |
| `materiali/` | Brief di consegna, Design System v2, prototipo HTML e foto originali (solo riferimento) |
| `app/(site)/` | Pagina, impostazioni generali e foglio di stile del sito (ripreso dal prototipo) |
| `app/(studio)/` | Il pannello contenuti su `/studio` |
| `sanity/` | Campi del pannello (`schemaTypes/`), menu (`structure.ts`), importazione dei contenuti iniziali (`import/`) |
| `components/blocks/` | Gli 8 blocchi della pagina: Hero, Nastro, Chi siamo, Pausa, Servizi, Portfolio, Garanzie, Contatti |
| `components/site/` | Header, footer, menu, illustrazioni e lo script delle animazioni (`site-motion.js`) |
| `lib/content/` | Modello dei contenuti (`types.ts`) e contenuti iniziali del prototipo (`seed.ts`) |
| `public/seed/` | Foto, logo e copertine di esempio usati dai contenuti iniziali |
| `tests/check.mjs` | Controlli automatici sui comportamenti e sui bug già risolti |
| `tests/schema-check.mts` | Controlli sul pannello: schema valido, importazione coerente con i campi |

## Stato dei lavori

- [x] **Fase 1:** sito identico al prototipo, con i contenuti presi da `lib/content/seed.ts`.
- [x] **Fase 2:** pannello Sanity in italiano su `/studio`, con il pulsante «Importa contenuti iniziali».
- [ ] **Fase 3:** il sito legge i contenuti da Sanity, con anteprima accanto ai campi.
- [ ] **Fase 4:** il modulo contatti invia le email (Resend), più SEO e rifiniture.
- [ ] **Fase 5:** pubblicazione su moveonstudio.it.

Il modulo contatti **non invia ancora email**: mostra la conferma ma non spedisce nulla, fino alla Fase 4.

## Comandi (per lo sviluppo)

```bash
npm install
npm run build && npm start      # sito su http://localhost:3000
npm run test:e2e                # controlli automatici sul sito (serve Playwright con Chromium)
npm run test:schema             # controlli sul pannello, senza rete
```

Vercel riconosce il progetto da solo: non serve nessuna impostazione particolare.
