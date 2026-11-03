# MoveOn Studio · Consegna a Claude Code: sito one-page e pannello Sanity

Nov 3, 2026 · @Danilo

## Come partire in Claude Code (tutto in cloud)

Questo documento è il brief da dare a Claude Code per costruire il sito definitivo e il pannello Sanity. Si lavora interamente dal browser: non serve installare nulla né tenere file sul computer.

1. **Verifica il piano Claude**: le sessioni cloud di Claude Code sono disponibili per i piani Pro, Max e Team, e per Enterprise con i posti che includono Claude Code ([fonte](https://claude.com/resources/articles/claude-code-on-the-web)).
2. **Crea un account GitHub** gratuito su github.com: è l’archivio online dove vivrà il progetto, con lo storico di ogni modifica.
3. **Crea un repository vuoto** su GitHub, per esempio `moveon-sito`: le sessioni cloud lavorano su repository esistenti, quindi va creato prima ([guida](https://code.claude.com/docs/en/web-quickstart)).
4. **Carica i materiali** nel repository dal browser (pulsante “Add file”, poi “Upload files”), in una cartella `materiali`: il prototipo `moveon-prototipo-motion.html`, il `MoveOn_Studio_Design_System_v2.md`, questo documento esportato in Markdown, il logo e le foto (`foto_creativa.jpeg`, `idea.png`, `contatti.jpg`).
5. **Apri claude.ai/code** e collega GitHub quando te lo chiede, installando l’app Claude su GitHub. Durante la configurazione dell’ambiente cloud consenti l’accesso a internet, così Claude può scaricare le librerie del sito.
6. **Scegli il repository** `moveon-sito`, attiva la modalità piano (Claude propone un piano e aspetta il tuo via libera prima di modificare i file) e incolla il messaggio qui sotto.

```markdown
Leggi i file in /materiali: il documento di consegna, il Design System e il prototipo HTML.
Voglio ricostruire il prototipo come sito vero, con un pannello Sanity in italiano
per modificare tutti i contenuti in autonomia. Segui il modello dei contenuti
e preserva animazioni e comportamenti descritti nel documento.
Lavoro solo dal browser, senza computer locale: guidami passo passo per
GitHub, Sanity e Vercel, spiegando ogni passaggio in modo semplice.
Prima di scrivere codice, proponimi un piano a fasi e dimmi cosa ti serve da me.
```

Come si lavora dopo il primo messaggio:

- A ogni compito Claude lavora in una macchina virtuale in cloud e salva le modifiche su un nuovo ramo del repository; ricevi una notifica e rivedi il risultato.
- Collegando il repository a **Vercel** (o Netlify), ogni ramo diventa un link di anteprima da aprire nel browser, anche dal telefono: è lì che controlli il sito prima di approvare.
- Quando una fase ti convince, chiedi a Claude di unirla alla versione principale; solo quella diventa il sito pubblico.
- Le sessioni restano disponibili su tutti i dispositivi: puoi avviare un compito dal computer e controllarlo più tardi dall’app mobile.

Procedi a fasi brevi: prima la struttura del sito, poi il pannello Sanity, poi il collegamento tra i due, infine la pubblicazione sul dominio.

## Obiettivo e decisioni prese

L’obiettivo è un sito one-page molto creativo che acquisisca nuovi clienti, con tutti i contenuti modificabili da un pannello semplice in italiano, senza toccare il codice.

| Tema | Decisione |
| --- | --- |
| Riferimento visivo | Il prototipo approvato `moveon-prototipo-motion.html` è la fonte di verità per layout, animazioni e comportamento mobile |
| Regole di brand | Design System MoveOn Studio v2.0: token, Montserrat, griglia 12 colonne su base 4px, tono con il “tu” |
| Gestione contenuti | Sanity, con un builder a blocchi guidato: si riordinano, nascondono e modificano i blocchi, ma il design resta protetto nel codice |
| Immagini | Tutte le illustrazioni vettoriali del prototipo (Servizi, Portfolio, cubo) sono segnaposto e diventano campi immagine nel pannello |
| Contatti | Modulo che invia davvero un’email, più tre pulsanti Chiamaci, Chatta (WhatsApp), Scrivici; il numero non compare in chiaro nella pagina |
| Metriche 25+, 360°, 100% | Eliminate dal sito |
| Testo a solo contorno | Non usato: le parole si distinguono con tonalità di blu piene o riempite con foto |

## Architettura tecnica proposta

Il sito pubblico legge i contenuti da Sanity e si aggiorna quando salvi nel pannello; animazioni e grafica vivono nel codice. Sono proposte: Code può suggerire alternative motivate.

| Parte | Proposta | Note |
| --- | --- | --- |
| Sito pubblico | Next.js (oppure Astro) | Pagina generata e veloce, buona per Google |
| Pannello contenuti | Sanity Studio, interfaccia in italiano | Raggiungibile da un indirizzo tipo `moveonstudio.it/studio` |
| Immagini | Archivio immagini di Sanity | Ritaglio con punto focale, formati ottimizzati automaticamente, testo alternativo obbligatorio |
| Animazioni | GSAP con ScrollTrigger, Flip e Draggable, scroll fluido con Lenis | Stesse librerie del prototipo; verificare la licenza GSAP aggiornata |
| Modulo contatti | Invio email tramite un servizio dedicato (es. Resend o simili) | Protezione antispam e conferma visiva come nel prototipo |
| Pubblicazione | Vercel o Netlify, collegati al dominio moveonstudio.it | Aggiornamento automatico a ogni modifica in Sanity |
| Privacy e cookie | Policy iubenda già esistente, banner cookie | Da allineare con i servizi usati (font, statistiche) |

Prima di partire, Code dovrebbe confermare i costi dei piani di Sanity e dell’hosting: cambiano nel tempo e vanno verificati sui siti ufficiali.

## Struttura della pagina

La pagina ha 8 blocchi più header e footer fissi; l’ordine qui sotto è quello approvato, ma dal pannello i blocchi si possono riordinare e nascondere.

1. **Hero**: headline parola per parola, lampadina in pixel che si compone, parallax e scomposizione allo scroll.
2. **Nastro parole chiave**: due righe in movimento continuo, legate alla velocità di scroll.
3. **Chi siamo**: grande “25” riempito dalla foto, manifesto che si accende parola per parola, “Dall’idea al prodotto finito”, card dei motivi che si impilano.
4. **Pausa emozionale**: foto che si apre da un cerchio a tutto schermo sopra un’animazione astratta di pixel e onde.
5. **Servizi**: schede in scorrimento orizzontale su desktop, carosello a swipe su mobile.
6. **Portfolio**: tavolo da lavoro con lavori trascinabili, modalità “In ordine”, filtri e scheda progetto che si espande.
7. **Le nostre garanzie**: scudo in pixel che si compone, sigillo rotante, timbri sulle card.
8. **Contatti**: foto con bollino rotante, titolo, modulo e i tre pulsanti di contatto.

Sempre visibili: header con logo, menu (Chi siamo, Servizi, Portfolio, Contatti) e “Richiedi Preventivo”; su mobile la barra in basso con “Contattaci Ora”, chiamata e WhatsApp.

## Modello dei contenuti in Sanity

Ogni voce qui sotto diventa un campo del pannello con l’etichetta scritta esattamente così; i limiti tra parentesi vengono dalle regole di scrittura del Design System.

### Impostazioni generali (un’unica scheda)

| Campo | Tipo | Note |
| --- | --- | --- |
| Logo per sfondi chiari | Immagine (SVG o PNG) | Usato nell’header dopo lo scroll |
| Logo per sfondi scuri | Immagine (SVG o PNG) | Hero, menu mobile, footer |
| Telefono | Testo | Usato da “Chiamaci” e dalla barra mobile, mai mostrato in chiaro |
| Numero WhatsApp | Testo | Usato da “Chatta” |
| Email | Email | Usata da “Scrivici” e come destinatario del modulo |
| Testo del pulsante nell’header | Testo (max 3 parole) | Oggi “Richiedi Preventivo” |
| Voci del menu | Elenco: testo + blocco a cui porta | Ordinabili |
| Claim del footer | Testo | Oggi “Diamo forma alle tue idee, pixel dopo pixel.” |
| Dati legali | Testo | Ragione sociale, P. IVA |
| Link Privacy e Cookie Policy | Link | iubenda |
| Titolo e descrizione per Google | Testo (60 e 160 caratteri) | Con anteprima del risultato |
| Immagine per la condivisione | Immagine 1200 × 630 | Quando il link viene condiviso sui social |

### Hero

| Campo | Tipo | Note |
| --- | --- | --- |
| Titolo principale | Testo (max 8 parole) | Va a capo dove serve |
| Parola sottolineata in giallo | Scelta tra le parole del titolo | Riceve la pennellata amber |
| Testo sotto il titolo | Testo (max 2 frasi) |  |
| Pulsante: testo / porta a | Testo + blocco | Oggi “Scopri i Servizi” |

La lampadina in pixel resta un’animazione fissa del codice.

### Nastro parole chiave

| Campo | Tipo | Note |
| --- | --- | --- |
| Prima riga / Seconda riga | Elenco di parole (4–6 per riga) | Ordinabili |
| Stile di ogni parola | Scelta: Navy, Blu, Blu chiaro, Riempita con foto | Mai solo contorno |
| Foto per le parole riempite | Immagine | Oggi la foto arcobaleno |

### Chi siamo

| Campo | Tipo | Note |
| --- | --- | --- |
| Numero grande | Testo (max 3 caratteri) | Oggi “25”, riempito dalla foto allo scroll |
| Foto che riempie il numero | Immagine |  |
| Frase accanto al numero | Testo | “anni di creatività e innovazione” |
| Manifesto | Testo (max 80 parole) | Si accende parola per parola |
| Titolo e testo “Dall’idea al prodotto finito” | Testo |  |
| Immagine dell’idea | Immagine facoltativa | Se vuota resta l’animazione del cubo |
| Titolo dei motivi | Testo | “Tanti buoni motivi per sceglierci” |
| Motivi | Elenco di card: titolo, testo, icona (da un elenco di icone del sito), etichette facoltative | 3–5 card |
| Frase di chiusura + link | Testo + link |  |

### Pausa emozionale

| Campo | Tipo | Note |
| --- | --- | --- |
| Foto | Immagine orizzontale | Con punto focale: è il centro del cerchio iniziale |
| Frase | Testo (max 8 parole) | Sopra la velatura navy al 60% |

Le onde e i pixel fluttuanti restano animazioni del codice.

### Servizi

| Campo | Tipo | Note |
| --- | --- | --- |
| Frase di apertura | Testo |  |
| Servizi | Elenco ordinabile | Ogni servizio: nome, frase di beneficio (max 2 frasi), voci incluse (etichette), immagine 4:3 o 1:1, parola di sfondo, colore della scheda (Bianco, Grigio chiaro, Blu, Navy) |
| Frase finale + pulsante | Testo + pulsante | Oggi “Hai un’idea? Le diamo forma noi.” |

Se l’immagine di un servizio è vuota, resta l’illustrazione animata del prototipo come riserva.

### Portfolio

Ogni lavoro è una scheda a sé, così si aggiungono progetti senza toccare la pagina.

| Campo del progetto | Tipo | Note |
| --- | --- | --- |
| Nome del progetto / cliente | Testo |  |
| Area | Scelta: Branding, Web, Social, Stampa | Alimenta i filtri |
| Tipo di lavoro | Testo breve | Es. “Logo e packaging” |
| Copertina | Immagine 4:3 | Usata sul tavolo e in griglia |
| Galleria | Più immagini | Mostrata nella scheda progetto |
| La richiesta / Il nostro lavoro / Il risultato | Testo | Il risultato con dati reali |
| In evidenza | Sì / No | Decide quali appaiono e in che ordine |

Nel blocco: titolo, frase, testo d’istruzioni e scelta della modalità iniziale (Sul tavolo / In ordine).

### Le nostre garanzie

| Campo | Tipo | Note |
| --- | --- | --- |
| Titolo e sottotitolo | Testo | Oggi “Meglio andare sul sicuro, non credi?” |
| Garanzie | Elenco di card: titolo, testo | 3–6 card; solo impegni che puoi mantenere |
| Scritta del sigillo | Testo | “Garanzia MoveOn Studio, scelta sicura” |

### Contatti

| Campo | Tipo | Note |
| --- | --- | --- |
| Titolo e testo | Testo |  |
| Foto | Immagine 4:5 |  |
| Scritta del bollino rotante | Testo (max 24 caratteri) |  |
| Voci di “Di cosa hai bisogno?” | Elenco | Le opzioni del menu a tendina |
| Titolo dei pulsanti | Testo | “Preferisci parlarci subito?” |
| Messaggio di conferma | Testo | Mostrato dopo l’invio |

## Regole del pannello

Chi usa il pannello non deve mai vedere termini tecnici: ogni campo spiega a cosa serve e dove compare nel sito.

- **Tutto in italiano**: menu, etichette, messaggi di errore e pulsanti di Sanity Studio.
- **Una spiegazione sotto ogni campo**, in una frase, con un esempio (“Compare sotto il titolo della hero, es. …”).
- **Limiti che aiutano**: contatore di caratteri e avviso gentile quando si superano i limiti del Design System, senza bloccare il salvataggio dove non serve.
- **Anteprima visiva**: il sito accanto ai campi, aggiornato mentre si scrive.
- **Bozza e pubblicazione**: si lavora in bozza e si pubblica con un pulsante; si può tornare a una versione precedente.
- **Blocchi della pagina**: trascinabili per cambiare ordine, con interruttore “Mostra / Nascondi”.
- **Immagini**: caricamento trascinando il file, ritaglio con punto focale, testo alternativo obbligatorio e spiegato (“Descrivi la foto a chi non può vederla”). Dimensioni minime consigliate indicate sotto ogni campo, ad esempio 1600 px di larghezza per la pausa emozionale e 1200 px per le copertine.
- **Pochi colori a scelta**: dove si sceglie un colore, solo le opzioni del Design System con il loro nome (Navy, Blu, Blu chiaro), mai un selettore libero.
- **Accessi**: un account amministratore per te; eventuali collaboratori con permessi solo per i contenuti.

## Animazioni da preservare e bug già risolti

Le animazioni vanno riprese dal prototipo così come sono; i problemi della tabella sotto sono già stati trovati e corretti, e non devono ricomparire.

Regole generali per il movimento:

- Si animano solo trasformazioni e opacità; obiettivo 60 fotogrammi al secondo anche su telefoni di fascia media.
- Con “riduci movimento” attivo, il sito resta completo e leggibile, senza animazioni.
- Cursore personalizzato, pulsanti magnetici e inclinazione 3D delle card solo con il mouse, mai al tocco.
- Contenuto principale visibile in meno di 2,5 secondi; caricamento iniziale al massimo di un secondo.

| Problema risolto | Causa | Come evitarlo |
| --- | --- | --- |
| Card del portfolio sopra l’header | Il trascinamento alza lo z-index oltre 1000 | Il tavolo è un livello isolato (`isolation: isolate`) |
| Header senza sfondo in fondo alla pagina | Lo sfondo era legato a una zona di scroll che finiva a fondo pagina | Sfondo attivo semplicemente oltre 80 px di scroll |
| Striscia chiara sotto la foto con le cuffie | Banda bianca di 5 px nel file originale | Controllare i bordi di ogni foto caricata; il ritaglio con punto focale aiuta |
| Pagina più larga dello schermo su mobile | I pixel sparsi dello scudo uscivano dai bordi | Le sezioni con elementi che entrano da fuori tagliano il contenuto (`overflow: clip`) |
| Scudo e lampadina che si disturbavano | Selettori condivisi tra le due animazioni | Ogni animazione cerca solo i propri elementi |
| Animazioni delle Garanzie già concluse su desktop | Posizioni calcolate senza lo spazio delle sezioni bloccate sopra | Avanzamento calcolato dalla posizione reale sullo schermo; ordine di creazione delle sezioni bloccate rispettato |
| Cubo e scudo in ritardo o in anticipo su mobile | Animazioni legate al blocco intero, non all’illustrazione | L’animazione segue l’illustrazione stessa |
| Schede dei Servizi tagliate su mobile | Schede più alte dello spazio tra header e barra in basso | Versione compatta; header e barra in basso restano invariati |
| Triangoli negli angoli del testo a contorno | Contorno che si sovrappone nelle giunzioni dei caratteri spessi | Nessun testo a solo contorno |
| Filtri del portfolio a capo su mobile | Cinque voci troppo larghe | Pulsanti compatti su una riga, scorrevoli se serve |

## Materiali da preparare e punti aperti

Il sito si può costruire subito con i contenuti del prototipo; questi materiali servono per sostituirli con quelli definitivi dal pannello.

- [ ] Logo in SVG, o PNG trasparente di almeno 900 px, nelle versioni per sfondo chiaro e scuro
- [ ] Immagini dei 6 servizi (4:3 o 1:1, almeno 1200 px)
- [ ] Progetti reali del portfolio: copertina, galleria, testi e risultati con dati veri
- [ ] Foto definitive per la pausa emozionale, il “25” e i Contatti, senza bordi chiari
- [ ] Numeri delle garanzie: quanti giri di revisione e quanti mesi di assistenza
- [ ] Recensioni di clienti con nome e azienda, e loghi dei clienti (blocco da aggiungere quando ci sono)
- [ ] Accesso al dominio moveonstudio.it per la pubblicazione

Punti aperti da decidere con Code:

- **Sito attuale**: mantenere le pagine esistenti di moveonstudio.it con redirect, per non perdere posizionamento su Google.
- **Design System da aggiornare**: headline della hero più grande del `display` a 56 px; stile fotografico con “colori saturi e contrastati, blu sempre presente”; descrizione del logo reale (“moveon” minuscolo con la freccia nella “o”, proporzione circa 4.4:1); metriche eliminate.
- **Statistiche**: se aggiungere uno strumento di analisi delle visite, che richiede il consenso nel banner cookie.
