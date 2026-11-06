/*
 * Controlli automatici sui comportamenti del documento di consegna e sui bug già risolti.
 * Uso: node tests/check.mjs <indirizzo della pagina con gli 8 elementi MoveOn> (di serie il WordPress di prova in /nuovo).
 * Richiede Playwright con Chromium.
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');
const URL = process.env.SITE_URL || process.argv[2] || 'http://127.0.0.1:8080/nuovo/';

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
  await page.waitForFunction(() => !document.documentElement.classList.contains('mo-is-loading'), null, { timeout: 5000 });
  const loaderMs = Date.now() - t0;
  check('Caricamento iniziale chiuso entro 2,5 s', loaderMs < 2500, `${loaderMs} ms`);
  await page.waitForTimeout(2200);

  check('Scorrimento orizzontale dei Servizi attivo su desktop', await page.evaluate(() => document.documentElement.classList.contains('mo-h-scroll')));
  check('Cursore personalizzato attivo con il mouse', await page.evaluate(() => document.documentElement.classList.contains('mo-has-cursor')));

  // Bug: scudo e lampadina che si disturbavano → lo scudo è ancora scomposto mentre la lampadina è composta
  const iso = await page.evaluate(() => ({
    bulb: getComputedStyle(document.querySelector('.mo-bulb .mo-px-on i')).opacity,
    shield: document.querySelector('.mo-shield .mo-px-on i').style.opacity,
  }));
  check('Lampadina composta, scudo ancora fermo (animazioni separate)', iso.bulb === '1' && parseFloat(iso.shield) === 0, JSON.stringify(iso));

  // Bug: animazioni delle Garanzie già concluse su desktop
  const garTop = await topOf(page, '.mo-gar');
  await smoothScroll(page, garTop - 900 + 40);
  const early = await page.evaluate(() => document.querySelector('.mo-gar-art').classList.contains('mo-is-done'));
  check('Scudo non ancora completo quando le Garanzie entrano nello schermo', !early);
  await smoothScroll(page, garTop + 200);
  const done = await page.evaluate(() => document.querySelector('.mo-gar-art').classList.contains('mo-is-done'));
  check('Scudo completo quando è al centro dello schermo', done);

  // Bug: card del portfolio sopra l'header
  const pfTop = await topOf(page, '.mo-pf-board');
  await smoothScroll(page, pfTop - 120);
  await page.waitForTimeout(1500);
  const box = await page.locator('.mo-pf-card').first().boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 30, box.y - 200, { steps: 8 });
  const zinfo = await page.evaluate(() => {
    const hdr = document.querySelector('.mo-site-header').getBoundingClientRect();
    const hit = document.elementFromPoint(200, hdr.bottom - 10);
    return { isolation: getComputedStyle(document.querySelector('.mo-pf-board')).isolation, headerOnTop: !!hit?.closest('.mo-site-header') };
  });
  await page.mouse.up();
  check('Card trascinata resta sotto l’header (tavolo isolato)', zinfo.isolation === 'isolate' && zinfo.headerOnTop, JSON.stringify(zinfo));

  // Bug: header senza sfondo in fondo alla pagina
  await smoothScroll(page, await page.evaluate(() => document.documentElement.scrollHeight));
  const hdr = await page.evaluate(() => { const cs = getComputedStyle(document.querySelector('.mo-site-header')); return { scrolled: document.documentElement.classList.contains('mo-scrolled'), bg: cs.backgroundColor, blur: cs.backdropFilter }; });
  check('Header con sfondo anche in fondo alla pagina', hdr.scrolled && hdr.bg !== 'rgba(0, 0, 0, 0)', JSON.stringify(hdr));
  check('Header quando scorri: sfondo un po’ trasparente e sfocatura 6.5px', hdr.blur === 'blur(6.5px)' && /(rgba|color)\(.*0\.8\d?\)|\/ 0\.8/.test(hdr.bg), `${hdr.bg} · ${hdr.blur}`);

  // Bug: testo a solo contorno non usato
  const stroke = await page.evaluate(() => [...document.querySelectorAll('.mo-mq-item')].some((el) => parseFloat(getComputedStyle(el).webkitTextStrokeWidth) > 0));
  check('Nessuna parola a solo contorno', !stroke);

  const alts = await page.evaluate(() => [...document.querySelectorAll('main img')].filter((i) => i.getAttribute('alt') === null).length);
  check('Ogni immagine ha il testo alternativo', alts === 0, `${alts} senza alt`);
  // Portfolio: "In ordine", filtro e scheda progetto
  await smoothScroll(page, (await topOf(page, '.mo-pf')) + 100);
  await page.click('.mo-pf-mode [data-mode="grid"]');
  await page.waitForTimeout(1000);
  // Durante l'animazione del filtro il tavolo non deve accorciarsi (la sezione sotto salirebbe)
  const hPrima = await page.evaluate(() => document.querySelector('.mo-pf-board').offsetHeight);
  const campioni = page.evaluate(() => new Promise((ok) => {
    const b = document.querySelector('.mo-pf-board'); const hs = []; const t0 = performance.now();
    window.__moLarghezzaMax = 0;
    const giro = () => {
      hs.push(b.getBoundingClientRect().height);
      document.querySelectorAll('.mo-pf-card').forEach((c) => { window.__moLarghezzaMax = Math.max(window.__moLarghezzaMax, c.getBoundingClientRect().width); });
      if (performance.now() - t0 < 1100) requestAnimationFrame(giro); else ok(hs);
    };
    requestAnimationFrame(giro);
  }));
  await page.click('.mo-pf-filter [data-filter="web"]');
  const hs = await campioni;
  await page.waitForTimeout(300);
  const hDopo = await page.evaluate(() => document.querySelector('.mo-pf-board').offsetHeight);
  const hMin = Math.round(Math.min(...hs));
  check('Filtro: la sezione sotto non sale durante l’animazione', hMin >= Math.min(hPrima, hDopo) - 2, `${hPrima} → min ${hMin} → ${hDopo}px`);
  const larg = await page.evaluate(() => ({ max: Math.round(window.__moLarghezzaMax), col: Math.round(document.querySelector('.mo-pf-card:not(.mo-is-out)').offsetWidth) }));
  check('Filtro: le card che escono non si allargano', larg.max <= larg.col + 4, `max ${larg.max}px, colonna ${larg.col}px`);
  const shown = await page.evaluate(() => [...document.querySelectorAll('.mo-pf-card')].filter((c) => !c.classList.contains('mo-is-out')).map((c) => c.dataset.cat));
  check('Filtro “Web” mostra solo i lavori web', shown.length > 0 && shown.every((c) => c === 'web'), shown.join(','));
  await page.locator('.mo-pf-card:not(.mo-is-out)').first().click();
  await page.waitForTimeout(1200);
  const modal = await page.evaluate(() => ({ open: !document.querySelector('.mo-pf-modal').hidden, title: document.querySelector('.mo-pfm-title').textContent }));
  check('La scheda progetto si apre con il titolo', modal.open && modal.title.length > 0, modal.title);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(600);
  const next = await page.evaluate(() => document.querySelector('.mo-pfm-title').textContent);
  check('Freccia → passa al progetto successivo', next !== modal.title, next);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1200);
  check('Esc chiude la scheda progetto', await page.evaluate(() => document.querySelector('.mo-pf-modal').hidden));
  await page.click('.mo-pf-filter [data-filter="all"]');
  await page.waitForTimeout(1500);
  const resti = await page.evaluate(() => [...document.querySelectorAll('.mo-pf-card')].filter((c) => c.style.width || c.style.opacity || getComputedStyle(c).opacity !== '1').length);
  check('Filtro «Tutti»: le card tornano tutte, senza resti dell’animazione', resti === 0, `${resti} con stili rimasti`);

  // Modulo contatti: errori e conferma
  await smoothScroll(page, (await topOf(page, '.mo-ct-form')) - 200);
  await page.click('.mo-ct-form button[type="submit"]');
  const msg = await page.textContent('.mo-form-msg');
  check('Modulo vuoto: messaggio di errore', /Controlla i campi/.test(msg || ''));
  await page.fill('#mo-f-nome', 'Mario Rossi');
  await page.fill('#mo-f-email', 'mario@example.com');
  await page.fill('#mo-f-msg', 'Vorrei un nuovo logo.');
  await page.check('.mo-chk input');
  await page.click('.mo-ct-form button[type="submit"]');
  await page.waitForTimeout(1500);
  const thanks = await page.evaluate(() => ({ visible: !document.querySelector('.mo-form-done').hidden, title: document.querySelector('.mo-form-done-title').textContent }));
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
    const avail = window.innerHeight - document.querySelector('.mo-site-header').offsetHeight - document.querySelector('.mo-mbar').offsetHeight;
    const tallest = Math.max(...[...document.querySelectorAll('.mo-svc-panel')].map((p) => p.offsetHeight));
    return { avail, tallest };
  });
  check('Schede dei Servizi entrano tra header e barra in basso', fit.tallest <= fit.avail, JSON.stringify(fit));

  // Bug: filtri del portfolio a capo su mobile
  const filt = await page.evaluate(() => {
    const bs = [...document.querySelectorAll('.mo-pf-filter button')];
    return new Set(bs.map((b) => b.offsetTop)).size;
  });
  check('Filtri del portfolio su una riga', filt === 1, `${filt} righe`);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.tap('.mo-menu-btn');
  await page.waitForTimeout(900);
  const mm = await page.evaluate(() => ({ open: !document.getElementById('mo-mobile-menu').hidden, links: document.querySelectorAll('#mo-mobile-menu .mo-mm-link').length }));
  check('Menu mobile si apre con le voci', mm.open && mm.links > 0, JSON.stringify(mm));
  await page.tap('#mo-mobile-menu .mo-mm-link >> nth=1');
  await page.waitForTimeout(1800);
  const closed = await page.evaluate(() => document.getElementById('mo-mobile-menu').hidden);
  check('Toccando una voce il menu si chiude e porta alla sezione', closed && (await page.evaluate(() => window.scrollY)) > 500);

  const mode = await page.evaluate(() => document.querySelector('.mo-pf-board').classList.contains('mo-is-grid'));
  check('Portfolio “In ordine” su mobile', mode);
  check('Barra contatti in basso visibile su mobile', await page.evaluate(() => getComputedStyle(document.querySelector('.mo-mbar')).display === 'flex'));
  check('Nessun cursore personalizzato al tocco', !(await page.evaluate(() => document.documentElement.classList.contains('mo-has-cursor'))));
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
    await page.addInitScript(`(() => { const P = CanvasRenderingContext2D.prototype, tr = P.translate, cr = P.clearRect; window.__f = []; P.clearRect = function (...a) { if (this.canvas.classList.contains('mo-emo-canvas')) window.__f.push([]); return cr.apply(this, a); }; P.translate = function (x, y) { if (this.canvas.classList.contains('mo-emo-canvas') && window.__f.length) window.__f[window.__f.length - 1].push(y); return tr.call(this, x, y); }; })();`);
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(2500);
    await page.evaluate(() => window.scrollTo(0, document.querySelector('.mo-marquee').offsetTop - 200));
    await page.waitForTimeout(1200);
    const X = () => page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('.mo-mq-track')).transform).m41);
    const a = await X();
    await page.waitForTimeout(1000);
    speed[hz] = Math.abs((await X()) - a);
    // Velocità media di salita dei pixel (px al secondo), confrontando il primo e l'ultimo fotogramma
    await page.evaluate(() => window.scrollTo(0, document.querySelector('.mo-emo').getBoundingClientRect().top + window.scrollY));
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
      await page.evaluate(() => window.scrollTo(0, document.querySelector('.mo-emo').getBoundingClientRect().top + window.scrollY));
      await page.waitForTimeout(800);
      const snap = () => page.evaluate(() => document.querySelector('.mo-emo-canvas').toDataURL());
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

/* ---------------- Resistenza agli stili del tema (Porto, WPBakery): problemi segnalati sul sito vero ---------------- */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  const rgb = (s) => s.replace(/\s/g, '');
  const r = await page.evaluate(() => {
    const css = (sel, prop) => { const el = document.querySelector(sel); return el ? getComputedStyle(el)[prop] : null; };
    // Righe di WPBakery che contengono un blocco MoveOn, una dopo l'altra (comprese quelle con le sezioni bloccate)
    const blocks = [...document.querySelectorAll('.mo-content .vc_row')].filter((r) => r.querySelector('.mo-block') && !r.parentElement.closest('.vc_row')).map((b) => b.getBoundingClientRect());
    return {
      portoFile: !!document.querySelector('link[id^="porto"]'),
      colori: {
        garSub: css('.mo-gar-sub', 'color'),
        heroSub: css('.mo-hero-sub', 'color'),
        aboutP: css('.mo-about-p', 'color'),
        statement: css('.mo-gar .mo-statement', 'color'),
        ctText: css('.mo-ct-text', 'color'),
        reasonP: css('.mo-r-tint p', 'color'),
      },
      campi: [...document.querySelectorAll('.mo-ct-form .mo-fld :is(input,select,textarea)')].map((e) => getComputedStyle(e).backgroundColor),
      spazi: blocks.slice(1).map((b, i) => Math.round(b.top - blocks[i].bottom)),
      sfondoBody: getComputedStyle(document.body).backgroundColor,
      lineaNastro: getComputedStyle(document.querySelector('.mo-marquee')).borderBottomWidth,
    };
  });
  check('Stili di Porto caricati come file: esclusi', !r.portoFile);
  const atteso = { garSub: 'rgb(51,65,85)', heroSub: 'rgb(203,213,225)', aboutP: 'rgb(51,65,85)', statement: 'rgb(15,23,42)', ctText: 'rgb(203,213,225)', reasonP: 'rgb(51,65,85)' };
  const sbagliati = Object.entries(atteso).filter(([k, v]) => rgb(r.colori[k] || '') !== v).map(([k]) => `${k}=${r.colori[k]}`);
  check('Colori dei testi del prototipo, non quelli del tema', !sbagliati.length, sbagliati.join(' '));
  check('Campi del modulo tutti con sfondo scuro', r.campi.length >= 4 && r.campi.every((c) => rgb(c) === 'rgb(30,41,59)'), [...new Set(r.campi)].join(' | '));
  check('Nessuno spazio tra una sezione e l’altra', r.spazi.every((g) => g === 0), r.spazi.join(','));
  const pin = await page.evaluate(() => { const sp = document.querySelector('.mo-svc')?.parentElement; return sp && sp.classList.contains('pin-spacer') ? parseFloat(getComputedStyle(sp).paddingBottom) : -1; });
  check('Servizi: lo spazio per lo scorrimento bloccato resta', pin > 500, `${pin}px`);
  const allinea = await page.evaluate(() => [...document.querySelectorAll('.mo-pf-controls .mo-seg')].map((e) => Math.round(e.getBoundingClientRect().left)));
  check('Portfolio: «Sul tavolo / In ordine» allineato a sinistra', allinea.length === 2 && allinea[0] === allinea[1], allinea.join(' / '));
  check('Nessuna linea sotto il nastro', r.lineaNastro === '0px', r.lineaNastro);
  check('Sfondo della pagina del sito, non del tema', rgb(r.sfondoBody) === 'rgb(255,255,255)', r.sfondoBody);
  // Pulsante al passaggio del mouse: testo bianco e niente sottolineatura
  await page.hover('.mo-header-cta');
  await page.waitForTimeout(400);
  const hov = await page.evaluate(() => { const s = getComputedStyle(document.querySelector('.mo-header-cta')); return { c: s.color, d: s.textDecorationLine }; });
  check('Pulsante leggibile al passaggio del mouse', rgb(hov.c) === 'rgb(255,255,255)' && hov.d === 'none', JSON.stringify(hov));
  // Schede dei motivi: restano ferme (sticky) mentre la successiva sale
  const t0 = await topOf(page, '.mo-reasons');
  await smoothScroll(page, t0 + 300);
  const a = await page.evaluate(() => Math.round(document.querySelectorAll('.mo-reason')[0].getBoundingClientRect().top));
  await smoothScroll(page, t0 + 600);
  const b = await page.evaluate(() => Math.round(document.querySelectorAll('.mo-reason')[0].getBoundingClientRect().top));
  check('Schede dei motivi ferme mentre scorri (si impilano)', Math.abs(a - b) <= 2, `${a} → ${b}`);
  await page.close();
}

