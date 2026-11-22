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
const DATA = '22 novembre 2026';
// Passi della parte A già fatti dal cliente (casella spuntata)
const FATTI = 4;

// Ogni passo: [titolo, dettagli (HTML)]
const parteA = [
  ['Installa WP Mail SMTP su /nuovo', '<b>Plugin → Aggiungi nuovo</b> → cerca <b>«WP Mail SMTP»</b> (di WPForms, gratuito) → Installa → Attiva. Se parte una procedura guidata, chiudila: lo configuriamo a mano qui sotto.'],
  ['Collega la casella info@moveonstudio.it', `<b>WP Mail SMTP → Impostazioni</b>:
    <ul><li>Email mittente: <b>info@moveonstudio.it</b> e spunta <b>«Forza email mittente»</b></li>
    <li>Nome mittente: <b>MoveOn Studio</b> e spunta <b>«Forza nome mittente»</b></li>
    <li>Mailer: <b>Altro SMTP</b> («Other SMTP»)</li>
    <li>Host SMTP: <b>smtps.aruba.it</b> · Crittografia: <b>SSL</b> · Porta: <b>465</b></li>
    <li>Autenticazione: <b>sì</b> · Nome utente: <b>info@moveonstudio.it</b> · Password: quella della casella email (la scrivi tu lì, <b>mai in chat</b>)</li></ul>
    → <b>Salva le impostazioni</b>.`],
  ['Manda un’email di prova', '<b>WP Mail SMTP → Strumenti → Test email</b>: scrivi un tuo indirizzo Gmail → Invia. Deve arrivare in <b>Posta in arrivo</b>, non nello spam. Se compare un errore, mandami uno screenshot.'],
  ['Prova il modulo contatti', 'Apri /nuovo in una <b>finestra in incognito</b>, accetta i cookie e compila il modulo usando come email un tuo indirizzo Gmail. Controlla che: la richiesta arrivi su <b>info@moveonstudio.it</b>; premendo <b>«Rispondi»</b> il destinatario sia l’indirizzo Gmail; la richiesta compaia anche nel pannello in <b>Richieste dal sito</b>.'],
  ['Scheda Google verificata: completala', `Quando Google ha finito la verifica (fino a 5 giorni; prima <b>non modificare</b> la scheda), da <b>Modifica profilo</b>:
    <ul><li><b>Descrizione</b>, pronta da incollare:</li></ul>
    <div class="testo"><i>Grafica, siti web, social e stampa per aziende e professionisti di Pescara e dintorni. Seguo ogni lavoro dall’idea al prodotto finito, con un solo referente e 25 anni di esperienza nella comunicazione: pagine social curate e pubblicità online, siti chiari e veloci che portano contatti, loghi e immagine coordinata, stampa e allestimenti con fornitori scelti. Ti spiego tutto con parole semplici e ti mando un preventivo chiaro, voce per voce, prima di iniziare. Anche lezioni individuali online di Photoshop, Illustrator, InDesign e WordPress.</i></div>
    <ul><li><b>Categorie secondarie</b>: Web designer, Graphic designer</li>
    <li><b>Servizi</b>: Social e pubblicità online, Siti web e negozi online, Grafica e immagine, Stampa e allestimenti, Formazione</li>
    <li><b>Foto</b>: logo quadrato, una copertina, 5–10 lavori (con il permesso dei clienti)</li></ul>`],
  ['Scrivimi «tutto fatto»', 'Quando la scheda Google è verificata e completata. Poi ti preparo il piano dello spostamento del sito (W4), che faremo quando avrai inserito i contenuti veri della parte B.'],
];

