/*
 * Controlli automatici sui comportamenti del documento di consegna e sui bug già risolti.
 * Uso: avviare il sito (npm run build && npm start) e poi `npm run test:e2e` (URL di default http://localhost:3000).
 * Richiede Playwright con Chromium.
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');
const URL = process.env.SITE_URL || process.argv[2] || 'http://localhost:3000/';

const results = [];
const check = (name, ok, info = '') => {
  results.push({ name, ok, info });
  console.log(`${ok ? '✔' : '✘'} ${name}${info ? ` — ${info}` : ''}`);
};

async function smoothScroll(page, y) {
  await page.evaluate(async (y) => {
    const start = window.scrollY, steps = 14;
    for (let i = 1; i <= steps; i++) {
      window.scrollTo(0, start + ((y - start) * i) / steps);
      await new Promise((r) => setTimeout(r, 35));
    }
  }, y);
  await page.waitForTimeout(900);
}
const topOf = (page, sel) =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const host = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
    return host.getBoundingClientRect().top + window.scrollY;
  }, sel);

const browser = await chromium.launch();

/* ---------------- Desktop ---------------- */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const t0 = Date.now();
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => !document.documentElement.classList.contains('is-loading'), null, { timeout: 5000 });
  const loaderMs = Date.now() - t0;
  check('Caricamento iniziale chiuso entro 2,5 s', loaderMs < 2500, `${loaderMs} ms`);
  await page.waitForTimeout(2200);

  check('Scorrimento orizzontale dei Servizi attivo su desktop', await page.evaluate(() => document.documentElement.classList.contains('h-scroll')));
  check('Cursore personalizzato attivo con il mouse', await page.evaluate(() => document.documentElement.classList.contains('has-cursor')));

  // Bug: scudo e lampadina che si disturbavano → lo scudo è ancora scomposto mentre la lampadina è composta
  const iso = await page.evaluate(() => ({
    bulb: getComputedStyle(document.querySelector('.bulb .px-on i')).opacity,
    shield: document.querySelector('.shield .px-on i').style.opacity,
  }));
  check('Lampadina composta, scudo ancora fermo (animazioni separate)', iso.bulb === '1' && parseFloat(iso.shield) === 0, JSON.stringify(iso));

  // Bug: animazioni delle Garanzie già concluse su desktop
  const garTop = await topOf(page, '.gar');
  await smoothScroll(page, garTop - 900 + 40);
  const early = await page.evaluate(() => document.querySelector('.gar-art').classList.contains('is-done'));
  check('Scudo non ancora completo quando le Garanzie entrano nello schermo', !early);
  await smoothScroll(page, garTop + 200);
  const done = await page.evaluate(() => document.querySelector('.gar-art').classList.contains('is-done'));
  check('Scudo completo quando è al centro dello schermo', done);

  // Bug: card del portfolio sopra l'header
  const pfTop = await topOf(page, '.pf-board');
  await smoothScroll(page, pfTop - 120);
  await page.waitForTimeout(1500);
  const box = await page.locator('.pf-card').first().boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 30, box.y - 200, { steps: 8 });
  const zinfo = await page.evaluate(() => {
    const hdr = document.querySelector('.site-header').getBoundingClientRect();
    const hit = document.elementFromPoint(200, hdr.bottom - 10);
    return { isolation: getComputedStyle(document.querySelector('.pf-board')).isolation, headerOnTop: !!hit?.closest('.site-header') };
  });
  await page.mouse.up();
  check('Card trascinata resta sotto l’header (tavolo isolato)', zinfo.isolation === 'isolate' && zinfo.headerOnTop, JSON.stringify(zinfo));

  // Bug: header senza sfondo in fondo alla pagina
  await smoothScroll(page, await page.evaluate(() => document.documentElement.scrollHeight));
  const hdr = await page.evaluate(() => ({ scrolled: document.documentElement.classList.contains('scrolled'), bg: getComputedStyle(document.querySelector('.site-header')).backgroundColor }));
  check('Header con sfondo anche in fondo alla pagina', hdr.scrolled && hdr.bg !== 'rgba(0, 0, 0, 0)', JSON.stringify(hdr));

  // Bug: testo a solo contorno non usato
  const stroke = await page.evaluate(() => [...document.querySelectorAll('.mq-item')].some((el) => parseFloat(getComputedStyle(el).webkitTextStrokeWidth) > 0));
  check('Nessuna parola a solo contorno', !stroke);

  const alts = await page.evaluate(() => [...document.querySelectorAll('main img')].filter((i) => i.getAttribute('alt') === null).length);
  check('Ogni immagine ha il testo alternativo', alts === 0, `${alts} senza alt`);
  // Portfolio: "In ordine", filtro e scheda progetto
  await smoothScroll(page, (await topOf(page, '.pf')) + 100);
  await page.click('.pf-mode [data-mode="grid"]');
  await page.waitForTimeout(1000);
  await page.click('.pf-filter [data-filter="web"]');
  await page.waitForTimeout(1000);
  const shown = await page.evaluate(() => [...document.querySelectorAll('.pf-card')].filter((c) => !c.classList.contains('is-out')).map((c) => c.dataset.cat));
  check('Filtro “Web” mostra solo i lavori web', shown.length > 0 && shown.every((c) => c === 'web'), shown.join(','));
  await page.locator('.pf-card:not(.is-out)').first().click();
  await page.waitForTimeout(1200);
  const modal = await page.evaluate(() => ({ open: !document.querySelector('.pf-modal').hidden, title: document.querySelector('.pfm-title').textContent }));
  check('La scheda progetto si apre con il titolo', modal.open && modal.title.length > 0, modal.title);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(600);
  const next = await page.evaluate(() => document.querySelector('.pfm-title').textContent);
  check('Freccia → passa al progetto successivo', next !== modal.title, next);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1200);
  check('Esc chiude la scheda progetto', await page.evaluate(() => document.querySelector('.pf-modal').hidden));

  // Modulo contatti: errori e conferma
  await smoothScroll(page, (await topOf(page, '.ct-form')) - 200);
  await page.click('.ct-form button[type="submit"]');
  const msg = await page.textContent('.form-msg');
  check('Modulo vuoto: messaggio di errore', /Controlla i campi/.test(msg || ''));
  await page.fill('#f-nome', 'Mario Rossi');
  await page.fill('#f-email', 'mario@example.com');
  await page.fill('#f-msg', 'Vorrei un nuovo logo.');
  await page.check('.chk input');
  await page.click('.ct-form button[type="submit"]');
  await page.waitForTimeout(1500);
  const thanks = await page.evaluate(() => ({ visible: !document.querySelector('.form-done').hidden, title: document.querySelector('.form-done-title').textContent }));
  check('Modulo compilato: conferma “Grazie, Mario!”', thanks.visible && thanks.title === 'Grazie, Mario!', thanks.title);

  check('Nessun errore nella console (desktop)', errors.length === 0, errors.join(' | '));
  await page.close();
}