/* ---------------- Classi di animazione per le sezioni fatte con WPBakery (pagina "prova-classi") ---------------- */
{
  const page = await browser.newPage({ viewport: { width: 1360, height: 860 } });
  const res = await page.goto(new globalThis.URL('prova-classi/', URL).href, { waitUntil: 'load' });
  if (res && res.ok()) {
    await page.waitForTimeout(2500);
    const prima = await page.evaluate(() => getComputedStyle(document.querySelector('.mo-reveal')).opacity);
    await smoothScroll(page, 900);
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => {
      const w = document.querySelector('.mo-words');
      const cards = [...document.querySelectorAll('.mo-stagger > *')];
      return {
        reveal: getComputedStyle(document.querySelector('.mo-reveal')).opacity,
        stagger: cards.every((c) => getComputedStyle(c).opacity === '1' && window.gsap.getProperty(c, 'y') === 0),
        transizione: getComputedStyle(cards[cards.length - 1]).transitionProperty,
        parole: w.querySelectorAll('.mo-mw').length,
        html: !!w.querySelector('strong .mo-mw') && !!w.querySelector('a[href]'),
      };
    });
    check('mo-reveal: nascosto prima, visibile dopo lo scroll', prima === '0' && r.reveal === '1');
    check('mo-stagger: elementi al loro posto alla fine (anche con transizioni CSS)', r.stagger && r.transizione !== 'none', r.transizione);
    check('mo-words: parole divise senza rompere grassetti e link', r.parole > 5 && r.html, `${r.parole} parole`);
  } else {
    console.log('… pagina "prova-classi" assente: controlli sulle classi saltati');
  }
  await page.close();
}

