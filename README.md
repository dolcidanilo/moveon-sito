# MoveOn Studio · sito WordPress

Il sito di MoveOn Studio come **plugin WordPress per WPBakery**: le 8 sezioni del prototipo approvato diventano elementi WPBakery, con header, footer e animazioni del prototipo.

**Il file da installare** è [`dist/moveon-blocks.zip`](dist/moveon-blocks.zip): in WordPress vai su **Plugin → Aggiungi nuovo → Carica plugin**.

## Dove sono le cose

| Cartella | Contenuto |
| --- | --- |
| `materiali/` | Brief di consegna, Design System v2, prototipo HTML e foto originali (solo riferimento) |
| `wordpress/moveon-blocks/` | Il plugin |
| `…/templates/` | **Modelli HTML** delle sezioni e delle parti fisse (modificabili anche da WordPress → MoveOn → Modelli HTML) |
| `…/assets/css/moveon.css` | Stile del prototipo, con le **variabili** `--mo-…` per colori, carattere e misure |
| `…/assets/js/moveon.js` | Animazioni (GSAP, Lenis), divise per sezione, più le classi `mo-reveal`, `mo-words`… |
| `…/includes/` | Il motore PHP: elementi WPBakery, impostazioni, progetti e loro pagine, modulo contatti |
| `…/guida.html` | La guida mostrata in WordPress → MoveOn → Guida |
| `dist/moveon-blocks.zip` | Il plugin pronto da caricare |
| `tests/`, `tools/` | Controlli automatici e strumenti (zip, WordPress di prova) |
| `docs/` | Piani delle prossime fasi |

## Stato dei lavori

- [x] **W1:** plugin con gli 8 elementi, modello di pagina, impostazioni, progetti portfolio, modelli HTML modificabili, classi di animazione, modulo contatti con antispam, pagina demo, guida.
- [ ] **W2:** installazione su moveonstudio.it/nuovo e correzioni dopo la prova dentro WPBakery e Porto.
- [ ] **W3:** invio email affidabile (plugin SMTP con la casella Aruba), SEO locale su Pescara, Google Analytics, LegalBlink al posto di iubenda: vedi il [piano W3](docs/piano-W3-seo-analytics-legalblink.md).
- [ ] **W4:** spostamento da /nuovo al sito principale.
- [ ] **Dopo:** profili social (Facebook, Instagram, LinkedIn).

## Per lo sviluppo

```bash
npm install                     # librerie sorgente (GSAP, Lenis, Montserrat)
npm run wp:prova                # WordPress di prova in /tmp/moveon-wp, http://127.0.0.1:8080/nuovo/
npm test                        # controlli nel browser (Playwright): 80 controlli, con un «tema ostile» che simula Porto
npm run test:php                # controlli sul motore PHP: 60 controlli
npm run zip                     # ricrea dist/moveon-blocks.zip
```

Il WordPress di prova non contiene WPBakery (è a pagamento): senza WPBakery il plugin mostra comunque righe e colonne, così le sezioni si possono provare. Il lavoro precedente con Next.js e Sanity resta nello storico Git (commit `4ff408e`).
