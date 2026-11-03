# MoveOn Studio — Design System v2.0

Riferimento live: https://claude.ai/artifact/7U34AjvqRWujEJ1NTWuUTW
Sostituisce il Manuale v1.0.

MoveOn Studio è un'agenzia creativa con oltre 25 anni di esperienza in comunicazione visiva, brand identity, grafica, web e marketing digitale. Questo sistema estende il **Manuale v1.0** e lo allinea a quanto pubblicato su moveonstudio.it: una sola fonte per sito, social, stampa e presentazioni.

**Promessa del brand:** *Creatività, strategia e risultati.* Il tono è quello di un partner esperto e diretto, che guida il cliente “dall'idea al prodotto finito”.

## Principi

1. **Blu che guida.** MoveOn Blue (`brand`) indica sempre l'azione principale e i numeri chiave. Una sola CTA blu per schermata.
2. **Chiarezza istituzionale.** Testi in Deep Navy (`ink`) e Slate (`body`) su fondi chiari (`surface`, `surface-alt`). Molto spazio bianco.
3. **Accenti con misura.** Creative Amber (`accent`) è un evidenziatore, non un colore di testo. Success Green (`success`) indica solo stati.
4. **Completezza a 360°.** Ogni layout mostra l'ampiezza dell'offerta: griglie di servizi, metriche, punti di forza.

## Palette cromatica

| Token | Nome | Hex | Uso |
|---|---|---|---|
| `brand` | MoveOn Blue | #2563eb | CTA primarie, link, numeri, gerarchia |
| `ink` | Deep Navy | #0f172a | Titoli e intestazioni |
| `accent` | Creative Amber | #f59e0b | Highlight, CTA “Contattaci” |
| `success` | Success Green | #10b981 | Stati, conferme |
| `surface-alt` | Surface Light | #f8fafc | Sfondi di sezione |
| `border` | Neutral Border | #e2e8f0 | Bordi e divisori |
| `body` | Slate Body | #334155 | Testo di paragrafo |
| `brand-tint` | Blue Tint | #eff6ff | Badge e box di evidenza |

**Proporzioni d'uso:** circa 60% neutri chiari (`surface`, `surface-alt`), 25% navy/slate per testi, 10% MoveOn Blue, 5% amber e green.

**Accessibilità.** Testo bianco su `brand`: 5.2:1. Su `accent` si scrive sempre in `on-accent` (navy, 8.3:1). `accent` e `success` non vanno mai usati come colore di testo su bianco (2.1:1 e 2.5:1): per i badge si usano le coppie `*-tint` + `*-ink`. Il tema scuro usa `ink` #0f172a come sfondo e `link` #60a5fa per i link.

## Tipografia

Il manuale v1.0 definisce la gerarchia ma non nomina il carattere: si adotta **Montserrat** (Google Fonts, 400–800) come proposta, geometrico e coerente con l'uso del maiuscolo nel menu e nei titoli di sezione del sito. Fallback: Helvetica Neue, Arial. Da confermare con il font effettivamente in uso sul sito.

| Livello | Web | Stampa (manuale v1.0) | Peso |
|---|---|---|---|
| Display / Hero | 56/60px | — | 800 |
| H1 Masthead | 40/48px | 20pt | 800 |
| H2 Section Title (MAIUSCOLO) | 28/36px | 13pt | 700 |
| H3 Card Title | 20/28px | 11pt | 600 |
| Body | 16/26px | 10.5pt | 400 |
| Caption / Micro | 13/18px | 8.5pt | 500 |
| Overline / Menu (MAIUSCOLO) | 12/16px | — | 700 |

Regole: titoli in `ink`, paragrafi in `body`, caption in `muted`. H2 e overline sempre in maiuscolo con spaziatura positiva. Massimo 70 caratteri per riga di testo corrente.

## Componenti

Pulsanti (primario blu “Richiedi Preventivo”, secondario outline “Scopri i Servizi”, accento amber “Contattaci Ora”), badge di stato (Brand Strategy, Attivo, In corso, WordPress), card servizio con immagine 4:3 e metriche di brand (25+, 360°, 100%). Le classi sono in `components/bundle.css` con prefisso `mo-`.