/* ---------------- Immagine di sfondo delle sezioni (pagina "prova-sfondo") ---------------- */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
  const res = await page.goto(new globalThis.URL('prova-sfondo/', URL).href, { waitUntil: 'load' });
  if (res && res.ok()) {
    await page.waitForTimeout(2000);
    await smoothScroll(page, (await topOf(page, '.mo-gar')) + 100);
    const r = await page.evaluate(() => {
      const bg = document.querySelector('.mo-gar > .mo-bg');
      const t = document.querySelector('.mo-gar .mo-statement').getBoundingClientRect();
      const pila = document.elementsFromPoint(t.left + 20, t.top + t.height / 2);
      const s = bg && getComputedStyle(bg);
      const bg2 = document.querySelector('.mo-contact > .mo-bg');
      return {
        c: !!bg, opacita: s && s.opacity, size: s && s.backgroundSize, sopraTesto: pila.indexOf(bg) > -1 && pila.indexOf(bg) < pila.findIndex((e) => e.classList.contains('mo-statement')),
        copre: bg && Math.round(bg.getBoundingClientRect().height) === Math.round(document.querySelector('.mo-gar').getBoundingClientRect().height),
        contain: bg2 && getComputedStyle(bg2).backgroundSize, pos: bg2 && getComputedStyle(bg2).backgroundPosition,
      };
    });
    check('Sfondo: immagine presente con l’opacità scelta (40%)', r.c && r.opacita === '0.4', `${r.opacita}`);
    check('Sfondo: copre tutta la sezione e sta sotto i testi', r.size === 'cover' && r.copre && !r.sopraTesto);
    check('Sfondo: «intera, senza tagli» e posizione in alto', r.contain === 'contain' && r.pos === '50% 0%', `${r.contain} ${r.pos}`);
    const c = await page.evaluate(() => {
      const pf = document.querySelector('.mo-pf'), gar2 = document.querySelectorAll('.mo-gar')[1];
      const st = (el, p) => getComputedStyle(el)[p];
      return {
        coloreLivello: st(pf.querySelector(':scope > .mo-bg--colore'), 'backgroundColor'),
        titoloPf: st(pf.querySelector('.mo-statement'), 'color'),
        istruzioniPf: st(pf.querySelector('.mo-pf-sub'), 'color'),
        cardGar: gar2 && st(gar2.querySelector('.mo-gar-card'), 'backgroundColor'),
        titoloCard: gar2 && st(gar2.querySelector('.mo-gar-card h3'), 'color'),
      };
    });
    const rgb = (x) => (x || '').replace(/\s/g, '');
    check('Colore di sfondo della sezione (blu)', rgb(c.coloreLivello) === 'rgb(37,99,235)', c.coloreLivello);
    check('Testi chiari su sfondo scuro (anche la frase sotto il titolo)', rgb(c.titoloPf) === 'rgb(248,250,252)' && rgb(c.istruzioniPf) === 'rgb(226,232,240)', `${c.titoloPf} ${c.istruzioniPf}`);
    const m = await page.evaluate(() => {
      const pf = document.getElementById('pf3'); const st = (sel) => getComputedStyle(pf.querySelector(sel)).color;
      const att = pf.querySelector('.mo-seg button[aria-pressed="true"]'); const cs = getComputedStyle(att);
      return { titolo: st('.mo-statement'), testo: st('.mo-pf-sub'), etichetta: st('.mo-overline-h2'), attivoFondo: cs.backgroundColor, attivoTesto: cs.color, nomeCard: st('.mo-pf-name') };
    });
    check('Colori dei testi scelti a mano (titoli, testi, etichette)', rgb(m.titolo) === 'rgb(124,45,18)' && rgb(m.testo) === 'rgb(67,20,7)' && rgb(m.etichetta) === 'rgb(29,78,216)', JSON.stringify(m));
    check('Colori a mano: pulsanti selezionati e card restano leggibili', rgb(m.attivoFondo) === 'rgb(15,23,42)' && rgb(m.attivoTesto) === 'rgb(255,255,255)' && rgb(m.nomeCard) === 'rgb(15,23,42)', `${m.attivoFondo} ${m.attivoTesto} ${m.nomeCard}`);
    check('Card scure con testi chiari', rgb(c.cardGar) === 'rgb(15,23,42)' && rgb(c.titoloCard) === 'rgb(248,250,252)', `${c.cardGar} ${c.titoloCard}`);
    await page.screenshot({ path: process.env.SCREEN_DIR ? process.env.SCREEN_DIR + '/prova-sfondo.png' : '/dev/null' }).catch(() => {});
  } else {
    console.log('… pagina "prova-sfondo" assente: controlli sullo sfondo saltati');
  }
  await page.close();
}