const parteB = [
  ['Testi tra [parentesi quadre]', 'In tutte le pagine (home, Chi sono, Servizi e le 5 pagine dei servizi, Contatti) le parti tra [quadre] sono da controllare: correggile con parole tue e togli le parentesi.'],
  ['Foto vere', 'Solo JPG o PNG, belle e professionali (es. Adobe Stock): una per ogni settore della hero, la foto che si apre nel Chi sono, Punti di forza, Contatti. Le foto di serie sono di prova.'],
  ['Recensioni vere (3–5)', `Chiedile ad alcuni clienti con questo messaggio:
    <div class="testo"><i>Ciao [nome], spero vada tutto bene! Sto rinnovando il mio sito e vorrei inserire il parere di alcuni clienti con cui ho lavorato bene. Ti andrebbe di scrivermi due o tre righe su com’è andata con [il progetto]? Cosa ti serviva e cosa ti è piaciuto del risultato. Con il tuo permesso pubblicherei il testo con il tuo nome e la tua attività. Grazie mille!</i></div>
    Poi sostituisci i segnaposto nell’elemento <b>MoveOn · Recensioni</b>: quelli finti <b>non possono andare online</b>. Quando la scheda Google è verificata, chiedi le recensioni anche lì: pesano molto per farti trovare.`],
  ['Progetti veri', '<b>Progetti portfolio</b>: aggiungi i lavori veri (con il permesso dei clienti) e nascondi o elimina gli 8 progetti di esempio.'],
  ['File per le skill di claude.ai', 'Logo grande in PNG (versione chiara e scura) o PDF, il simbolo da solo, i link ai tuoi profili social e qualche esempio di post.'],
  ['Numero di telefono dedicato (quando arriva la SIM)', 'Cambialo <b>uguale ovunque</b>: scheda Google (telefono e link WhatsApp <b>https://wa.me/39…</b>), <b>MoveOn → Impostazioni</b> (Telefono e Numero WhatsApp), <b>Rank Math → Titoli e Meta → SEO locale</b>. Su quel numero usa <b>WhatsApp Business</b> con logo e nome MoveOn Studio.'],
];

const dopo = [
  'Ti preparo il piano dello spostamento (W4): copia di sicurezza, passaggio di /nuovo al posto del sito attuale, indirizzi vecchi che portano alle pagine nuove.',
  'Search Console di Google e la mappa del sito, per farti trovare da subito.',
  'Aggiornamento della policy di iubenda (Google Analytics e il modulo nuovo) il giorno dello spostamento.',
  'Controllo finale su computer e telefono, poi via «Scoraggia i motori di ricerca».',
];