## Iconografia

Il sito non usa un set di icone proprietario. Proposta: icone lineari 24px, tratto 2px, angoli arrotondati, in `brand` o `ink`; mai icone multicolore o emoji. Icone social (Facebook, Instagram, WhatsApp) nei colori di sistema, non in quelli delle piattaforme.

## Fonti e assunzioni

Costruito da: Manuale di Design System v1.0 (PDF) e pagine Home, Servizi e Chi siamo di moveonstudio.it. Proposte (non nelle fonti): `brand-strong`, `muted`, coppie tint/ink dei badge, tema scuro, Montserrat, scala delle spaziature e griglia. Il file del logo non è ancora caricato: vedi la sezione Logo.


---

# Logo e varianti

Il marchio attuale è un **logotipo** “MOVEON STUDIO” in maiuscolo (file sul sito: `logo_MOVEONSTUDIO.png`, versione footer 130 × 30 px, proporzione circa 4.3:1). Il file originale va caricato nel gruppo *Logos*: questo sistema non ne disegna una copia approssimata.

## Varianti da produrre

| Variante | Colore | Quando |
|---|---|---|
| Positivo | `ink` #0f172a | Sfondi bianchi e `surface-alt` |
| Positivo blu | `brand` #2563eb | Sfondi bianchi, materiali commerciali |
| Negativo | bianco | Sfondi `ink`, `brand` o foto scure |
| Monocromatico | nero 100% | Timbri, fax, stampa a un colore, incisioni |
| Compatto / icona | sigla “MO” su quadrato `brand`, `radius-lg` | Favicon, avatar social, icona app (proposta) |
| Orizzontale con payoff | logotipo + “Comunicazione visiva” in `caption` | Intestazioni documenti (proposta) |

## Regole

- **Area di rispetto:** su ogni lato almeno l'altezza della lettera “M” del logotipo.
- **Dimensione minima:** 130 px di larghezza a schermo, 30 mm in stampa.
- **Non fare:** deformare, ruotare, applicare ombre o contorni, cambiare i colori fuori dalla palette, posizionarlo su foto con contrasto inferiore a 4.5:1.
- **Posizione:** in alto a sinistra nel sito, in basso a sinistra o al centro nei materiali stampati.


---

# Spaziature e griglie

**Unità base: 4px.** Tutte le misure sono multipli di 4 (`space-1` … `space-24`).

## Griglia

| Breakpoint | Colonne | Gutter | Margini | Container |
|---|---|---|---|---|
| Desktop ≥ 1200px | 12 | 24px | auto | 1200px (`grid-container`) |
| Tablet 768–1199px | 8 | 24px | 24px | fluido |
| Mobile < 768px | 4 | 16px | 16px | fluido |

## Pattern di layout ricorrenti (dal sito)

- **Hero / slider:** headline `display` + paragrafo `body-lg` su 6–7 colonne, immagine sul resto.
- **Griglia servizi:** 4 card affiancate (3 colonne ciascuna) su desktop, 2 su tablet, 1 su mobile. Immagini 4:3 (sul sito 463 × 348 px).
- **Punti di forza:** 6 voci in griglia 3 × 2 (4 colonne ciascuna), titolo `h3` + testo `body`.
- **Servizi dettaglio:** testo su 7 colonne e immagine su 5, alternando il lato a ogni blocco.
- **Footer:** 3 colonne (logo + claim, contatti, social), riga legale in `caption`.

## Ritmo verticale

Sezioni: `space-24` desktop, `space-12` mobile. Titolo di sezione → contenuto: `space-16`. Card: padding `space-6`, gap `space-6`. Sezioni alternate tra `surface` e `surface-alt`.


---

# Stile fotografico

Il sito usa immagini concettuali e ironiche con una forte presenza del blu: forme geometriche 3D astratte, interfacce e codice, smartphone e social, un ritratto con colori arcobaleno a rappresentare le idee, uno scimpanzé in camicia blu con una lampadina accesa. Il filo comune è **l'idea che prende forma**.

## Direzione