/* ---------------- Portfolio: tutte le combinazioni di modo e filtro ---------------- */
// Ogni passaggio è osservato fotogramma per fotogramma: nessuna card deve allargarsi, allungarsi
// o lampeggiare, il tavolo non deve accorciarsi sotto la misura finale, e alla fine non restano stili.
async function provaPortfolio(page, nome, passi) {
  await page.evaluate(() => document.querySelector('.mo-pf-board').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(2800); // i lavori «cadono sul tavolo» quando compare la sezione
  const problemi = [];
  const sel = (a) => (a === 'grid' || a === 'chaos' ? `.mo-pf-mode [data-mode="${a}"]` : `.mo-pf-filter [data-filter="${a}"]`);
  const foto = () => page.evaluate(() => {
    const b = document.querySelector('.mo-pf-board');
    return { h: b.offsetHeight, cards: [...b.querySelectorAll('.mo-pf-card')].map((c) => { const cs = getComputedStyle(c); const vis = cs.display !== 'none'; return { vis, w: c.offsetWidth, h: c.offsetHeight, o: vis ? +cs.opacity : 0 }; }) };
  });
  for (const passo of passi) {
    const rapidi = Array.isArray(passo);
    if (rapidi) {
      for (const a of passo) { await page.click(sel(a)); await page.waitForTimeout(90); }
    } else {
      const prima = await foto();
      const campioni = page.evaluate(() => new Promise((ok) => {
        const b = document.querySelector('.mo-pf-board'); const out = []; const t0 = performance.now();
        const giro = () => {
          out.push({ h: b.getBoundingClientRect().height, cards: [...b.querySelectorAll('.mo-pf-card')].map((c) => { const cs = getComputedStyle(c); return cs.display === 'none' ? null : { w: c.offsetWidth, h: c.offsetHeight, o: +cs.opacity }; }) });
          if (performance.now() - t0 < 1300) requestAnimationFrame(giro); else ok(out);
        };
        requestAnimationFrame(giro);
      }));
      await page.click(sel(passo));
      const fr = await campioni;
      await page.waitForTimeout(250);
      const dopo = await foto();
      const bw = await page.evaluate(() => document.querySelector('.mo-pf-board').clientWidth);
      const maxW = Math.max(...prima.cards.concat(dopo.cards).filter((c) => c.vis).map((c) => c.w)) * 1.05;
      const maxH = Math.max(...prima.cards.concat(dopo.cards).filter((c) => c.vis).map((c) => c.h)) * 1.1;
      const hMin = Math.min(prima.h, dopo.h) - 2;
      fr.forEach((f, k) => {
        if (f.h < hMin) problemi.push(`${passo}: tavolo ${Math.round(f.h)}px (min ${hMin})`);
        f.cards.forEach((c, i) => {
          if (!c) return;
          if (c.w > maxW) problemi.push(`${passo}: card ${i} larga ${c.w}px (max ${Math.round(maxW)}, tavolo ${bw})`);
          if (c.h > maxH) problemi.push(`${passo}: card ${i} alta ${c.h}px (max ${Math.round(maxH)})`);
          const oMax = Math.max(prima.cards[i].o, dopo.cards[i].o) + 0.03;
          if (c.o > oMax) problemi.push(`${passo}: card ${i} lampeggia (opacità ${c.o.toFixed(2)}, max ${oMax.toFixed(2)})`);
        });
      });
    }
    await page.waitForTimeout(rapidi ? 1600 : 0);
    // Stato finale coerente con modo e filtro scelti
    const fine = await page.evaluate(() => {
      const b = document.querySelector('.mo-pf-board');
      const modo = b.classList.contains('mo-is-grid') ? 'grid' : 'chaos';
      const filtro = document.querySelector('.mo-pf-filter [aria-pressed="true"]').dataset.filter;
      const err = [];
      if (b.style.height && b.querySelectorAll('.mo-pf-card').length <= 8) err.push(`altezza del tavolo rimasta ${b.style.height}`);
      b.querySelectorAll('.mo-pf-card').forEach((c, i) => {
        const cs = getComputedStyle(c); const ok = filtro === 'all' || c.dataset.cat === filtro;
        if (c.style.width || c.style.height || c.style.opacity) err.push(`card ${i}: stili rimasti`);
        if (modo === 'grid' && ok && (cs.display === 'none' || +cs.opacity < 0.99)) err.push(`card ${i}: dovrebbe vedersi`);
        if (modo === 'grid' && !ok && cs.display !== 'none') err.push(`card ${i}: dovrebbe essere nascosta`);
        const m = cs.transform === 'none' ? [1, 0, 0, 1, 0, 0] : cs.transform.replace(/^matrix\(|\)$/g, '').split(',').map(Number);
        const dritta = Math.abs(m[0] - 1) < 0.01 && Math.abs(m[1]) < 0.01 && Math.abs(m[2]) < 0.01 && Math.abs(m[3] - 1) < 0.01 && Math.abs(m[4]) < 1 && Math.abs(m[5]) < 1;
        if (modo === 'grid' && ok && !dritta) err.push(`card ${i}: ruotata o spostata (${cs.transform})`);
        if (modo === 'chaos' && Math.abs(+cs.opacity - (ok ? 1 : 0.14)) > 0.02) err.push(`card ${i}: opacità ${cs.opacity}`);
      });
      return err;
    });
    fine.forEach((e) => problemi.push(`${rapidi ? passo.join('+') : passo} → ${e}`));
  }
  check(`Portfolio ${nome}: nessuna card allargata, allungata o lampeggiante, stato finale giusto`, problemi.length === 0, problemi.slice(0, 4).join(' · ') || `${passi.length} passaggi`);
}
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errori = []; page.on('pageerror', (e) => errori.push(e.message));
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  await provaPortfolio(page, 'desktop', ['branding', 'grid', 'web', 'all', 'social', 'chaos', 'stampa', 'all', 'grid', 'chaos', 'web', 'grid', ['chaos', 'branding', 'grid', 'all', 'chaos', 'social']]);
  // Frecce della scheda progetto: con un filtro passano solo tra i progetti visibili
  await page.click('.mo-pf-mode [data-mode="grid"]'); await page.waitForTimeout(1300);
  await page.click('.mo-pf-filter [data-filter="web"]'); await page.waitForTimeout(1300);
  const visti = [];
  await page.locator('.mo-pf-card:not(.mo-is-out)').first().click(); await page.waitForTimeout(1000);
  for (let k = 0; k < 3; k++) { visti.push(await page.evaluate(() => document.querySelector('.mo-pfm-cat').textContent)); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(600); }
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  check('Scheda progetto: con il filtro «Web» le frecce restano sui lavori web', visti.every((t) => /^Web/.test(t)), visti.join(' | '));
  check('Portfolio: nessun errore nella console', errori.length === 0, errori.join(' | '));
  await page.close();
}
{
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  await provaPortfolio(page, 'mobile', ['web', 'all', 'chaos', 'branding', 'grid', 'all']);
  await ctx.close();
}

