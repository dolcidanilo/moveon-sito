# Piano del sito · il quadro completo

Riassume tutte le decisioni prese con il cliente sulla struttura del sito e l'ordine dei lavori.
È il punto di riferimento: aggiornalo quando cambia qualcosa.

## 1. Com'è fatto il sito (mappa)

| Pagina | Stato | Cosa contiene |
| --- | --- | --- |
| **Home** `/` | c'è, da ritoccare | La **vetrina**: riassume e rimanda alle pagine. Hero · Nastro · **Chi sono (versione breve, nuova)** · Pausa · Servizi (ogni scheda con «Scopri di più») · **Non sai da dove partire? (nuova)** · Portfolio (carosello) · Garanzie · Contatti |
| **Chi sono** `/chi-sono/` | da fare | Apertura forte, numeri, punti di forza in card brevi, come lavoro (4 passi), progetti scelti, recensioni, invito. Testi in `docs/testi-chi-sono.md` |
| **Servizi** `/servizi/…` | da fare | Una pagina per servizio (Grafica e immagine, Siti web e negozi online, Social e pubblicità online, App, Stampa e servizi a 360°, Formazione — da confermare): cosa ottieni, **elenco di tutto quello che realizzo** (etichette), progetti collegati, domande frequenti, invito |
| **Progetti** `/progetti/` e `/progetti/nome/` | fatto | Tutti i lavori con filtri e una pagina per ogni progetto |
| **Contatti** `/contatti/` | da fare (facoltativa) | Modulo, zona servita (Pescara e provincia), domande frequenti |
| Privacy e Cookie | fase W3 | Testi LegalBlink |

**Menu**: Chi sono · Servizi (con sottomenu dei singoli servizi) · Portfolio (→ Progetti) · Contatti.

Regole per i testi (decise con il cliente):
- **Prima persona** («io»), **niente nome, niente foto, nessun riferimento all'azienda** dove lavora.
- **Parole semplici**, da imprenditore e non da addetto ai lavori (aiutano anche Google).
- **Pochi testi, molte prove**: numeri, progetti, recensioni.
- **Suggerire l'idea**: il cliente spesso non sa cosa gli serve → sezione «Non sai da dove partire?» (situazioni come le direbbe lui, lavori consigliati, pulsante «Chiedimi un consiglio»).
- Home e pagine **senza testi ripetuti**: la home riassume, le pagine approfondiscono.

## 2. L'ordine dei lavori

### Fatto (10 novembre 2026, versione 1.3.0)
- Hero a immagini con passaggio «pixel dopo pixel» (foto di prova da sostituire).
- Pausa emozionale senza blocco; Servizi con stacco tra titolo e schede; colore #182343.
- Versione 1.2.0 salvata in `dist/archivio/` per poter tornare indietro.

### Prossimo passo
Il cliente ha chiesto di andare avanti **senza il vecchio elenco**: Claude ricostruisce elenco e situazioni dai servizi; recensioni con **segnaposto** finché non arrivano quelle vere.

### Fase A · I contenuti (insieme)
1. **Cliente**: ritrova il vecchio elenco di tutto quello che realizza.
2. **Claude**: prepara le bozze in parole semplici:
   - elenco aggiornato, diviso per servizio;
   - le situazioni di «Non sai da dove partire?»;
   - pagina Chi sono e sua versione breve per la home;
   - testi delle pagine servizio.
3. **Cliente**: corregge le bozze (le parole devono essere sue).
4. In parallelo, **cliente**: chiede 3–5 recensioni ai clienti (messaggio pronto in `docs/testi-chi-sono.md`) e, se vuole già partire, apre la scheda Google Business Profile (la verifica di Google richiede tempo).

### Fase B · La costruzione (Claude)
1. Nuovi elementi WPBakery con la grafica del sito: intestazione di pagina, numeri, card dei punti di forza, passi «come lavoro», etichette dell'elenco, situazioni «Non sai da dove partire?», domande frequenti, recensioni, progetti collegati, invito.
2. **Modelli di pagina pronti** in WPBakery («Chi sono», «Pagina servizio», «Contatti»), come «MoveOn · home completa»: il cliente cambia solo i testi.
3. Menu con **sottomenu** per i Servizi.
4. In home: Chi sono breve, «Scopri di più» sulle schede dei Servizi, sezione «Non sai da dove partire?».
5. Collaudo, zip, istruzioni passo passo per comporre le pagine su /nuovo.

### Fase C · W3: farsi trovare (vedi `docs/piano-W3-seo-analytics-legalblink.md`)
Rank Math (titoli e descrizioni), dati per Google, Google Analytics con consenso, LegalBlink, invio affidabile delle email del modulo.

### Fase D · W4: messa online
Spostamento da /nuovo al sito principale, Search Console, controllo finale.

### Dopo
Profilo professionale del cliente (promemoria in `CLAUDE.md`), social, eventuale e-commerce.

## 3. Cosa deve fare adesso il cliente

Solo tre cose, nessuna urgente:
1. ritrovare il vecchio elenco;
2. chiedere qualche recensione;
3. (facoltativo) aprire la scheda Google.

Tutto il resto lo guida Claude, un passo alla volta.