1. **Metafora prima del soggetto.** Ogni immagine racconta un concetto (idea, crescita, connessione), non una scena generica d'ufficio.
2. **Dominante blu.** Color grading verso MoveOn Blue con un solo accento caldo (amber, giallo, arancio). Neri profondi, alte luci pulite.
3. **Un soggetto, sfondo pulito.** Composizioni semplici, soggetto centrale o sui terzi, molto spazio negativo per il testo.
4. **Persone autentiche e positive** per social e e-commerce: espressioni naturali, luce morbida.
5. **Un tocco di ironia** è benvenuto (animali, oggetti surreali) per le sezioni creative; non per pagine istituzionali o legali.

## Formati

| Uso | Proporzione | Note |
|---|---|---|
| Card servizio | 4:3 | `radius-lg`, soggetto centrato |
| Hero / slider | 16:9 o 21:9 | spazio libero a sinistra per la headline |
| Blocchi Servizi / Chi siamo | 4:5 o 1:1 | |
| Social feed | 1:1 e 4:5 | stories 9:16 |

## Da evitare

Strette di mano e team in posa da stock, filtri vintage o desaturati, più di un colore dominante, testo sovrapposto senza velatura `ink` al 60%. Le immagini generate con AI vanno usate con lo stesso grading e senza volti distorti o mani irrealistiche.


---

# Linguaggio e contenuti

## Voce

MoveOn parla come un **consulente esperto e alla mano**: sicuro della propria esperienza, concreto, orientato al risultato del cliente.

| È | Non è |
|---|---|
| Diretto, dà del **tu** al cliente | Formale o burocratico (“la S.V.”) |
| Parla al **noi** come team | Impersonale |
| Concreto: servizi, numeri, tempi | Vago o pieno di gergo |
| Rassicurante | Aggressivo o promozionale urlato |
| Creativo con misura | Ironico in modo forzato |

## Esempi dal sito

- Headline con tre parole chiave: *“Creatività, strategia e risultati.”*
- Claim visivo: *“diamo forma alle tue idee, pixel dopo pixel”*
- Domanda retorica che rassicura: *“Meglio andare sul sicuro, non credi?”*
- Beneficio pratico: “pensiamo a tutto noi, lasciandoti libero di concentrarti sul tuo business” (Chi siamo)

## Parole chiave del brand

creatività · strategia · risultati · su misura · a 360° · esperienza · consulenza · rete di fornitori · dall'idea al prodotto finito

## Regole di scrittura

- **Titoli:** brevi, massimo 8 parole; le H2 in maiuscolo.
- **Paragrafi:** 2–3 frasi, beneficio prima della caratteristica.
- **CTA:** verbo all'imperativo + oggetto: “Richiedi Preventivo”, “Scopri i Servizi”, “Contattaci Ora”.
- **Numeri:** sempre in cifre (25 anni, 360°).
- **Nome:** “MoveOn Studio” nel testo; “MOVEON STUDIO” solo nel logotipo e nei titoli in maiuscolo.
- Contatti ripetuti in ogni pagina: telefono, WhatsApp, email.


---

# Servizi e punti di forza

## Aree di servizio

| Area | Cosa comprende |
|---|---|
| **Grafica & Identità Visiva** | Logo e branding, immagine coordinata, brochure e cataloghi, packaging ed etichette, roll-up e manifesti, gadget, segnaletica e menù |
| **Siti Web & E-commerce** | Siti istituzionali, e-commerce, landing page, blog e magazine, gestione e aggiornamento, newsletter |
| **Digital marketing / Social** | Gestione pagine Facebook e Instagram, piani editoriali, post grafici e video, campagne Meta e Google Ads, report, gestione recensioni |
| **App WebView** | Trasformazione di un sito o e-commerce in app Android e iOS pubblicabile sugli store |
| **Servizi a 360°** (rete partner) | Stampa digitale e offset, impianti pubblicitari e affissione, allestimenti per fiere, distribuzione, stampa su materiali speciali, SMS e DEM |
| **Formazione** | Corsi individuali di Photoshop, Illustrator, InDesign e WordPress |

## Punti di forza

