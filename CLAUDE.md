# MoveOn Studio · sito WordPress — memoria del progetto

Questo file è la memoria di lavoro del progetto: leggilo per intero prima di fare qualsiasi cosa.
Riassume mesi di conversazione con il cliente: chi è, come lavora, com'è fatto il plugin, cosa è stato deciso e perché.
Aggiornalo alla fine di ogni lavoro importante (sezioni «Decisioni» e «In sospeso»).

## Il cliente

- **Danilo** (dolcidanilo), titolare di **MoveOn Studio** (grafica, web, social, stampa) a **Pescara**. Parla **italiano**: rispondi sempre in italiano, chiaro e senza gergo.
- Lavora **solo dal browser** (niente terminale): ogni istruzione deve essere fatta di passi da pannello WordPress / sito web.
- Conosce **HTML e CSS**, **non PHP**. Vuole poter gestire da solo tutto il sito (testi, immagini, colori) dal pannello.
- È l'unico a usare il pannello. Usa **solo JPG e PNG** (mai SVG).
- È un grafico: nota i dettagli (margini, sfumature, allineamenti) e manda screenshot. Prendi sul serio ogni pixel.
- Preferisce che tu **decida la soluzione migliore** quando lo chiede («trova tu la soluzione migliore»), spiegando poi cosa hai fatto e perché. Quando una scelta è sua (gusto, contenuti, costi), chiedi.

## Dove gira il sito

