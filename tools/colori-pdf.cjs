/*
 * Crea il PDF «Colori MoveOn» (dist/colori-moveon.pdf): i colori principali del sito, numerati come in
 * MoveOn → Colori. Il cliente cambia il colore dei quadrati e lo rimanda; tools/colori-da-pdf.py li rilegge.
 * Uso: node tools/colori-pdf.cjs   (servono php e Playwright)
 */
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const php = "require 'wordpress/moveon-blocks/includes/colori.php'; echo json_encode(mo_colori_base());";
const colori = JSON.parse(execFileSync('php', ['-r', php], { cwd: ROOT }).toString());
const versione = (/Version:\s+([\d.]+)/.exec(require('node:fs').readFileSync(path.join(ROOT, 'wordpress/moveon-blocks/moveon-blocks.php'), 'utf8')) || [])[1] || '';
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

const righe = Object.entries(colori).map(([n, c]) => `
  <div class="riga">
    <div class="num">${n}</div>
    <div class="quadrato" style="background:${c.colore}"></div>
    <div class="info"><div class="nome">${esc(c.nome)} <span class="hex">${c.colore.toUpperCase()}</span></div><div class="uso">${esc(c.uso)}</div></div>
  </div>`).join('');

const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Colori MoveOn</title>
<link rel="stylesheet" href="${'file://' + path.join(ROOT, 'wordpress/moveon-blocks/assets/css/fonts.css')}">
<style>
  @page { size: A4; margin: 12mm 15mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 400 10pt/1.45 Montserrat, "Helvetica Neue", Arial, sans-serif; color: #182343; }
  h1 { margin: 0 0 2mm; font: 800 22pt/1.1 Montserrat, Arial, sans-serif; letter-spacing: -.02em; color: #223ab8; }
  .intro { margin: 0 0 6mm; max-width: 160mm; color: #334155; }
  .intro b { color: #182343; }
  .riga { display: flex; align-items: center; gap: 6mm; padding: 2mm 0; border-top: .3mm solid #e2e8f0; break-inside: avoid; }
  .num { width: 10mm; font: 800 20pt/1 Montserrat, Arial, sans-serif; color: #182343; text-align: right; }
  .quadrato { flex: none; width: 17mm; height: 17mm; border: .25mm solid #cbd5e1; }
  .info { flex: 1; }
  .nome { font: 700 11pt/1.3 Montserrat, Arial, sans-serif; color: #182343; }
  .hex { margin-left: 2mm; font: 600 9.5pt/1 "Courier New", monospace; color: #64748b; }
  .uso { margin-top: 1mm; font-size: 9pt; color: #334155; }
  .piede { margin-top: 5mm; padding-top: 3mm; border-top: .3mm solid #e2e8f0; font-size: 8.5pt; color: #64748b; }
</style></head><body>
  <h1>Colori MoveOn</h1>
  <p class="intro">I colori principali del sito, numerati. <b>Per cambiarli: cambia solo il colore del quadrato</b> (se vuoi, scrivi anche il nuovo codice accanto) e rimanda il PDF: dal numero si capisce quale colore sostituire. Puoi anche cambiarli da solo dal pannello: <b>MoveOn → Colori</b>, con gli stessi numeri. Le sfumature minori (es. il blu del passaggio del mouse) seguono da sole i colori principali.</p>
  ${righe}
  <p class="piede">Plugin MoveOn Blocks ${versione} · Attenzione alla leggibilità: i testi chiari (7, 8, 10) stanno sui fondi scuri (1, 2), i testi scuri (1, 9) sui fondi chiari (7, 8).</p>
</body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  // Pagina scritta in un file temporaneo, così può caricare il carattere Montserrat del plugin
  const fs = require('node:fs'), os = require('node:os');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'colori-'));
  const file = path.join(dir, 'colori.html');
  fs.writeFileSync(file, html);
  await p.goto('file://' + file, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const out = path.join(ROOT, 'dist/colori-moveon.pdf');
  await p.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close();
  fs.rmSync(dir, { recursive: true, force: true });
  console.log('Creato', path.relative(ROOT, out), '·', Object.keys(colori).length, 'colori');
})();
