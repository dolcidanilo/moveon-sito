/*
 * Crea il PDF «Cose da fare» (dist/cose-da-fare.pdf): l'elenco in ordine di tutto quello che il cliente deve fare,
 * con le caselle da spuntare. Aggiorna i testi qui sotto quando cambiano le richieste e rigeneralo.
 * Uso: node tools/cose-da-fare-pdf.cjs   (serve Playwright)
 */
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const versione = (/Version:\s+([\d.]+)/.exec(fs.readFileSync(path.join(ROOT, 'wordpress/moveon-blocks/moveon-blocks.php'), 'utf8')) || [])[1] || '';
const DATA = '19 novembre 2026';
// Passi della parte A già fatti dal cliente (casella spuntata)
const FATTI = 8;

// Ogni passo: [titolo, dettagli (HTML)]
const parteA = [
  ['Fai un backup di /nuovo', 'Dal pannello Aruba (backup dello spazio web e del database) o con il tuo plugin di backup. È solo una sicurezza prima delle modifiche.'],
  ['Aggiorna il plugin MoveOn Blocks alla versione ' + versione, 'Scarica <b>moveon-blocks.zip</b> (te l’ho mandato in chat, oppure da GitHub, branch «materiali», cartella dist) → <b>Plugin → Aggiungi nuovo → Carica plugin</b> → scegli lo zip → <b>«Sostituisci la versione installata»</b> → svuota la cache.'],
  ['Metti in ordine i servizi', '<b>MoveOn → Strumenti → «Metti in ordine i servizi»</b>. Poi controlla: in home 4 schede (Social, Siti web, Grafica, Stampa); nel menu a tendina la Formazione è in fondo.'],
  ['Controlla la zona in cui lavori', '<b>MoveOn → Impostazioni → Zona in cui lavori</b>: ci sono i 23 comuni che mi hai confermato. Cambia solo se vuoi togliere o aggiungere qualcosa, poi <b>Salva</b>.'],
  ['Pagina Formazione: incolla i testi nuovi', `Apri la pagina Formazione con WPBakery.
    <div class="testo"><b>Intestazione</b> · Titolo: <i>Lezioni di grafica e WordPress, uno a uno, online.</i><br>
    Testo: <i>Lezioni individuali online, anche la sera e nel weekend: impari a usare gli strumenti dei professionisti senza togliere tempo al tuo lavoro.</i></div>
    <div class="testo"><b>Cosa realizzo</b> · al posto di «Corsi per aziende e collaboratori»: <i>Aggiornare da solo il tuo sito</i></div>
    <div class="testo"><b>Domande frequenti</b><br>
    <i>Dove si fanno le lezioni?</i> → <i>Online, con lo schermo condiviso: ti basta un computer. Se preferisci, anche da te, a Pescara e dintorni.</i><br>
    <i>In che orari?</i> → <i>La sera o nel weekend: così non togli ore al tuo lavoro.</i><br>
    <i>Ho appena fatto il sito: posso imparare ad aggiornarlo?</i> → <i>Sì: in una o due lezioni impari a cambiare testi, foto e pagine da solo.</i></div>`],
  ['Pagina Contatti: risposta a «Dove lavori?»', `Nelle Domande frequenti della pagina Contatti:
    <div class="testo"><i>A Pescara e nei comuni vicini, entro circa 30 km: Montesilvano, Chieti, Francavilla al Mare, Spoltore, Città Sant’Angelo, Silvi, Ortona e dintorni. Siti, social e lezioni online li seguo in tutta Italia.</i></div>`],
  ['Tieni /nuovo nascosto a Google', '<b>Impostazioni → Lettura</b>: spunta <b>«Scoraggia i motori di ricerca dall’effettuare l’indicizzazione di questo sito»</b> → Salva. Lo togliamo noi alla messa online.'],
  ['Rank Math: compila la scheda della tua attività', `<b>Rank Math SEO → Titoli e Meta → SEO locale</b> (in inglese «Local SEO»). I nomi dei campi possono essere un po’ diversi.
    <ul><li>Persona o azienda: <b>Azienda</b> (così resti anonimo)</li>
    <li>Nome: <b>MoveOn Studio</b> · logo · email · telefono</li>
    <li>Indirizzo: <b>solo</b> comune (Pescara), CAP, provincia, paese. <b>Niente via.</b></li>
    <li>Tipo di attività, se c’è: <b>Professional Service</b></li></ul>
    Salva e <b>fai uno screenshot</b> della pagina: mi serve.`],
  ['Rank Math: tre ritocchi', `<ul><li><b>Impostazioni → Generali → Titolo del sito</b>: <b>MoveOn Studio</b> (non tutto maiuscolo)</li><li>Home in modifica → riquadro Rank Math → <b>Modifica snippet</b> → Titolo: <i>MoveOn Studio · Social, siti web e grafica a Pescara</i> · Descrizione: <i>Social, siti web, grafica e stampa per aziende e professionisti di Pescara e dintorni. Un solo referente dall’idea al prodotto finito.</i> → Aggiorna</li><li><b>Rank Math SEO → Titoli e Meta → Pagine</b> → Tipo di schema: <b>Nessuno</b>; <b>Titoli e Meta → Autori</b> → disattiva <b>Archivi autore</b> → Salva</li></ul>`],
  ['iubenda: attiva il Consent Mode nel banner', 'Su iubenda.com → <b>Privacy Controls and Cookie Solution → MODIFICA</b>: controlla che sia attivo il <b>Google Consent Mode</b> (di solito tra le impostazioni avanzate o le integrazioni) → Salva. LegalBlink si valuta al rinnovo del dominio (<b>3 febbraio 2027</b>): segnati anche la data di rinnovo di iubenda.'],
  ['iubenda: installa il banner su /nuovo', '<b>Plugin → Aggiungi nuovo</b> → cerca <b>«iubenda»</b> → installa <b>«iubenda | All-in-one Compliance for GDPR / CCPA Cookie Consent»</b> → Attiva → segui la procedura guidata. Quando chiede il codice, lo trovi su iubenda → Privacy Controls and Cookie Solution → <b>INTEGRA</b>. Poi apri /nuovo in una finestra in incognito: deve comparire il banner. Se hai dubbi, mandami uno screenshot.'],
  ['Controlla i link Privacy e Cookie', '<b>MoveOn → Impostazioni → Footer e note legali</b>: apri «Link Privacy Policy» e «Link Cookie Policy» e controlla che portino alle <b>tue</b> policy iubenda (i link giusti sono in iubenda → Privacy e Cookie Policy → INTEGRA). Se sono diversi, sostituiscili → Salva.'],
  ['Google Analytics: il codice di misurazione', 'Se il sito attuale ha già Google Analytics 4: Analytics → <b>Amministrazione → Stream di dati</b> → il tuo sito → copia l’<b>ID misurazione</b> (inizia con <b>G-</b>) e mandamelo: non è un dato segreto. Se non ce l’hai, dimmelo e ti guido a crearlo, con lo stesso account Google della scheda Google.'],
  ['Scheda Google (Google Business Profile): creala e avvia la verifica', `Vai su <b>business.google.com</b> con l’account Google dell’attività (lo stesso userò per Analytics e Search Console).
    <ul><li>Nome: solo <b>MoveOn Studio</b> (niente «Pescara» o altre parole: Google penalizza)</li>
    <li>Categoria principale: la più vicina ai social, es. <b>«Consulente di social media»</b> o <b>«Agenzia di marketing»</b>; secondarie: <b>«Web designer»</b>, <b>«Graphic designer»</b>. Se hai dubbi, mandami lo screenshot delle categorie proposte.</li>
    <li>«Hai una sede dove ricevi i clienti?» → <b>No</b></li>
    <li>Zona servita (massimo 20): Pescara, Montesilvano, Chieti, Francavilla al Mare, Spoltore, San Giovanni Teatino, Città Sant’Angelo, Silvi, Pineto, Ortona, Cepagatti, Pianella, Penne, Loreto Aprutino, Cappelle sul Tavo, Collecorvino, Manoppello, Atri, Miglianico, Tollo</li>
    <li>Google chiede un indirizzo per la verifica ma <b>non lo mostra</b></li>
    <li>Telefono · sito: <b>moveonstudio.it</b> (resta uguale anche dopo lo spostamento) · orari in cui rispondi davvero</li>
    <li>Servizi: Social, Siti web, Grafica, Stampa, Formazione · foto: logo, una copertina, qualche lavoro</li>
    <li>Descrizione, pronta da incollare:</li></ul>
    <div class="testo"><i>Grafica, siti web, social e stampa per aziende e professionisti di Pescara e dintorni. Seguo ogni lavoro dall’idea al prodotto finito, con un solo referente e 25 anni di esperienza nella comunicazione: pagine social curate e pubblicità online, siti chiari e veloci che portano contatti, loghi e immagine coordinata, stampa e allestimenti con fornitori scelti. Ti spiego tutto con parole semplici e ti mando un preventivo chiaro, voce per voce, prima di iniziare. Anche lezioni individuali online di Photoshop, Illustrator, InDesign e WordPress.</i></div>
    Avvia la verifica e <b>annota il metodo</b> che ti propone Google (la verifica può richiedere giorni: non serve aspettarla per scrivermi).`],
  ['Scrivimi «tutto fatto»', 'Allega: <b>l’ID di Google Analytics</b> (passo 13), <b>il metodo di verifica</b> proposto da Google (passo 14) e dimmi se il banner di iubenda compare su /nuovo. Io proseguo con i punti qui sotto.'],
];