/* ---------------- Mobile ---------------- */
{
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(2500);

  // Bug: pagina più larga dello schermo su mobile (controllata lungo tutta la pagina)
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  let worst = 0;
  for (let y = 0; y < H; y += 700) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(120);
    worst = Math.max(worst, await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth));
  }
  check('Pagina mai più larga dello schermo su mobile', worst <= 0, `eccedenza massima ${worst}px`);

  // Bug: schede dei Servizi tagliate su mobile
  const fit = await page.evaluate(() => {
    const avail = window.innerHeight - document.querySelector('.site-header').offsetHeight - document.querySelector('.mbar').offsetHeight;
    const tallest = Math.max(...[...document.querySelectorAll('.svc-panel')].map((p) => p.offsetHeight));
    return { avail, tallest };
  });
  check('Schede dei Servizi entrano tra header e barra in basso', fit.tallest <= fit.avail, JSON.stringify(fit));

  // Bug: filtri del portfolio a capo su mobile
  const filt = await page.evaluate(() => {
    const bs = [...document.querySelectorAll('.pf-filter button')];
    return new Set(bs.map((b) => b.offsetTop)).size;
  });
  check('Filtri del portfolio su una riga', filt === 1, `${filt} righe`);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.tap('.menu-btn');
  await page.waitForTimeout(900);
  const mm = await page.evaluate(() => ({ open: !document.getElementById('mobile-menu').hidden, links: document.querySelectorAll('#mobile-menu .mm-link').length }));
  check('Menu mobile si apre con le voci', mm.open && mm.links > 0, JSON.stringify(mm));
  await page.tap('#mobile-menu .mm-link >> nth=1');
  await page.waitForTimeout(1800);
  const closed = await page.evaluate(() => document.getElementById('mobile-menu').hidden);
  check('Toccando una voce il menu si chiude e porta alla sezione', closed && (await page.evaluate(() => window.scrollY)) > 500);

  const mode = await page.evaluate(() => document.querySelector('.pf-board').classList.contains('is-grid'));
  check('Portfolio “In ordine” su mobile', mode);
  check('Barra contatti in basso visibile su mobile', await page.evaluate(() => getComputedStyle(document.querySelector('.mbar')).display === 'flex'));
  check('Nessun cursore personalizzato al tocco', !(await page.evaluate(() => document.documentElement.classList.contains('has-cursor'))));
  check('Nessun errore nella console (mobile)', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

/* ---------------- Telefoni con schermo a 60 e 120 Hz ---------------- */
// Simula la frequenza dello schermo sostituendo requestAnimationFrame.
const hzShim = (hz) => `(() => { let q = []; setInterval(() => { const t = performance.now(); const c = q; q = []; c.forEach((f) => f(t)); }, ${1000 / hz}); window.requestAnimationFrame = (f) => { q.push(f); return q.length; }; window.cancelAnimationFrame = () => {}; })();`;
{
  const speed = {};
  const pxSpeed = {};
  for (const hz of [60, 120]) {
    const ctx = await browser.newContext({ ...devices['Pixel 7'] });
    const page = await ctx.newPage();
    await page.addInitScript(hzShim(hz));
    // Registra la posizione verticale di ogni pixel disegnato nella Pausa emozionale, fotogramma per fotogramma
    await page.addInitScript(`(() => { const P = CanvasRenderingContext2D.prototype, tr = P.translate, cr = P.clearRect; window.__f = []; P.clearRect = function (...a) { if (this.canvas.classList.contains('emo-canvas')) window.__f.push([]); return cr.apply(this, a); }; P.translate = function (x, y) { if (this.canvas.classList.contains('emo-canvas') && window.__f.length) window.__f[window.__f.length - 1].push(y); return tr.call(this, x, y); }; })();`);
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(2500);
    await page.evaluate(() => window.scrollTo(0, document.querySelector('.marquee').offsetTop - 200));
    await page.waitForTimeout(1200);
    const X = () => page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('.mq-track')).transform).m41);
    const a = await X();
    await page.waitForTimeout(1000);
    speed[hz] = Math.abs((await X()) - a);
    // Velocità media di salita dei pixel (px al secondo), confrontando il primo e l'ultimo fotogramma
    await page.evaluate(() => window.scrollTo(0, document.querySelector('.emo').getBoundingClientRect().top + window.scrollY));
    await page.waitForTimeout(800);
    await page.evaluate(() => { window.__f = []; });
    await page.waitForTimeout(1000);
    pxSpeed[hz] = await page.evaluate(() => {
      const f = window.__f.filter((x) => x.length);
      const a = f[0], z = f[f.length - 1];
      let tot = 0, n = 0;
      a.forEach((y, i) => { const dy = y - z[i]; if (dy > 0 && dy < 200) { tot += dy; n++; } });
      return n ? tot / n : 0;
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    if (hz === 60) {
      // Bug: il nastro ripartiva da capo quando la barra dell'indirizzo cambiava l'altezza della finestra
      const before = await X();
      await page.setViewportSize({ width: 412, height: 700 });
      await page.waitForTimeout(150);
      const jump = Math.abs((await X()) - before);
      check('Nastro: nessun salto quando compare o sparisce la barra del browser', jump < 40, `${jump.toFixed(0)} px`);
      // Pixel della Pausa emozionale: si muovono ancora (canvas che cambia nel tempo)
      await page.evaluate(() => window.scrollTo(0, document.querySelector('.emo').getBoundingClientRect().top + window.scrollY));
      await page.waitForTimeout(800);
      const snap = () => page.evaluate(() => document.querySelector('.emo-canvas').toDataURL());
      const s1 = await snap();
      await page.waitForTimeout(400);
      check('Pausa emozionale: pixel in movimento', s1 !== (await snap()));
    }
    await ctx.close();
  }
  const pr = pxSpeed[120] / pxSpeed[60];
  check('Pausa emozionale: pixel autonomi, stessa velocità a 60 e a 120 Hz', pr > 0.85 && pr < 1.15 && pxSpeed[60] > 8 && pxSpeed[60] < 40, `${pxSpeed[60].toFixed(1)} vs ${pxSpeed[120].toFixed(1)} px/s`);
  const ratio = speed[120] / speed[60];
  check('Nastro: stessa velocità a 60 e a 120 Hz', ratio > 0.85 && ratio < 1.15, `${speed[60].toFixed(0)} vs ${speed[120].toFixed(0)} px/s`);
}

/* ---------------- Movimento ridotto ---------------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => ({
    loading: document.documentElement.classList.contains('is-loading'),
    hscroll: document.documentElement.classList.contains('h-scroll'),
    sub: getComputedStyle(document.querySelector('.hero-sub')).opacity,
    gar: getComputedStyle(document.querySelector('.gar-card')).opacity,
  }));
  check('Movimento ridotto: niente caricamento, contenuti visibili, niente scorrimento bloccato', !r.loading && !r.hscroll && r.sub === '1' && r.gar === '1', JSON.stringify(r));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} controlli superati`);
process.exit(failed.length ? 1 : 0);
