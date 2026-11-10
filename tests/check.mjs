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

  // Hero a immagini: la prima foto composta, nessuna tessera rimasta, settori e pausa presenti
  const h0 = await page.evaluate(() => ({
    on: [...document.querySelectorAll('.mo-hs-slide')].findIndex((x) => x.classList.contains('mo-is-on')),
    tessere: document.querySelectorAll('.mo-hs-tile').length,
    settori: document.querySelectorAll('.mo-hs-dot').length,
    pausa: !!document.querySelector('.mo-hs-pausa'),
    titolo: getComputedStyle(document.querySelector('.mo-hw-in')).transform,
  }));
  check('Hero: prima immagine composta, titolo visibile, settori e pausa', h0.on === 0 && h0.tessere === 0 && h0.settori >= 2 && h0.pausa && /none|matrix\(1, 0, 0, 1, 0, 0\)/.test(h0.titolo), JSON.stringify(h0));
  // Clic su un settore: la foto nuova si compone a tessere, poi resta solo lei
  await page.click('.mo-hs-dot[data-i="1"]');
  await page.waitForTimeout(500);
  const h1 = await page.evaluate(() => document.querySelectorAll('.mo-hs-tile').length);
  await page.waitForTimeout(1800);
  const h2 = await page.evaluate(() => ({ on: [...document.querySelectorAll('.mo-hs-slide')].findIndex((x) => x.classList.contains('mo-is-on')), tessere: document.querySelectorAll('.mo-hs-tile').length, dot: [...document.querySelectorAll('.mo-hs-dot')].findIndex((d) => d.classList.contains('mo-is-on')) }));
  check('Hero: clic su un settore → la foto si compone pixel dopo pixel', h1 > 20 && h2.on === 1 && h2.dot === 1 && h2.tessere === 0, `${h1} tessere · ${JSON.stringify(h2)}`);
  // Le tessere ricompongono la foto esattamente come la foto ferma (nessuno scatto alla fine)
  const alli = await page.evaluate(async () => {
    const sec = document.querySelector('.mo-hero');
    document.querySelector('.mo-hs-dot[data-i="0"]').click();
    await new Promise((r) => setTimeout(r, 2200));
    const img = document.querySelector('.mo-hs-slide.mo-is-on img');
    return { w: Math.round(img.getBoundingClientRect().width), sec: sec.clientWidth };
  });
  check('Hero: la foto copre tutta la larghezza', alli.w >= alli.sec, JSON.stringify(alli));
  // Pausa: la barra si ferma
  await page.click('.mo-hs-pausa');
  const b1 = await page.evaluate(() => getComputedStyle(document.querySelector('.mo-hs-dot.mo-is-on .mo-hs-bar b')).transform);
  await page.waitForTimeout(1200);
  const b2 = await page.evaluate(() => getComputedStyle(document.querySelector('.mo-hs-dot.mo-is-on .mo-hs-bar b')).transform);
  const premuto = await page.evaluate(() => document.querySelector('.mo-hs-pausa').getAttribute('aria-pressed'));
  check('Hero: il pulsante pausa ferma lo scorrimento', b1 === b2 && premuto === 'true', `${b1} → ${b2}`);
  await page.click('.mo-hs-pausa');

  // Pausa emozionale: la foto si apre scorrendo, senza bloccare la pagina, ed è aperta del tutto al centro dello schermo
  const emo = await page.evaluate(() => {
    const s = document.querySelector('.mo-emo');
    return { bloccata: s.parentElement.classList.contains('pin-spacer'), top: s.getBoundingClientRect().top + scrollY, h: s.offsetHeight };
  });
  await smoothScroll(page, emo.top - 900 + 60);
  await page.waitForTimeout(900);
  const aperturaInizio = await page.evaluate(() => getComputedStyle(document.querySelector('.mo-emo-frame')).clipPath);
  await smoothScroll(page, emo.top + emo.h / 2 - 450);
  await page.waitForTimeout(1200);
  const aperturaCentro = await page.evaluate(() => getComputedStyle(document.querySelector('.mo-emo-frame')).clipPath);
  const raggio = (c) => parseFloat((/circle\(([\d.]+)%/.exec(c) || [])[1] || 'NaN');
  check('Pausa: la foto inizia ad aprirsi appena compare e finisce al centro, senza blocco', !emo.bloccata && raggio(aperturaInizio) < 30 && raggio(aperturaCentro) >= 79, `${aperturaInizio} → ${aperturaCentro}`);

  // Bug: animazioni delle Garanzie già concluse su desktop
  const garTop = await topOf(page, '.mo-gar');
  await smoothScroll(page, garTop - 900 + 40);
  const early = await page.evaluate(() => document.querySelector('.mo-gar-art').classList.contains('mo-is-done'));
  check('Scudo non ancora completo quando le Garanzie entrano nello schermo', !early);
  await smoothScroll(page, garTop + 200);
  const done = await page.evaluate(() => document.querySelector('.mo-gar-art').classList.contains('mo-is-done'));
  check('Scudo completo quando è al centro dello schermo', done);

  // Le card 3D del carosello passano sotto l'header, mai sopra
  const carTop = await topOf(page, '.mo-car-stage');
  await smoothScroll(page, carTop + 80);
  await page.waitForTimeout(1500);
  const sotto = await page.evaluate(() => {
    const hdr = document.querySelector('.mo-site-header').getBoundingClientRect();
    const att = document.querySelector('.mo-car-card.mo-is-active').getBoundingClientRect();
    const x = att.left + att.width / 2, y = hdr.bottom - 10;
    return { copre: att.top < y, header: !!document.elementFromPoint(x, y)?.closest('.mo-site-header') };
  });
  check('Carosello: le card passano sotto l’header', sotto.copre && sotto.header, JSON.stringify(sotto));

  // Bug: header senza sfondo in fondo alla pagina
  await smoothScroll(page, await page.evaluate(() => document.documentElement.scrollHeight));
  const hdr = await page.evaluate(() => { const cs = getComputedStyle(document.querySelector('.mo-site-header')); return { scrolled: document.documentElement.classList.contains('mo-scrolled'), bg: cs.backgroundColor, blur: cs.backdropFilter }; });
  check('Header con sfondo anche in fondo alla pagina', hdr.scrolled && hdr.bg !== 'rgba(0, 0, 0, 0)', JSON.stringify(hdr));
  check('Header quando scorri: sfondo un po’ trasparente e sfocatura 6.5px', hdr.blur === 'blur(6.5px)' && /(rgba|color)\(.*0\.8\d?\)|\/ 0\.8/.test(hdr.bg), `${hdr.bg} · ${hdr.blur}`);
  // Ancore nella pagina (pulsanti «#sezione»): la sezione si ferma subito sotto l'header (quelle bloccate a filo dello schermo)
  const arrivi = {};
  for (const [sel, id] of [['.mo-header-cta', 'contatti'], ['.mo-hero-actions a', 'servizi']]) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    await page.click(sel);
    await page.waitForTimeout(2600);
    arrivi[id] = await page.evaluate((id) => Math.round(document.getElementById(id).getBoundingClientRect().top - (document.getElementById(id).hasAttribute('data-mo-pin') ? 0 : document.querySelector('.mo-site-header').offsetHeight)), id);
  }
  check('Ancore: ogni sezione si ferma subito sotto l’header', Object.values(arrivi).every((v) => Math.abs(v) <= 2), JSON.stringify(arrivi));

  // Bug: testo a solo contorno non usato
  const stroke = await page.evaluate(() => [...document.querySelectorAll('.mo-mq-item')].some((el) => parseFloat(getComputedStyle(el).webkitTextStrokeWidth) > 0));
  check('Nessuna parola a solo contorno', !stroke);

  const alts = await page.evaluate(() => [...document.querySelectorAll('main img')].filter((i) => i.getAttribute('alt') === null).length);
  check('Ogni immagine ha il testo alternativo', alts === 0, `${alts} senza alt`);
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

  { const veri = errors.filter((m) => !/Transition was aborted because of invalid state/.test(m)); check('Nessun errore nella console (desktop)', veri.length === 0, veri.join(' | ')); }
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

  // Filtri del portfolio su una riga (scorrono di lato) su mobile
  const filt = await page.evaluate(() => {
    const bs = [...document.querySelectorAll('.mo-car-filter button')];
    return new Set(bs.map((b) => b.offsetTop)).size;
  });
  check('Filtri del portfolio su una riga', filt === 1, `${filt} righe`);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.tap('.mo-menu-btn');
  await page.waitForTimeout(900);
  const mm = await page.evaluate(() => ({ open: !document.getElementById('mo-mobile-menu').hidden, links: document.querySelectorAll('#mo-mobile-menu .mo-mm-link').length }));
  check('Menu mobile si apre con le voci', mm.open && mm.links > 0, JSON.stringify(mm));
  const sotto = await page.evaluate(() => document.querySelectorAll('#mo-mobile-menu .mo-mm-sub').length);
  check('Menu mobile: i servizi sotto la voce Servizi', sotto >= 5, `${sotto} servizi`);
  await page.tap('#mo-mobile-menu .mo-mm-sub >> nth=0');
  await page.waitForURL(/\/servizi\/[^/]+\/$/, { timeout: 8000 }).catch(() => {});
  check('Toccando un servizio si apre la sua pagina', /\/servizi\/[^/]+\/$/.test(new globalThis.URL(page.url()).pathname), page.url());
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(2500);

  const sopra = await page.evaluate(() => {
    const bar = document.querySelector('.mo-mbar').getBoundingClientRect().height;
    const emo = document.querySelector('.mo-emo'), testo = document.querySelector('.mo-emo-text');
    const nav = document.querySelector('.mo-hs-nav'), hero = document.querySelector('.mo-hero');
    return {
      pausa: Math.round(emo.getBoundingClientRect().bottom - testo.getBoundingClientRect().bottom - bar),
      hero: nav ? Math.round(hero.getBoundingClientRect().bottom - nav.getBoundingClientRect().bottom - bar) : 0,
    };
  });
  check('Telefono: frase della Pausa e settori della hero sopra la barra dei contatti', sopra.pausa > 0 && sopra.hero > 0, JSON.stringify(sopra));
  check('Barra contatti in basso visibile su mobile', await page.evaluate(() => getComputedStyle(document.querySelector('.mo-mbar')).display === 'flex'));
  check('Nessun cursore personalizzato al tocco', !(await page.evaluate(() => document.documentElement.classList.contains('mo-has-cursor'))));
  { const veri = errors.filter((m) => !/Transition was aborted because of invalid state/.test(m)); check('Nessun errore nella console (mobile)', veri.length === 0, veri.join(' | ')); }
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
      // (si misura con il nastro in vista: fuori dallo schermo non viene ridisegnato)
      await page.evaluate(() => window.scrollTo(0, document.querySelector('.mo-marquee').offsetTop - 200));
      await page.waitForTimeout(400);
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
        statement: css('.mo-gar .mo-statement', 'color'),
        ctText: css('.mo-ct-text', 'color'),
        secTitle: css('.mo-cb .mo-sec-title', 'color'),
        siQ: css('.mo-si-q', 'color'),
      },
      campi: [...document.querySelectorAll('.mo-ct-form .mo-fld :is(input,select,textarea)')].map((e) => getComputedStyle(e).backgroundColor),
      spazi: blocks.slice(1).map((b, i) => Math.round(b.top - blocks[i].bottom)),
      sfondoBody: getComputedStyle(document.body).backgroundColor,
      lineaNastro: getComputedStyle(document.querySelector('.mo-marquee')).borderBottomWidth,
    };
  });
  check('Stili di Porto caricati come file: esclusi', !r.portoFile);
  const atteso = { garSub: 'rgb(51,65,85)', heroSub: 'rgb(226,232,240)', statement: 'rgb(15,23,42)', ctText: 'rgb(203,213,225)', secTitle: 'rgb(15,23,42)', siQ: 'rgb(15,23,42)' };
  const sbagliati = Object.entries(atteso).filter(([k, v]) => rgb(r.colori[k] || '') !== v).map(([k]) => `${k}=${r.colori[k]}`);
  check('Colori dei testi del prototipo, non quelli del tema', !sbagliati.length, sbagliati.join(' '));
  check('Campi del modulo tutti con sfondo scuro', r.campi.length >= 4 && r.campi.every((c) => rgb(c) === 'rgb(24,35,67)'), [...new Set(r.campi)].join(' | '));
  check('Nessuno spazio tra una sezione e l’altra', r.spazi.every((g) => g === 0), r.spazi.join(','));
  const pin = await page.evaluate(() => { const sp = document.querySelector('.mo-svc')?.parentElement; return sp && sp.classList.contains('pin-spacer') ? parseFloat(getComputedStyle(sp).paddingBottom) : -1; });
  check('Servizi: lo spazio per lo scorrimento bloccato resta', pin > 500, `${pin}px`);
  check('Nessuna linea sotto il nastro', r.lineaNastro === '0px', r.lineaNastro);
  check('Sfondo della pagina del sito, non del tema', rgb(r.sfondoBody) === 'rgb(255,255,255)', r.sfondoBody);
  // Pulsante al passaggio del mouse: testo bianco e niente sottolineatura
  await page.hover('.mo-header-cta');
  await page.waitForTimeout(400);
  const hov = await page.evaluate(() => { const s = getComputedStyle(document.querySelector('.mo-header-cta')); return { c: s.color, d: s.textDecorationLine }; });
  check('Pulsante leggibile al passaggio del mouse', rgb(hov.c) === 'rgb(255,255,255)' && hov.d === 'none', JSON.stringify(hov));
  // «Chi siamo» lungo (elemento ancora disponibile, provato nella sua pagina di prova)
  await page.goto(URL + 'prova-chi-siamo/', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const cs = await page.evaluate(() => ({ p: getComputedStyle(document.querySelector('.mo-about-p')).color, r: getComputedStyle(document.querySelector('.mo-r-tint p')).color }));
  check('Chi siamo (lungo): colori dei testi del prototipo', rgb(cs.p) === 'rgb(51,65,85)' && rgb(cs.r) === 'rgb(51,65,85)', JSON.stringify(cs));
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
      const pf = document.getElementById('pf2'), gar2 = document.querySelectorAll('.mo-gar')[1];
      const st = (el, p) => getComputedStyle(el)[p];
      return {
        coloreLivello: st(pf.querySelector(':scope > .mo-bg--colore'), 'backgroundColor'),
        titoloPf: st(pf.querySelector('.mo-statement'), 'color'),
        istruzioniPf: st(pf.querySelector('.mo-car-sub'), 'color'),
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
      return { titolo: st('.mo-statement'), testo: st('.mo-car-sub'), etichetta: st('.mo-overline-h2'), attivoFondo: cs.backgroundColor, attivoTesto: cs.color };
    });
    check('Colori dei testi scelti a mano (titoli, testi, etichette)', rgb(m.titolo) === 'rgb(124,45,18)' && rgb(m.testo) === 'rgb(67,20,7)' && rgb(m.etichetta) === 'rgb(29,78,216)', JSON.stringify(m));
    check('Colori a mano: i pulsanti selezionati restano leggibili', rgb(m.attivoFondo) === 'rgb(15,23,42)' && rgb(m.attivoTesto) === 'rgb(255,255,255)', `${m.attivoFondo} ${m.attivoTesto}`);
    check('Card scure con testi chiari', rgb(c.cardGar) === 'rgb(15,23,42)' && rgb(c.titoloCard) === 'rgb(248,250,252)', `${c.cardGar} ${c.titoloCard}`);
    await page.screenshot({ path: process.env.SCREEN_DIR ? process.env.SCREEN_DIR + '/prova-sfondo.png' : '/dev/null' }).catch(() => {});
  } else {
    console.log('… pagina "prova-sfondo" assente: controlli sullo sfondo saltati');
  }
  await page.close();
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
  check('Pagina progetto: menu verso le pagine, logo verso la home, pulsante verso Contatti', pg.menu.length > 0 && pg.menu.every((h) => /^https?:\/\//.test(h)) && /\/nuovo\/$/.test(pg.logo) && /\/nuovo\/contatti\/$/.test(pg.cta) && /\/progetti\/$/.test(pg.back), JSON.stringify({ menu: pg.menu[0], logo: pg.logo, cta: pg.cta }));
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
  // Avviso interno di Chrome quando il browser dei test cambia pagina durante il passaggio animato (View Transitions):
  // non è un errore del sito e chi naviga non vede differenze, quindi si ignora solo questo messaggio
  const veri = errori.filter((m) => !/Transition was aborted because of invalid state/.test(m));
  check('Carosello e pagine dei progetti: nessun errore nella console', veri.length === 0, veri.join(' | '));
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

/* ---------------- Home leggera, pagine Chi sono / Servizi / Contatti, menu a tendina ---------------- */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errori = []; page.on('pageerror', (e) => errori.push(e.message));
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const h = await page.evaluate(() => ({
    breve: !!document.querySelector('.mo-cb'), lungo: !!document.querySelector('.mo-about'), situazioni: document.querySelectorAll('.mo-si-card').length,
    scopri: [...document.querySelectorAll('.mo-svc-more')].map((a) => new URL(a.href).pathname), app: /App WebView/i.test(document.body.textContent),
  }));
  check('Home leggera: «Chi sono» breve al posto di quello lungo, «Non sai da dove partire?»', h.breve && !h.lungo && h.situazioni >= 3, JSON.stringify({ breve: h.breve, lungo: h.lungo, situazioni: h.situazioni }));
  check('Servizi: «Scopri di più» verso la pagina di ogni servizio, App WebView tolta', h.scopri.length === 5 && h.scopri.every((u) => /\/nuovo\/servizi\/[^/]+\/$/.test(u)) && !h.app, h.scopri.join(' '));
  // Menu a tendina
  await page.hover('.mo-nav-item > a');
  await page.waitForTimeout(500);
  const sub = await page.evaluate(() => { const s = document.querySelector('.mo-sub'); return { vis: getComputedStyle(s).visibility, n: s.querySelectorAll('a').length }; });
  check('Menu: i servizi compaiono a tendina sotto «Servizi»', sub.vis === 'visible' && sub.n === 5, JSON.stringify(sub));
  // «Chiedimi un consiglio» nella home: il messaggio è già scritto nel modulo
  await page.evaluate(() => document.querySelector('.mo-si').scrollIntoView());
  await page.waitForTimeout(1200);
  await page.locator('.mo-si-btn').first().click();
  await page.waitForTimeout(2200);
  const f1 = await page.evaluate(() => ({ msg: document.querySelector('#mo-f-msg').value, area: document.querySelector('#mo-f-area').value }));
  check('«Chiedimi un consiglio»: messaggio e scelta già pronti nel modulo', /Apro una nuova attività/.test(f1.msg) && /consigliami/i.test(f1.area), JSON.stringify(f1));
  // Pagina Chi sono
  await page.goto(URL + 'chi-sono/', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const cs = await page.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent.trim(), sezioni: [...document.querySelectorAll('[data-mo-block]')].map((s) => s.getAttribute('data-mo-block')),
    marginNum: getComputedStyle(document.querySelector('.mo-num-n')).marginTop, cta: document.querySelector('.mo-header-cta').getAttribute('href'),
    attiva: document.querySelector('.mo-nav a.mo-is-active')?.textContent.trim(),
  }));
  check('Pagina Chi sono: titolo e sezioni (numeri, punti di forza, passi, lavori, recensioni, invito)', /25 anni/.test(cs.h1 || '') && ['numeri', 'punti', 'passi', 'lavori', 'recensioni', 'invito'].every((k) => cs.sezioni.includes(k)) && cs.marginNum === '0px', JSON.stringify(cs));
  check('Fuori dalla home: «Richiedi Preventivo» porta alla pagina Contatti e la voce del menu è evidenziata', /\/nuovo\/contatti\/$/.test(cs.cta) && cs.attiva === 'Chi sono', `${cs.cta} · ${cs.attiva}`);
  // Pagina di un servizio, domande frequenti
  await page.goto(URL + 'servizi/grafica/', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const sv = await page.evaluate(() => ({ h1: document.querySelector('h1')?.textContent.trim(), voci: document.querySelectorAll('.mo-el-voci li').length, lavori: document.querySelectorAll('.mo-lv .mo-prjs-card').length, faq: document.querySelectorAll('.mo-fq-item').length }));
  await page.locator('.mo-fq-item summary').first().click();
  const aperta = await page.evaluate(() => document.querySelector('.mo-fq-item').open);
  check('Pagina servizio: titolo, elenco, lavori di quell’area, domande che si aprono', /Pescara/.test(sv.h1 || '') && sv.voci > 8 && sv.lavori >= 1 && sv.faq >= 3 && aperta, JSON.stringify(sv));
  // «Chiedimi un consiglio» dalla pagina Servizi: porta alla pagina Contatti con il messaggio pronto
  await page.goto(URL + 'servizi/', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.querySelector('.mo-si').scrollIntoView());
  await page.waitForTimeout(800);
  await page.locator('.mo-si-btn').nth(1).click();
  await page.waitForURL(/\/contatti\/$/, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const f2 = await page.evaluate(() => ({ url: location.pathname, msg: document.querySelector('#mo-f-msg')?.value }));
  check('«Chiedimi un consiglio» da un’altra pagina: pagina Contatti con il messaggio pronto', /\/contatti\/$/.test(f2.url) && /Voglio più clienti/.test(f2.msg || ''), JSON.stringify(f2));
  // Intestazione con sfumatura: la sezione dopo è «aperta» (la sfumatura passa sotto i suoi testi); invito con testi scuri
  await page.goto(URL + 'prova-sfumatura/', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const sf = await page.evaluate(() => {
    const pt = document.querySelector('.mo-pt'), iv = document.querySelector('.mo-iv');
    const etich = pt.querySelector('.mo-overline-h2'), head = document.querySelector('.mo-ph');
    const sopra = [...document.elementsFromPoint(etich.getBoundingClientRect().left + 5, etich.getBoundingClientRect().top + 5)];
    return {
      aperta: pt.classList.contains('mo-aperta'), isol: getComputedStyle(pt).isolation, fondo: getComputedStyle(pt, '::before').backgroundColor,
      // l'etichetta deve stare davanti alla foto dell'intestazione
      etichettaDavanti: sopra.indexOf(etich) > -1 && (sopra.indexOf(head) === -1 || sopra.indexOf(etich) < sopra.indexOf(head)),
      titoloInvito: getComputedStyle(iv.querySelector('.mo-statement')).color, testoInvito: getComputedStyle(iv.querySelector('.mo-iv-testo')).color,
    };
  });
  check('Sfumatura dell’intestazione sotto i testi della sezione dopo', sf.aperta && sf.isol === 'auto' && sf.etichettaDavanti, JSON.stringify(sf));
  check('Invito finale su sfondo bianco con «testi scuri»: titolo e testo scuri', sf.titoloInvito === 'rgb(15, 23, 42)' && sf.testoInvito === 'rgb(24, 35, 67)', `${sf.titoloInvito} · ${sf.testoInvito}`);
  check('Pagine nuove: nessun errore nella console', errori.length === 0, errori.join(' | '));
  await page.close();
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
  const hr = await page.evaluate(() => ({ on: [...document.querySelectorAll('.mo-hs-slide')].findIndex((x) => x.classList.contains('mo-is-on')), tessere: document.querySelectorAll('.mo-hs-tile').length }));
  check('Movimento ridotto: hero con la prima foto ferma, senza tessere', hr.on === 0 && hr.tessere === 0, JSON.stringify(hr));
  check('Movimento ridotto: niente caricamento, contenuti visibili, niente scorrimento bloccato', !r.loading && !r.hscroll && r.sub === '1' && r.gar === '1', JSON.stringify(r));
  const car = await page.evaluate(() => ({ treD: document.querySelector('.mo-car').classList.contains('mo-car--3d'), scorre: getComputedStyle(document.querySelector('.mo-car-track')).overflowX, op: getComputedStyle(document.querySelector('.mo-car-card')).opacity }));
  check('Movimento ridotto: il carosello diventa una fila da scorrere', !car.treD && car.scorre === 'auto' && car.op === '1', JSON.stringify(car));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} controlli superati`);
process.exit(failed.length ? 1 : 0);