const parteB = [
  ['Testi tra [parentesi quadre]', 'In tutte le pagine (home, Chi sono, Servizi e le 5 pagine dei servizi, Contatti) le parti tra [quadre] sono da controllare: correggile con parole tue e togli le parentesi.'],
  ['Foto vere', 'Solo JPG o PNG, belle e professionali (es. Adobe Stock): una per ogni settore della hero, la foto che si apre nel Chi sono, Punti di forza, Contatti. Le foto di serie sono di prova.'],
  ['Recensioni vere (3–5)', `Chiedile ad alcuni clienti con questo messaggio:
    <div class="testo"><i>Ciao [nome], spero vada tutto bene! Sto rinnovando il mio sito e vorrei inserire il parere di alcuni clienti con cui ho lavorato bene. Ti andrebbe di scrivermi due o tre righe su com’è andata con [il progetto]? Cosa ti serviva e cosa ti è piaciuto del risultato. Con il tuo permesso pubblicherei il testo con il tuo nome e la tua attività. Grazie mille!</i></div>
    Poi sostituisci i segnaposto nell’elemento <b>MoveOn · Recensioni</b>: quelli finti <b>non possono andare online</b>. Quando la scheda Google è verificata, chiedi le recensioni anche lì: pesano molto per farti trovare.`],
  ['Progetti veri', '<b>Progetti portfolio</b>: aggiungi i lavori veri (con il permesso dei clienti) e nascondi o elimina gli 8 progetti di esempio.'],
  ['File per le skill di claude.ai', 'Logo grande in PNG (versione chiara e scura) o PDF, il simbolo da solo, i link ai tuoi profili social e qualche esempio di post.'],
];