/* ---------------- Carosello progetti e pagine dei progetti ---------------- */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errori = []; page.on('pageerror', (e) => errori.push(e.message));
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  const vai = async () => { await page.evaluate(() => document.querySelector('.mo-car-stage').scrollIntoView({ block: 'center' })); await page.waitForTimeout(2600); };
  await vai();
  const stato = () => page.evaluate(() => {
    const st = document.querySelector('.mo-car-stage').getBoundingClientRect();
    const att = document.querySelector('.mo-car-card.mo-is-active');
    const r = att.getBoundingClientRect();
    const larghe = [...document.querySelectorAll('.mo-car-card:not([hidden])')].map((c) => c.getBoundingClientRect().width);
    return { treD: document.querySelector('.mo-car').classList.contains('mo-car--3d'), nome: att.dataset.nome, info: document.querySelector('.mo-car-name').textContent, num: document.querySelector('.mo-car-count').textContent.replace(/\s/g, ''), centro: Math.round(r.left + r.width / 2 - (st.left + st.width / 2)), piuGrande: Math.max(...larghe) <= r.width + 1, url: location.pathname, trans: getComputedStyle(att).transitionDuration };
  });
  const s0 = await stato();
  check('Carosello: 3D, la card attiva è al centro e in primo piano', s0.treD && Math.abs(s0.centro) <= 2 && s0.piuGrande && s0.info === s0.nome && s0.num === '01/08', JSON.stringify(s0));
  check('Carosello: le regole del tema non rallentano le card', s0.trans === '0s', s0.trans);
  await page.click('.mo-car-next'); await page.waitForTimeout(900);
  const s1 = await stato();
  check('Carosello: freccia → passa al progetto successivo', s1.nome !== s0.nome && s1.num === '02/08' && Math.abs(s1.centro) <= 2, `${s0.nome} → ${s1.nome} ${s1.num}`);
  // Trascinamento verso sinistra: avanza di uno o due, senza aprire la pagina
  const box = await page.locator('.mo-car-stage').boundingBox();
  await page.mouse.move(box.x + box.width / 2 + 150, box.y + box.height / 2);
  await page.mouse.down();
  for (let k = 1; k <= 12; k++) { await page.mouse.move(box.x + box.width / 2 + 150 - k * 22, box.y + box.height / 2); await page.waitForTimeout(16); }
  await page.mouse.up();
  await page.waitForTimeout(1100);
  const s2 = await stato();
  check('Carosello: trascinando cambia progetto e non apre la pagina', s2.nome !== s1.nome && s2.url === s1.url && Math.abs(s2.centro) <= 2, `${s1.nome} → ${s2.nome}`);
  // Clic su una card laterale: viene al centro
  const laterale = await page.evaluate(() => { const a = document.querySelector('.mo-car-card.mo-is-active'); const cs = [...document.querySelectorAll('.mo-car-card:not([hidden])')]; const i = cs.indexOf(a); const c = cs[(i + 1) % cs.length]; const r = c.getBoundingClientRect(); return { nome: c.dataset.nome, x: r.right - 30, y: r.top + r.height / 2 }; });
  await page.mouse.click(laterale.x, laterale.y); await page.waitForTimeout(1100);
  const s3 = await stato();
  check('Carosello: clic su una card di lato la porta al centro', s3.nome === laterale.nome && s3.url === s2.url, `${s3.nome} (atteso ${laterale.nome})`);
  // Tastiera
  await page.focus('.mo-car-card.mo-is-active');
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(900);
  const s4 = await stato();
  const fuoco = await page.evaluate(() => document.activeElement.classList.contains('mo-is-active'));
  check('Carosello: con la tastiera (frecce) e il fuoco segue la card', s4.nome !== s3.nome && fuoco, s4.nome);
  // Filtro Web
  await page.click('.mo-car-filter [data-filter="web"]'); await page.waitForTimeout(1500);
  const f = await page.evaluate(() => ({ vis: [...document.querySelectorAll('.mo-car-card:not([hidden])')].map((c) => c.dataset.cat), num: document.querySelector('.mo-car-count').textContent.replace(/\s/g, '') }));
  check('Carosello: filtro «Web» mostra solo i lavori web', f.vis.length > 0 && f.vis.every((c) => c === 'web') && f.num === `01/${String(f.vis.length).padStart(2, '0')}`, `${f.vis.join(',')} ${f.num}`);
  await page.click('.mo-car-filter [data-filter="all"]'); await page.waitForTimeout(1500);
  // Clic sulla card al centro: apre la pagina del progetto
  const atteso = (await stato()).nome;
  await page.locator('.mo-car-card.mo-is-active').click();
  await page.waitForURL(/\/progetti\/[^/]+\/$/, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1200);
  const pg = await page.evaluate(() => ({
    url: location.pathname, h1: document.querySelector('h1')?.textContent.trim(), cover: !!document.querySelector('.mo-prj-cover img'),
    menu: [...document.querySelectorAll('.mo-nav a')].map((a) => a.getAttribute('href')), logo: document.querySelector('.mo-logo').getAttribute('href'),
    cta: document.querySelector('.mo-prj-cta .mo-btn').getAttribute('href'), loader: document.documentElement.classList.contains('mo-is-loading'),
    back: document.querySelector('.mo-prj-back').getAttribute('href'),
  }));
  check('Clic sul progetto al centro: si apre la sua pagina', /\/progetti\/[^/]+\/$/.test(pg.url) && pg.h1 === atteso && pg.cover, `${pg.url} · ${pg.h1}`);
  check('Pagina progetto: menu, logo e pulsante portano alla home', pg.menu.length > 0 && pg.menu.every((h) => /\/nuovo\/#/.test(h)) && /\/nuovo\/$/.test(pg.logo) && /\/nuovo\/#contatti$/.test(pg.cta) && /\/progetti\/$/.test(pg.back), JSON.stringify({ menu: pg.menu[0], logo: pg.logo, cta: pg.cta }));
  check('Pagina progetto: niente schermata di caricamento', !pg.loader);
  const bordo = await page.evaluate(() => { const n = document.querySelector('.mo-prj-near'); const t = document.querySelector('.mo-prj-block h2'); return n && t ? { b: getComputedStyle(n).borderTopColor, w: getComputedStyle(n).borderTopWidth, t: getComputedStyle(t).color } : null; });
  check('Pagina progetto: box precedente/successivo con bordo di 1px come «La richiesta»', bordo && bordo.w === '1px' && bordo.b === bordo.t, JSON.stringify(bordo));
  const fascia = await page.evaluate(() => { const n = document.querySelector('.mo-prj-nav'); const c = document.querySelector('.mo-prj-cta'); return { bg: getComputedStyle(n).backgroundColor, stacco: Math.round(c.getBoundingClientRect().top - n.getBoundingClientRect().bottom) }; });
  check('Pagina progetto: fascia nera al 20% dietro i progetti vicini, attaccata all’invito finale', fascia.bg === 'rgba(0, 0, 0, 0.2)' && fascia.stacco === 0, JSON.stringify(fascia));
  // Pagina Progetti: filtri e link
  await page.goto(URL + 'progetti/', { waitUntil: 'load' }); await page.waitForTimeout(1500);
  const tutte = await page.locator('.mo-prjs-card').count();
  await page.click('.mo-prjs-filter [data-filter="branding"]'); await page.waitForTimeout(800);
  const br = await page.evaluate(() => [...document.querySelectorAll('.mo-prjs-card')].filter((c) => getComputedStyle(c).display !== 'none').map((c) => c.dataset.cat));
  check('Pagina Progetti: tutti i lavori e filtro «Branding»', tutte === 8 && br.length > 0 && br.every((c) => c === 'branding'), `${tutte} · ${br.join(',')}`);
  // Sfumatura della parte alta: prosegue sotto il contenuto e il contenuto non si sposta
  const sf = await page.evaluate(async () => {
    const h = document.querySelector('.mo-prjs-head'); const f = document.querySelector('.mo-prjs-filter');
    const y0 = f.getBoundingClientRect().top + scrollY; const b0 = h.getBoundingClientRect().bottom + scrollY;
    h.classList.add('mo-sfuma'); h.style.setProperty('--mo-sfumatura', '200px');
    await new Promise((r) => requestAnimationFrame(r));
    const y1 = f.getBoundingClientRect().top + scrollY;
    const fondo = getComputedStyle(h, '::before'); const giu = parseFloat(fondo.bottom);
    const maschera = ['mask-image', '-webkit-mask-image'].map((k) => fondo.getPropertyValue(k)).find((v) => v && v !== 'none') || 'none';
    h.classList.remove('mo-sfuma'); h.style.removeProperty('--mo-sfumatura');
    return { sposta: Math.round(y1 - y0), giu, maschera };
  });
  check('Sfumatura: la parte alta prosegue 200 px sotto il contenuto, che non si sposta', sf.sposta === 0 && sf.giu === -200 && /gradient/.test(sf.maschera), JSON.stringify({ sposta: sf.sposta, giu: sf.giu, maschera: sf.maschera.slice(0, 30) }));
  const ctaP = await page.evaluate(() => getComputedStyle(document.querySelector('.mo-prjs .mo-prj-cta')).backgroundImage);
  check('Pagina Progetti: invito finale con nero al 20% sopra il blu', /rgba\(0, 0, 0, 0\.2\)/.test(ctaP), ctaP.slice(0, 60));
  await page.locator('.mo-prjs-card:visible').first().click(); await page.waitForTimeout(1200);
  check('Pagina Progetti: la card apre il progetto', /\/progetti\/[^/]+\/$/.test(new globalThis.URL(page.url()).pathname), page.url());
  check('Carosello e pagine dei progetti: nessun errore nella console', errori.length === 0, errori.join(' | '));
  await page.close();
}
{
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  await page.evaluate(() => document.querySelector('.mo-car-stage').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(2600);
  const m = await page.evaluate(() => {
    const r = document.querySelector('.mo-car-card.mo-is-active').getBoundingClientRect();
    const b = [document.querySelector('.mo-car-prev'), document.querySelector('.mo-car-next')].map((x) => x.getBoundingClientRect());
    return { centro: Math.round(r.left + r.width / 2 - innerWidth / 2), dentro: r.left >= 0 && r.right <= innerWidth, frecce: b.every((x) => x.left >= 0 && x.right <= innerWidth && x.width >= 44), scroll: document.documentElement.scrollWidth <= innerWidth };
  });
  check('Carosello su telefono: card al centro, frecce comode, niente scorrimento laterale', Math.abs(m.centro) <= 2 && m.dentro && m.frecce && m.scroll, JSON.stringify(m));
  await page.goto(URL + 'progetti/forno-aurora/', { waitUntil: 'load' }); await page.waitForTimeout(1000);
  const w = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  check('Pagina progetto su telefono: niente scorrimento laterale', w);
  await ctx.close();
}

/* ---------------- Movimento ridotto ---------------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => ({
    loading: document.documentElement.classList.contains('mo-is-loading'),
    hscroll: document.documentElement.classList.contains('mo-h-scroll'),
    sub: getComputedStyle(document.querySelector('.mo-hero-sub')).opacity,
    gar: getComputedStyle(document.querySelector('.mo-gar-card')).opacity,
  }));
  check('Movimento ridotto: niente caricamento, contenuti visibili, niente scorrimento bloccato', !r.loading && !r.hscroll && r.sub === '1' && r.gar === '1', JSON.stringify(r));
  const car = await page.evaluate(() => ({ treD: document.querySelector('.mo-car').classList.contains('mo-car--3d'), scorre: getComputedStyle(document.querySelector('.mo-car-track')).overflowX, op: getComputedStyle(document.querySelector('.mo-car-card')).opacity }));
  check('Movimento ridotto: il carosello diventa una fila da scorrere', !car.treD && car.scorre === 'auto' && car.op === '1', JSON.stringify(car));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} controlli superati`);
process.exit(failed.length ? 1 : 0);