1. **25 anni di esperienza** — competenze affinate e soluzioni su misura.
2. **Consulenza di professionisti** — non solo esecuzione: guida nelle scelte di brand.
3. **Soluzioni complete e integrate** — branding, grafica, web, marketing e stampa in un unico interlocutore.
4. **Una rete di fornitori selezionati** — qualità e prezzi competitivi su stampa e supporti.
5. **Creatività e personalizzazione** — ogni progetto costruito sull'identità del cliente.
6. **Tecnologia e innovazione** — siti performanti e strumenti aggiornati.

## Metriche di brand

**25+** anni di esperienza · **360°** servizio integrato · **100%** soluzioni su misura. Si mostrano con il componente Metric, numero in `link` a 48px/800 ed etichetta `overline`.


---

# Token

## Colori

| Token | Chiaro | Scuro | Uso |
|---|---|---|---|
| `brand` | #2563eb | #2563eb | MoveOn Blue. Colore primario: CTA principali, link, numeri chiave, elementi di gerarchia. Testo bianco (on-brand) sopra: 5.2:1. Come testo su fondo scuro usare link. |
| `brand-strong` | #1d4ed8 | #1d4ed8 | Hover/pressed dei pulsanti primari e testo dei badge brand su brand-tint. Derivato da MoveOn Blue (proposta, non presente nel manuale v1.0). |
| `brand-tint` | #eff6ff | #172554 | Blue Tint. Sfondo di badge, box di evidenza e sezioni in risalto. |
| `link` | #2563eb | #60a5fa | Testo di link e pulsanti secondari (outline). Su surface: 5.2:1 chiaro, 6.9:1 scuro. |
| `ink` | #0f172a | #f8fafc | Deep Navy. Titoli, intestazioni, logo in positivo. |
| `body` | #334155 | #cbd5e1 | Slate Body. Testo di paragrafo su surface e surface-alt. |
| `muted` | #64748b | #94a3b8 | Caption, note, metadati, footer legale. Su surface 4.8:1. Proposta: non presente nel manuale v1.0. |
| `surface` | #ffffff | #0f172a | Sfondo di pagina e delle card. |
| `surface-alt` | #f8fafc | #1e293b | Surface Light. Sfondo delle sezioni alternate. |
| `border` | #e2e8f0 | #334155 | Neutral Border. Bordi card e divisori decorativi. Non per bordi di controlli (contrasto < 3:1): usare link. |
| `accent` | #f59e0b | #f59e0b | Creative Amber. Highlight e CTA secondarie ad alta visibilità (es. Contattaci Ora). Mai come colore di testo: testo sopra in on-accent (8.3:1). |
| `accent-tint` | #fffbeb | #451a03 | Sfondo dei badge amber (In corso). |
| `accent-ink` | #b45309 | #fcd34d | Testo dei badge amber su accent-tint. |
| `success` | #10b981 | #10b981 | Success Green. Solo indicatori di stato (pallino, icona). Mai come testo o fondo di testo bianco (2.5:1). |
| `success-tint` | #ecfdf5 | #064e3b | Sfondo dei badge di stato positivo (Attivo). |
| `success-ink` | #047857 | #6ee7b7 | Testo dei badge di stato positivo su success-tint. |
| `on-brand` | #ffffff | #ffffff | Testo e icone su brand e brand-strong. |
| `on-accent` | #0f172a | #0f172a | Testo e icone su accent, in entrambi i temi. |
| `focus` | #2563eb | #93c5fd | Anello di focus da tastiera, 3px con offset 2px. |

## Tipografia

Famiglia: Montserrat, "Helvetica Neue", Arial, sans-serif