// Tutto quello che ci siamo detti e che non va dimenticato: [titolo, dettagli (HTML)]
const ricordare = [
  ['Demo del pannello clienti (dentista)', 'Resta così com’è, pronta da mostrare: <b>moveonstudio.it/nuovo/gestione/?per=dentista-demo</b>. Nome utente e password sono in <b>MoveOn → Pannello clienti</b>; lì puoi anche cambiare la password e, dopo ogni dimostrazione, premere <b>«Rimetti la demo come nuova»</b>. Lo studio è immaginario e il sito è nascosto a Google.'],
  ['Scheda Google', 'Finché Google non ha finito la verifica <b>non modificarla</b>. Dopo il passo 5: chiedi le recensioni ai clienti contenti, sono quelle che pesano di più per farti trovare a Pescara.'],
  ['Rank Math (se non l’hai già fatto)', 'Titolo del sito <b>«MoveOn Studio»</b> (non tutto maiuscolo), titolo e descrizione SEO della home, schema delle pagine = <b>Nessuno</b>, archivi autore spenti. Niente «Legal Name» e niente orari.'],
  ['Email del modulo', 'Le richieste arrivano a info@moveonstudio.it (e alle copie che metti in <b>MoveOn → Impostazioni → Avviso delle richieste anche a</b>) e restano sempre anche in <b>Richieste dal sito</b>. In Gmail tieni il filtro «Non inviare mai a Spam» per gli avvisi da info@moveonstudio.it.'],
  ['Gennaio 2027: iubenda o LegalBlink', 'Il dominio scade il <b>3 febbraio 2027</b>: solo al rinnovo si può acquistare LegalBlink di Aruba. Ti ricordo di confrontare i costi con iubenda (guarda anche quando scade iubenda) e poi decidiamo. Fino ad allora resta iubenda, anche su /nuovo.'],
  ['Il giorno della messa online', 'Si aggiorna la policy di iubenda (Google Analytics e il modulo nuovo): non prima, perché è condivisa con il sito attuale. In Rank Math si controlla che indirizzi e dati restino giusti, senza /nuovo.'],
  ['Dopo la messa online il sito resta tuo', 'Puoi cambiare testi, foto e colori come adesso. Ogni versione del plugin resta in archivio per tornare indietro; consiglio di tenere /nuovo come copia di prova.'],
  ['Te lo ricordo io quando il sito è online (fine W4)', `In quest’ordine:
    <ol><li><b>Siti dei clienti sul tuo spazio Aruba</b>: ogni cliente ha il suo WordPress in una cartella tipo <b>/lavori/nome-cliente/</b>, protetta da password e nascosta a Google; si trasferisce sul suo hosting solo dopo il saldo, con <b>Duplicator</b> o <b>WPvivid</b> (gratuiti, senza il limite di All-in-One WP Migration). Con 5 database: oltre il quinto più siti nello stesso database. Lo costruiamo così: un <b>motore comune</b> (pannello, sezioni, modulo, Google, statistiche, consenso) più un <b>design per ogni cliente</b>, senza Porto e WPBakery (niente licenze); nel pannello aggiungiamo <b>aggiungi / sposta / togli sezioni</b>, <b>nuova pagina</b> e la gestione dei clienti; poi le guide «Nuovo cliente» e «Trasferimento». Nel contratto: acconto 30–50%, software in licenza d’uso, eventuale canone di assistenza.</li>
    <li><b>Il tuo profilo professionale</b> e le <b>skill</b> di claude.ai (come lavori, gusti, qualità richiesta).</li>
    <li><b>I social</b>: Instagram, Facebook, LinkedIn.</li>
    <li>Più avanti, l’idea dell’<b>e-commerce</b> con lo stesso metodo.</li></ol>`],
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
  .nuova-pagina { break-before: page; margin-top: 0; }
  .ricorda { display: flex; gap: 3mm; padding: 2.4mm 0; border-top: .3mm solid #e2e8f0; break-inside: avoid; }
  .segno { flex: none; width: 2.4mm; height: 2.4mm; margin: 1.5mm 1.3mm 0; border-radius: 50%; background: #f59e0b; }
  .dett ol { margin: 1mm 0 0 4.5mm; padding: 0; }
  .dett ol li { margin: .8mm 0; }
  .piede { margin-top: 6mm; padding-top: 3mm; border-top: .3mm solid #e2e8f0; font-size: 8pt; color: #64748b; }
</style></head><body>
  <h1>Cose da fare</h1>
  <p class="intro">I primi 4 passi sono fatti, grazie! Tutto quello che ti chiedo, in ordine. Fai i passi della <b>parte A</b> uno dopo l’altro e spunta la casella; poi scrivimi <b>«tutto fatto»</b>. La <b>parte B</b> si fa con calma, ma deve essere finita prima della messa online.</p>
  <h2><span>A</span>Da fare adesso, in quest’ordine</h2>
  ${passi(parteA)}
  <h2><span>B</span>Con calma, prima della messa online</h2>
  <p class="sotto">Non blocca il lavoro: puoi farla mentre io proseguo.</p>
  ${passi(parteB)}
  <h2>Cosa faccio io dopo il tuo «tutto fatto»</h2>
  <ul class="dopo">${dopo.map((d) => `<li>${d}</li>`).join('')}</ul>
  <h2 class="nuova-pagina">Da ricordare</h2>
  <p class="sotto">Tutto quello che ci siamo detti e che non va perso. Non serve spuntare niente.</p>
  ${ricordare.map(([t, d]) => `<div class="ricorda"><div class="segno"></div><div class="corpo"><div class="titolo">${esc(t)}</div><div class="dett">${d}</div></div></div>`).join('')}
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