const dopo = [
  'Controllo la scheda di Rank Math e i dati che legge Google.',
  'Controllo il banner di iubenda e i link Privacy e Cookie nel footer e nel modulo contatti.',
  'Aggiungo Google Analytics, che parte solo quando il visitatore accetta i cookie.',
  'Rendo affidabile l’invio delle email del modulo (con la tua casella Aruba).',
  'Poi la W4: lo spostamento del sito nuovo al posto di quello attuale.',
];

const esc = (t) => String(t);
let n = 0;
const passi = (lista) => lista.map(([t, d]) => { n += 1; const ok = n <= FATTI; return `
  <div class="passo${ok ? ' fatto' : ''}"><div class="box">${ok ? '✓' : ''}</div><div class="num">${n}</div>
    <div class="corpo"><div class="titolo">${esc(t)}</div><div class="dett">${d}</div></div></div>`; }).join('');

const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Cose da fare · MoveOn</title>
<link rel="stylesheet" href="${'file://' + path.join(ROOT, 'wordpress/moveon-blocks/assets/css/fonts.css')}">
<style>
  @page { size: A4; margin: 13mm 15mm 14mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 400 9.6pt/1.45 Montserrat, Arial, sans-serif; color: #182343; }
  h1 { margin: 0 0 1.5mm; font: 800 22pt/1.1 Montserrat, Arial, sans-serif; letter-spacing: -.02em; color: #223ab8; }
  .intro { margin: 0 0 5mm; color: #334155; max-width: 165mm; }
  h2 { margin: 6mm 0 1mm; font: 800 13pt/1.2 Montserrat, Arial, sans-serif; color: #182343; }
  h2 span { display: inline-block; margin-right: 2mm; padding: .6mm 2.4mm; border-radius: 2mm; background: #f59e0b; color: #182343; font-size: 9pt; vertical-align: 1.2pt; }
  .sotto { margin: 0 0 2mm; color: #334155; }
  .passo { display: flex; gap: 3mm; padding: 2.6mm 0; border-top: .3mm solid #e2e8f0; break-inside: avoid; }
  .box { flex: none; width: 5mm; height: 5mm; margin-top: .4mm; border: .45mm solid #223ab8; border-radius: 1mm; }
  .fatto .box { background: #223ab8; color: #f4f5f7; font: 800 9pt/5mm Montserrat, Arial, sans-serif; text-align: center; }
  .fatto .titolo::after { content: '  · fatto'; color: #16a34a; font-weight: 700; }
  .fatto .dett { opacity: .55; }
  .num { flex: none; width: 6mm; font: 800 11pt/1.2 Montserrat, Arial, sans-serif; color: #223ab8; }
  .corpo { flex: 1; }
  .titolo { font: 700 10.5pt/1.3 Montserrat, Arial, sans-serif; color: #182343; margin-bottom: .6mm; }
  .dett { color: #334155; }
  .dett b { color: #182343; }
  .dett ul { margin: 1mm 0 1mm 4mm; padding: 0; }
  .dett li { margin: .4mm 0; }
  .testo { margin: 1.4mm 0; padding: 1.8mm 3mm; background: #f4f5f7; border-left: .8mm solid #2563eb; border-radius: 0 1.5mm 1.5mm 0; }
  .dopo { margin: 2mm 0 0; padding: 0 0 0 5mm; color: #334155; }
  .dopo li { margin: .8mm 0; }
  .piede { margin-top: 6mm; padding-top: 3mm; border-top: .3mm solid #e2e8f0; font-size: 8pt; color: #64748b; }
</style></head><body>
  <h1>Cose da fare</h1>
  <p class="intro">Tutto quello che ti ho chiesto, in ordine. Fai i passi della <b>parte A</b> uno dopo l’altro e spunta la casella; poi scrivimi <b>«tutto fatto»</b>. La <b>parte B</b> si fa con calma, ma deve essere finita prima della messa online.</p>
  <h2><span>A</span>Da fare adesso, in quest’ordine</h2>
  ${passi(parteA)}
  <h2><span>B</span>Con calma, prima della messa online</h2>
  <p class="sotto">Non blocca il lavoro: puoi farla mentre io proseguo.</p>
  ${passi(parteB)}
  <h2>Cosa faccio io dopo il tuo «tutto fatto»</h2>
  <ul class="dopo">${dopo.map((d) => `<li>${d}</li>`).join('')}</ul>
  <p class="piede">MoveOn Studio · sito nuovo (fase W3) · aggiornato al ${DATA} · plugin MoveOn Blocks ${versione}</p>
</body></html>`;

(async () => {
  const tmp = path.join(require('node:os').tmpdir(), 'cose-da-fare.html');
  fs.writeFileSync(tmp, html);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + tmp, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(ROOT, 'dist/cose-da-fare.pdf');
  await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log('Creato ' + out);
})();