| Gruppo | Stile | Size / Line | Peso | Tracking | Uso |
|---|---|---|---|---|---|
| Web | `display` | 56px / 60px | 800 | -0.02em | Headline di hero e slider. Una per pagina. |
| Web | `h1` | 40px / 48px | 800 | -0.01em | Titolo di pagina (Chi siamo, Servizi). |
| Web | `h2` | 28px / 36px | 700 | 0.04em | Titolo di sezione, in MAIUSCOLO. |
| Web | `h3` | 20px / 28px | 600 | 0 | Titolo di card e voci di servizio. |
| Web | `body-lg` | 18px / 30px | 400 | 0 | Paragrafi introduttivi sotto hero e titoli di pagina. |
| Web | `body` | 16px / 26px | 400 | 0 | Testo corrente. |
| Web | `caption` | 13px / 18px | 500 | 0 | Note, didascalie, footer legale; colore muted. |
| Web | `overline` | 12px / 16px | 700 | 0.12em | Menu di navigazione, etichette e badge, in MAIUSCOLO. |
| Stampa | `print-h1` | 26.67px / 32px | 800 | 0 | 20pt / 800 dal manuale v1.0: masthead di brochure e documenti. |
| Stampa | `print-h2` | 17.33px / 22px | 700 | 0.04em | 13pt / 700: titolo di sezione, maiuscolo. |
| Stampa | `print-h3` | 14.67px / 20px | 600 | 0 | 11pt / 600: titolo di card o paragrafo. |
| Stampa | `print-body` | 14px / 21px | 400 | 0 | 10.5pt / 400: testo corrente su carta. |
| Stampa | `print-caption` | 11.33px / 16px | 500 | 0 | 8.5pt / 500: note e piede di pagina. |

## Spaziature

| Token | Valore | Uso |
|---|---|---|
| `space-1` | 4px | Distanza icona-testo, padding verticale badge. |
| `space-2` | 8px | Gap tra elementi inline, tra titolo e sottotitolo. |
| `space-3` | 12px | Padding verticale pulsanti. |
| `space-4` | 16px | Margine laterale mobile, gap stretto tra card. |
| `space-6` | 24px | Padding card, gutter della griglia, padding orizzontale pulsanti. |
| `space-8` | 32px | Distanza tra blocchi dentro una sezione. |
| `space-12` | 48px | Padding verticale sezioni su mobile. |
| `space-16` | 64px | Distanza titolo di sezione - contenuto su desktop. |
| `space-24` | 96px | Padding verticale sezioni su desktop. |

## Raggi

| Token | Valore | Uso |
|---|---|---|
| `radius-sm` | 4px | Campi input piccoli, tag, elementi pixel. |
| `radius-md` | 8px | Pulsanti e campi di input. |
| `radius-lg` | 12px | Card servizi, box, immagini. |
| `radius-pill` | 999px | Badge e indicatori di stato. |

## Griglia

| Token | Valore | Uso |
|---|---|---|
| `grid-columns` | 12 | Colonne desktop; 8 tablet, 4 mobile. |
| `grid-container` | 1200px | Larghezza massima del contenuto. |
| `grid-gutter` | 24px | Spazio tra colonne (space-6); 16px su mobile. |
| `grid-margin` | 24px | Margine laterale tablet; 16px mobile. |

## Ombre

| Token | Chiaro | Scuro | Uso |
|---|---|---|---|
| `shadow-card` | `0 1px 2px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.08)` | `0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)` | Card servizi a riposo. |
| `shadow-hover` | `0 12px 32px rgba(37,99,235,0.18)` | `0 12px 32px rgba(0,0,0,0.5)` | Card e pulsanti in hover. |

---

# Componenti

## Button

Pulsanti CTA in tre varianti: primario blu, secondario outline, accento amber.

| Variante | Classe | Esempio | Quando |
|---|---|---|---|
| Primario | `mo-btn mo-btn--primary` | Richiedi Preventivo | Azione principale, una per schermata |
| Secondario | `mo-btn mo-btn--secondary` | Scopri i Servizi | Azione di approfondimento accanto al primario |
| Accento | `mo-btn mo-btn--accent` | Contattaci Ora | Contatto diretto in footer, banner, sticky mobile |

Etichette: verbo all'imperativo + oggetto, Title Case, max 3 parole. Altezza 48px, raggio `radius-md`. Il consumer fornisce il testo e l'elemento (`<a>` o `<button>`).

## Badge

Badge e indicatori di stato, a pillola e in maiuscolo.

`mo-badge--brand` per categorie e servizi (Brand Strategy), `mo-badge--success` per stato attivo/completato (con pallino `success`), `mo-badge--accent` per lavori in corso, `mo-badge--neutral` per tecnologie (WordPress). Testo max 2 parole; il colore non è mai l'unico portatore del significato.

## ServiceCard