- Hosting **Aruba**, PHP 8.2. Sito attuale su moveonstudio.it; **sito nuovo in costruzione in `moveonstudio.it/nuovo`** (WordPress separato), da spostare poi al posto di quello attuale (fase W4, la guidi tu).
- Tema **Porto** + **WPBakery 9.0.1** su /nuovo (8.1 sul sito attuale). Il plugin esclude gli stili di Porto dalle pagine MoveOn.
- Repository: `dolcidanilo/moveon-sito`, **branch `materiali`** (sviluppa e fai push solo lì; niente pull request se non richieste).
- Il cliente installa il plugin caricando **`dist/moveon-blocks.zip`** (link da dargli: https://github.com/dolcidanilo/moveon-sito/blob/materiali/dist/moveon-blocks.zip).
- Prima del plugin WordPress c'era una versione Next.js + Sanity + Vercel: abbandonata quando il cliente ha scelto WordPress. Resta nella storia Git (commit `4ff408e`).

## Com'è fatto il plugin `wordpress/moveon-blocks/`

| File | Ruolo |
| --- | --- |
| `moveon-blocks.php` | Intestazione, `MOVEON_VERSION`, carica gli `includes/` |
| `includes/template.php` | Motore dei modelli HTML (`MO_Tpl`, sintassi tipo Mustache: `{{x}}`, `{{{x}}}`, `{{#x}}…{{/x}}`, `{{^x}}`, `{{> parte}}`). Ordine: modello salvato in MoveOn → Modelli HTML › tema figlio `moveon/` › `templates/` del plugin |
| `includes/defaults.php` | Testi iniziali di ogni elemento, impostazioni di serie, 8 progetti di esempio |
| `includes/helpers.php` | `mo_image()`, `mo_text()` (decodifica le virgolette di WPBakery), `mo_lines()`, `mo_href()`, telefono/WhatsApp… |
| `includes/blocks.php` | Gli elementi della home (`mo_blocks()`: Hero, Nastro, Chi siamo lungo, Pausa, Servizi, **Portfolio** = carosello 3D con shortcode `mo_carosello`, Garanzie, Contatti; più quelli di `sezioni.php`, 19 in tutto; la home di serie è `mo_home_elementi()`), scheda **Sfondo** (`mo_p_sfondo()`, `mo_sfondo_html()`), funzioni `mo_render_*`. Lo shortcode del vecchio `mo_portfolio` resta registrato ma non mostra niente |
| `includes/sezioni.php` | Gli **11 elementi per le pagine** (Intestazione, Numeri, Punti di forza, Come lavoro, Cosa realizzo, Non sai da dove partire?, Domande frequenti, Recensioni, Progetti scelti, Invito finale) e «Chi sono» breve per la home: definizioni e `mo_render_*`. Si aggiungono a `mo_blocks()` |
| `includes/testi-pagine.php` | Testi di serie dei nuovi elementi (`mo_defaults_sezioni()`) e contenuto delle **pagine pronte** (`mo_pagine_pronte()`, `mo_servizi_pagine()`): in prima persona, parole semplici, [quadre] = da controllare |
| `includes/pagine-pronte.php` | Strumenti: `mo_crea_pagine()` (Chi sono, Servizi + 5 pagine figlie, Contatti; riconosciute dal meta `_moveon_pagina`), `mo_crea_menu_pagine()` (menu «MoveOn · menu con le pagine» con sottomenu), `mo_alleggerisci_home()` |
| `includes/pagina.php` | Modello di pagina «MoveOn · pagina intera», header/footer, caricamento CSS/JS, esclusione stili di Porto, righe/colonne finte se manca WPBakery |
| `includes/modello-pagina.php` | HTML della pagina intera (script di avvio nel `<head>`, header, contenuto, footer) |
| `includes/progetti.php` | Tipo di contenuto `mo_progetto` (Progetti portfolio), riquadro «Dettagli del progetto» (area, tipo, testi, immagine del carosello, immagini del progetto con Aggiungi/Sostituisci/×/ordine) |
| `includes/pagine-progetti.php` | Pagine pubbliche `/progetti/` e `/progetti/nome/`, sfondi di queste pagine (opzione `moveon_sfondi`, 4 zone + sfumatura), 404 per progetti nascosti |
| `includes/contatti.php` | Modulo contatti (REST `moveon/v1/contatti`, antispam, copia in «Richieste dal sito») |
| `includes/admin.php` | Menu MoveOn: Impostazioni, Modelli HTML, Strumenti, Guida |
| `templates/*.html` | HTML di ogni sezione e pagina (modificabile dal cliente) |
| `assets/css/moveon.css` | Tutto lo stile. Classi `mo-…`, variabili `--mo-…` (il cliente le cambia da Aspetto → Personalizza → CSS aggiuntivo) |
| `assets/js/moveon.js` | Animazioni (GSAP 3.15 con ScrollTrigger, Lenis). Ogni sezione ha `data-mo-block="…"` e la sua `init…()` |
| `guida.html` | Guida per il cliente (MoveOn → Guida): **aggiornala** a ogni novità |
| `readme.txt` | Changelog in italiano: **una voce per versione** |

Regole di costruzione:
- Tutto con prefisso `mo-` e variabili `--mo-`: niente deve toccare il tema.
- Il tema Porto e WPBakery aggiungono margini, colori, transizioni: il plugin si difende (vedi blocco «protezione» nel CSS) e i test lo simulano con un **tema ostile** (`tests/tema-ostile.php`).
- Ogni sezione ha la scheda **Sfondo**: colore, stile testi (chiari/scuri), colori di titoli/testi/etichette, immagine con opacità, dimensione, posizione.
- Rispetta **«riduci movimento»** e l'**editor di WPBakery** (animazioni pesanti spente).
- Testi lunghi e immagini: sempre leggibili su qualsiasi sfondo scelto dal cliente.

## Procedimento per ogni modifica (seguilo sempre)

1. **WordPress di prova** (WordPress 6.5 + SQLite in `/nuovo`, con il «tema ostile» che simula Porto):
   `bash tools/wp-prova.sh <cartella>` → http://127.0.0.1:8080/nuovo/ (admin / prova-moveon-1). Il server spesso si spegne tra un turno e l'altro: rilancia lo script (è idempotente). Comandi PHP nel WordPress di prova: `php <cartella>/wpcli.php '<codice PHP>'`.
2. Modifica il codice, poi **guarda il risultato** con Playwright (screenshot desktop e telefono) e confrontalo con lo screen del cliente.
3. **Controlli automatici**: `node tests/check.mjs` (browser, ~85 controlli) e `php tests/plugin-check.php <cartella>/wp` (PHP, ~85). Aggiungi un controllo per ogni bug corretto o funzione nuova. Il controllo «Pausa emozionale: stessa velocità a 60 e 120 Hz» a volte fallisce per il carico della macchina: rilancia.
4. **Versione**: aumentala in `moveon-blocks.php` (intestazione **e** `MOVEON_VERSION`) e in `readme.txt` (`Stable tag` + voce di changelog). Aggiorna `guida.html` e i numeri di controlli nel `README.md`.
5. `python3 tools/build-zip.py` → `dist/moveon-blocks.zip`.
6. Commit (messaggio in italiano) e `git push -u origin materiali` (se fallisce per errore di rete, riprova con attese crescenti).
7. **Risposta al cliente**, in italiano: cosa hai cambiato e perché, cosa hai verificato, e come aggiornare:
   scarica lo zip → Plugin → Aggiungi nuovo → Carica plugin → «Sostituisci la versione installata» → svuota la cache.
   Se cambiano gli indirizzi (/progetti/): Impostazioni → Permalink → Salva.

Inciampi già visti:
- Nel WordPress di prova non si scarica da wordpress.org (rete bloccata).
- Gli script Playwright salvano gli screenshot nella cartella corrente: lanciali dalla scratchpad, mai dalla cartella del plugin (uno screenshot è finito una volta nello zip). Prima del commit controlla `git status`.
- Il messaggio di Chrome «Transition was aborted because of invalid state» nei test è innocuo (passaggio animato tra pagine interrotto dal browser automatico): il test lo ignora.
- Gli script Bash con heredoc che contengono `$$` o simili possono essere bloccati dal controllo di sicurezza: scrivi lo script in un file con lo strumento di scrittura e poi eseguilo.
- `getComputedStyle` è «vivo»: leggi i valori prima di togliere le classi nei test.
- In 3D (`preserve-3d`) un contenitore trasparente può coprire i clic delle card laterali: `pointer-events:none` sul contenitore.

## Decisioni prese (e perché)

- **WordPress + plugin proprio** invece di Next.js/Sanity: il cliente conosce WordPress e vuole gestire tutto da solo.
- **Header e footer del prototipo**, non quelli di Porto. Stili di Porto esclusi dalle pagine MoveOn (riattivabili da Impostazioni).
- Header «sticky» con `backdrop-filter: blur(6.5px)` e sfondo all'82% (variabili `--mo-header-blur`, `--mo-header-opacita`).
- **Lampadina della hero**: resta per ora, il cliente la sostituirà più avanti.
- **Portfolio = carosello 3D a elica** (card **verticali 3:4**), clic sulla card centrale → pagina del progetto. Scelto dal cliente dopo il confronto (1.2.0): il vecchio Portfolio («Sul tavolo», «In ordine», scheda a comparsa) è stato **tolto**; la griglia con filtri vive nella pagina Progetti. Elemento «MoveOn · Portfolio», shortcode `mo_carosello`, ancora di serie `#portfolio`.
- **Pagine dei progetti** pubbliche per la SEO: `/progetti/` (tutti, con filtri sopra le card) e `/progetti/nome/` (copertina, testi, racconto dall'editor, immagini, precedente/successivo, invito finale).
- **Sfondi delle pagine dei progetti** (MoveOn → Impostazioni): 4 zone (parte alta / contenuto per ciascuna pagina) con le stesse opzioni della scheda Sfondo. La «sfumatura in basso» fa proseguire foto e colore della parte alta **sotto** il contenuto, che **non si sposta**.
- Pagina del progetto: box precedente/successivo con bordo 1px colore etichette, su una **fascia nera al 20%**; pagina Progetti: invito finale con **nero al 20%** sopra il blu.
- **Struttura per la SEO**: la home resta la vetrina e *riassume*; pagine dedicate *approfondiscono* (Chi sono, una pagina per servizio, Progetti, Contatti), senza testi ripetuti. Menu verso le pagine (sottomenu Servizi: il menu oggi è a un livello, da estendere).
- **Tono dei testi**: prima persona singolare («io», è un freelance). **Niente nome, niente foto, nessun riferimento all'azienda** per cui lavora come responsabile della comunicazione (non vuole essere riconoscibile). Pochi testi, molte prove (numeri, progetti, recensioni). Bozza in `docs/testi-chi-sono.md`.
- **Gusto del cliente: foto belle, comunicative e professionali** piuttosto che illustrazioni piatte in stile vettoriale. Proporre sempre soluzioni fotografiche (le foto le procura lui, es. Adobe Stock).
- **Hero a immagini** (1.3.0): una foto per settore, passaggio «pixel dopo pixel» a tessere (disegno diverso ogni volta), settori con barra e pausa. La lampadina resta come opzione («stile» = lampadina). Le immagini di serie sono **di prova**: il cliente le sostituirà.
- **Colore**: #1e293b sostituito ovunque con **#182343** (1.3.0).
- **Pausa emozionale** non blocca più lo scorrimento: la foto si apre da quando compare in basso a quando è al centro.
- **Versioni precedenti** in `dist/archivio/` (es. `moveon-blocks-1.2.0.zip`) per poter tornare indietro: si ricarica lo zip vecchio con «Sostituisci la versione installata». Il plugin non tocca i contenuti delle pagine; per sicurezza il cliente fa un backup di /nuovo prima dei cambi grossi.
- **Recensioni**: per costruire le pagine si usano **segnaposto chiaramente finti** (es. «[Recensione di un cliente]»), da sostituire con quelle vere prima della messa online: recensioni inventate pubblicate come vere sono vietate.
- **Pagine (1.4.0)**: home leggera (`mo_home_elementi()`: hero, nastro, chi_breve, pausa, servizi, situazioni, carosello, garanzie, contatti) + pagine Chi sono, Servizi (/servizi/grafica|siti-web|social|stampa|formazione/), Contatti, create da Strumenti. Menu con sottomenu (un livello). `mo_href('/x/')` = pagina del sito (home_url). `mo_link_sezione('#x')` fuori dalla home → home#x, e #contatti → pagina Contatti.
- **App WebView tolta** dal sito (decisione del cliente, 10/11/2026). L'illustrazione «app» resta disponibile tra quelle dei Servizi.
- Testi di serie in **prima persona** («Contattami», «Le mie garanzie»…). Il vecchio «Chi siamo» lungo resta come elemento (usato nella pagina di prova `prova-chi-siamo`).
- Cookie e policy: **LegalBlink di Aruba** al posto di iubenda (non disdire iubenda prima della W4).
- **Google Analytics 4** sì, solo dopo il consenso (Consent Mode v2).

## In sospeso

- **Piano del sito e ordine dei lavori: `docs/piano-sito.md`**. Fase B (costruzione) fatta nella 1.4.0: ora il cliente usa gli Strumenti su /nuovo, corregge i testi [tra quadre], carica le foto (hero, punti di forza) e raccoglie le recensioni vere. Poi fase C (W3).
- Possibili ritocchi grafici «di gusto» annunciati dal cliente.
- **Scheda Google**: il cliente preferisce aprirla quando il sito nuovo è online.
- **W3** — vedi `docs/piano-W3-seo-analytics-legalblink.md` (da riproporre per intero quando si inizia): SEO locale su Pescara e provincia (scheda Google Business Profile da creare, attività senza sede aperta al pubblico; Rank Math; pagine servizi; dati strutturati), Google Analytics, LegalBlink, invio email affidabile (SMTP con la casella Aruba).
- **W4** — spostamento da /nuovo al sito principale.
- **Dopo**: social (Instagram, Facebook, LinkedIn): idee nel piano W3, in fondo.
- Idea futura: un **e-commerce** con lo stesso metodo (WooCommerce + plugin di design proprio).
- **Promemoria da dare al cliente alla fine del progetto** (dopo la W4, prima di chiudere): scrivere insieme il suo **profilo professionale** (chi è, come lavora e decide, gusti estetici, qualità richiesta, vincoli) da usare in ogni lavoro futuro (siti, social, grafica). Piano già concordato:
  1. Claude scrive una bozza partendo da tutto il progetto; il cliente la corregge (sui gusti l'ultima parola è sua).
  2. Tre versioni/posti: **breve** (~10 righe) nelle *preferenze personali* di claude.ai; **completa** nelle istruzioni di un *Progetto* claude.ai («Lavori MoveOn Studio») per social/grafica/testi; **file** in un repository GitHub **privato** da collegare al `CLAUDE.md` dei progetti di codice.
  3. Verificare insieme che Progetti e preferenze personali siano disponibili sul suo piano.
  4. Aggiornarlo a fine di ogni lavoro («aggiorna il mio profilo con quello che hai imparato»).
  Il profilo riguarda solo la sua parte **lavorativa**.