Card servizio con immagine 4:3, titolo, descrizione breve e link: il blocco base della griglia servizi in home.

Struttura: `mo-card` > `mo-card__media` (immagine 4:3 secondo lo stile fotografico) + `mo-card__body` con `mo-card__title` (h3), `mo-card__text` (max 2 righe) e `mo-card__link`. In griglia: 4 per riga desktop, gap `space-6`. Tutta la card è cliccabile e porta all'ancora del servizio.

## Metric

Metriche di brand: un numero grande e un'etichetta in maiuscolo.

Valori ufficiali: 25+ Anni di esperienza, 360° Servizio integrato, 100% Soluzioni su misura. Numero 48px/800 in `link`, etichetta `overline` in `ink`. Usare in gruppi di 3, su `surface` o `surface-alt`; non inventare nuovi numeri senza dati verificabili.

## CSS dei componenti

```css
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap");
/* MoveOn Studio — component styles (prefix mo-) */
body { margin:0; background:var(--surface); color:var(--body); font-family:var(--font-sans); }
.mo-row { display:flex; flex-wrap:wrap; align-items:center; gap:var(--space-3); padding:var(--space-4); }
.mo-btn { display:inline-flex; align-items:center; gap:var(--space-2); padding:var(--space-3) var(--space-6); border:2px solid transparent; border-radius:var(--radius-md); font:700 15px/20px var(--font-sans); text-decoration:none; cursor:pointer; transition:background .15s, box-shadow .15s; }
.mo-btn:focus-visible { outline:3px solid var(--focus); outline-offset:2px; }
.mo-btn--primary { background:var(--brand); color:var(--on-brand); }
.mo-btn--primary:hover { background:var(--brand-strong); box-shadow:var(--shadow-hover); }
.mo-btn--secondary { background:transparent; color:var(--link); border-color:var(--link); }
.mo-btn--secondary:hover { background:var(--brand-tint); }
.mo-btn--accent { background:var(--accent); color:var(--on-accent); }
.mo-btn--accent:hover { box-shadow:var(--shadow-hover); }
.mo-badge { display:inline-flex; align-items:center; gap:6px; padding:var(--space-1) 10px; border-radius:var(--radius-pill); font:700 11px/16px var(--font-sans); letter-spacing:.08em; text-transform:uppercase; }
.mo-badge--brand { background:var(--brand-tint); color:var(--brand-strong); }
[data-theme="dark"] .mo-badge--brand { color:var(--link); }
.mo-badge--success { background:var(--success-tint); color:var(--success-ink); }
.mo-badge--success::before { content:""; width:6px; height:6px; border-radius:50%; background:var(--success); }
.mo-badge--accent { background:var(--accent-tint); color:var(--accent-ink); }
.mo-badge--neutral { background:var(--surface-alt); color:var(--body); box-shadow:inset 0 0 0 1px var(--border); }
.mo-card { display:block; max-width:280px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg); overflow:hidden; box-shadow:var(--shadow-card); text-decoration:none; transition:box-shadow .2s, transform .2s; }
.mo-card:hover { box-shadow:var(--shadow-hover); transform:translateY(-2px); }
.mo-card__media { aspect-ratio:4/3; background:var(--brand); position:relative; overflow:hidden; }
.mo-card__body { padding:var(--space-6); }
.mo-card__title { margin:0 0 var(--space-2); font:600 20px/28px var(--font-sans); color:var(--ink); }
.mo-card__text { margin:0; font:400 15px/24px var(--font-sans); color:var(--body); }
.mo-card__link { display:inline-block; margin-top:var(--space-4); font:700 12px/16px var(--font-sans); letter-spacing:.12em; text-transform:uppercase; color:var(--link); }
.mo-metrics { display:flex; gap:var(--space-8); flex-wrap:wrap; padding:var(--space-6); }
.mo-metric { min-width:140px; }
.mo-metric__value { font:800 48px/1 var(--font-sans); color:var(--link); letter-spacing:-.02em; }
.mo-metric__label { margin-top:var(--space-2); font:700 12px/16px var(--font-sans); letter-spacing:.12em; text-transform:uppercase; color:var(--ink); }
```