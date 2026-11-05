(function () {
'use strict';
/*
 * Animazioni e comportamenti del sito, portati dal prototipo approvato (moveon-prototipo-motion.html).
 *
 * Versione per WordPress (plugin MoveOn Blocks). Tutte le classi hanno il prefisso "mo-".
 * Differenze rispetto al prototipo, tutte per rendere i contenuti modificabili:
 * - ogni blocco si inizializza solo se è presente nella pagina, nell'ordine in cui compare
 *   (così le sezioni bloccate con "pin" vengono create dall'alto in basso anche se i blocchi
 *   vengono riordinati, e le animazioni sotto di esse calcolano le posizioni giuste);
 * - ogni animazione cerca solo gli elementi dentro il proprio blocco;
 * - le animazioni delle illustrazioni dei Servizi seguono l'illustrazione scelta, non la posizione;
 * - posizioni dei lavori "sul tavolo" calcolate per qualsiasi numero di progetti;
 * - il nastro di parole si ferma quando è fuori dallo schermo (meno lavoro per il telefono).
 */
/* Librerie caricate dal plugin come file separati (assets/js/vendor) */
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const Flip = window.Flip;
const Draggable = window.Draggable;
const Lenis = window.Lenis;

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/** Posizioni dei lavori sul tavolo (dal prototipo), in % del gruppo da 8. */
const SLOTS = [
  { x: 2, y: 4, r: -6, mx: 2, my: 1 },
  { x: 26, y: 10, r: 3, mx: 50, my: 4 },
  { x: 51, y: 2, r: -3, mx: 3, my: 25 },
  { x: 75, y: 9, r: 6, mx: 51, my: 28 },
  { x: 5, y: 50, r: 4, mx: 2, my: 50 },
  { x: 29, y: 54, r: -5, mx: 50, my: 53 },
  { x: 53, y: 48, r: 5, mx: 3, my: 74 },
  { x: 76, y: 55, r: -4, mx: 51, my: 76 },
];
const BAND_H = { desk: 760, mob: 820 };

function initSite() {
  if (window.__moSiteStarted || !gsap || !ScrollTrigger) return;
  window.__moSiteStarted = true;

  const d = document.documentElement;
  // Dentro l'editor di WPBakery le animazioni pesanti restano spente: si modifica la pagina comodamente
  const editor = d.classList.contains('vc_editor') || document.body.classList.contains('vc_editor') || /[?&]vc_editable=true/.test(location.search) || !!window.vc_iframe;
  const reduce = editor || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const data = {};
  const fine = window.matchMedia('(pointer: fine)').matches;
  const mobileQ = window.matchMedia('(max-width: 767px)');
  const G = gsap;
  const ST = ScrollTrigger;
  G.registerPlugin(ST, Flip, Draggable);
  let lenis = null;
  let heroPlay = null;

  /* ---------- Menu mobile ---------- */
  const menuBtn = $('.mo-menu-btn');
  const menu = document.getElementById('mo-mobile-menu');
  function setMenu(open) {
    if (!menuBtn || !menu) return;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.classList.toggle('mo-menu-open', open);
    if (open) {
      menu.hidden = false;
      if (lenis) lenis.stop();
      if (!reduce) {
        G.fromTo(menu, { clipPath: 'circle(0% at 100% 0%)' }, { clipPath: 'circle(150% at 100% 0%)', duration: 0.7, ease: 'power3.inOut' });
        G.fromTo($$('.mo-mm-item', menu), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, delay: 0.2, ease: 'power3.out' });
      }
    } else {
      if (lenis) lenis.start();
      if (!reduce) G.to(menu, { clipPath: 'circle(0% at 100% 0%)', duration: 0.5, ease: 'power3.inOut', onComplete: () => { menu.hidden = true; } });
      else menu.hidden = true;
    }
  }
  if (menuBtn) menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));

  /* ---------- Ancore ---------- */
  const headerH = () => ($('.mo-site-header')?.offsetHeight ?? 0);
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      if (d.classList.contains('mo-menu-open')) setMenu(false);
      if (lenis) {
        if (id === '#top') lenis.scrollTo(0, { duration: 1.4 });
        // Le sezioni bloccate (pin) partono a filo dello schermo: niente spazio per l'header.
        else lenis.scrollTo(t, { offset: t.hasAttribute('data-mo-pin') && (t.getAttribute('data-mo-pin') !== 'h' || d.classList.contains('mo-h-scroll')) ? 0 : -headerH(), duration: 1.4 });
      } else {
        t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      }
      if (id === '#main') t.setAttribute('tabindex', '-1');
    });
  });

  /* ---------- Scroll fluido ---------- */
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ST.update);
    G.ticker.add((t) => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }

  /* Header: sfondo semplicemente oltre 80 px di scroll (bug risolto: non legato a una zona di scroll). */
  const setScrolled = () => d.classList.toggle('mo-scrolled', (window.scrollY || d.scrollTop) > 80);
  window.addEventListener('scroll', setScrolled, { passive: true });
  setScrolled();
  if ($('.mo-progress')) G.to('.mo-progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  const env = { G, ST, reduce, fine, mobileQ, d, data, setMenu, getLenis: () => lenis, setHeroPlay: (f) => { heroPlay = f; } };

  /* ---------- Blocchi, nell'ordine in cui compaiono nella pagina ---------- */
  const INIT = { hero: initHero, nastro: initNastro, chiSiamo: initChiSiamo, pausa: initPausa, servizi: initServizi, portfolio: initPortfolio, garanzie: initGaranzie, contatti: initContatti };
  $$('[data-mo-block]').forEach((sec) => {
    const fn = INIT[sec.getAttribute('data-mo-block')];
    if (fn) fn(sec, env);
  });

  /* Voce di menu attiva */
  $$('.mo-nav a[data-nav]').forEach((link) => {
    const target = document.getElementById(link.getAttribute('data-nav'));
    if (target) ST.create({ trigger: target, start: 'top center', end: 'bottom center', onToggle: (s) => link.classList.toggle('mo-is-active', s.isActive) });
  });

  /* Caricamento iniziale (breve), poi l'intro della hero */
  if (d.classList.contains('mo-is-loading')) {
    G.timeline({ onComplete: () => d.classList.remove('mo-is-loading') })
      // Stessa coreografia del prototipo, più rapida: al massimo un secondo (documento di consegna).
      .fromTo('.mo-loader-grid i', { scale: 0 }, { scale: 1, duration: 0.2, stagger: 0.04, ease: 'back.out(2)' })
      .to('.mo-loader-grid', { rotation: 90, duration: 0.25, ease: 'power2.inOut' })
      .add(() => { if (heroPlay) heroPlay(); })
      .to('.mo-loader', { yPercent: -100, duration: 0.42, ease: 'power4.inOut' }, '<');
  } else if (heroPlay) {
    heroPlay();
  }

  initGeneric(env);
  initPointer(env);

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ST.refresh());
  window.addEventListener('load', () => ST.refresh());
}

/* =================== HERO =================== */
function initHero(sec, { G, reduce, fine, setHeroPlay }) {
  const px = $$('.mo-bulb .mo-px-on i', sec);
  const words = $$('.mo-hw-in', sec);
  const hl = $$('.mo-hl-path', sec);
  const fade = $$('.mo-hero-sub, .mo-hero-actions', sec);
  const glow = $('.mo-bulb-glow', sec);
  const heroTl = G.timeline({ paused: true });
  if (!reduce) {
    G.set(px, {
      x: () => G.utils.random(-520, 520),
      y: () => G.utils.random(-420, 420),
      rotation: () => G.utils.random(-180, 180),
      scale: 0.2,
      opacity: 0,
    });
    G.set(words, { yPercent: 115 });
    if (hl.length) G.set(hl, { strokeDasharray: 1, strokeDashoffset: 1 });
    G.set(fade, { y: 24, opacity: 0 });
    if (glow) G.set(glow, { opacity: 0 });
    heroTl
      .to(px, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: 1.5, ease: 'expo.out', stagger: { each: 0.007, from: 'random' } }, 0)
      .to(words, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.1 }, 0.15)
      .to(fade, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.12 }, 0.85)
      .add(() => {
        G.to($$('.mo-bulb .mo-px-a i', sec), { boxShadow: '0 0 18px 3px rgba(245,158,11,.75)', duration: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: 0.06 });
      }, 1.3);
    if (hl.length) heroTl.to(hl, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 0.95);
    if (glow) heroTl.to(glow, { opacity: 1, duration: 1.2 }, 1.1);
  }
  setHeroPlay(() => heroTl.play());
  if (reduce) return;

  const heroST = { trigger: sec, start: 'top top', end: 'bottom top', scrub: 0.6 };
  G.to($$('.mo-bulb .mo-px-on', sec), {
    x: () => G.utils.random(-260, 260),
    y: () => G.utils.random(-320, 60),
    rotation: () => G.utils.random(-120, 120),
    opacity: 0.15,
    ease: 'none',
    scrollTrigger: heroST,
  });
  G.to($('.mo-hero-copy', sec), { y: -90, ease: 'none', scrollTrigger: heroST });
  G.to($('.mo-dots', sec), { y: 140, ease: 'none', scrollTrigger: heroST });
  G.to($('.mo-ring', sec), { y: 220, ease: 'none', scrollTrigger: heroST });
  G.to($('.mo-sq', sec), { y: -280, rotation: 180, ease: 'none', scrollTrigger: heroST });
  G.to($('.mo-sq2', sec), { y: -140, rotation: -45, ease: 'none', scrollTrigger: heroST });

  const bw = $('.mo-bulb-wrap', sec);
  bw.addEventListener('click', () => {
    G.timeline()
      .to(px, { x: () => G.utils.random(-240, 240), y: () => G.utils.random(-240, 240), rotation: () => G.utils.random(-180, 180), scale: 0.4, duration: 0.45, ease: 'power3.in', stagger: { each: 0.003, from: 'center' } })
      .to(px, { x: 0, y: 0, rotation: 0, scale: 1, duration: 1.1, ease: 'expo.out', stagger: { each: 0.006, from: 'random' } });
  });

  // Parallax con il mouse (solo mouse, mai al tocco)
  if (fine) {
    const bx = G.quickTo(bw, 'x', { duration: 0.9, ease: 'power3' });
    const by = G.quickTo(bw, 'y', { duration: 0.9, ease: 'power3' });
    const deco = $('.mo-hero-deco', sec);
    const dx = G.quickTo(deco, 'x', { duration: 1.1, ease: 'power3' });
    const dy = G.quickTo(deco, 'y', { duration: 1.1, ease: 'power3' });
    sec.addEventListener('mousemove', (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      bx(nx * 30); by(ny * 30); dx(-nx * 50); dy(-ny * 50);
    });
  }
}

/* =================== NASTRO PAROLE CHIAVE =================== */
function initNastro(sec, { G, ST, reduce }) {
  if (reduce) return;
  const tracks = $$('.mo-mq-track', sec);
  const rows = tracks.map((t, i) => ({ el: t, dir: i % 2 ? 1 : -1, x: 0, w: 0 }));
  // Rimisura conservando il punto del giro (bug risolto su mobile: prima il nastro ripartiva da capo
  // ogni volta che la barra dell'indirizzo compariva o spariva, perché il browser lo segnala come "resize").
  const measure = () => rows.forEach((r) => {
    const w = r.el.scrollWidth / 3;
    if (!w) return;
    r.x = r.w ? (r.x / r.w) * w : r.dir > 0 ? -w : 0;
    r.w = w;
  });
  measure();
  let lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastW) return; // cambia solo l'altezza (barra del browser): niente da rimisurare
    lastW = window.innerWidth;
    measure();
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  let vel = 0;
  let visible = true;
  ST.create({ start: 0, end: 'max', onUpdate: (s) => { vel = s.getVelocity(); } });
  if ('IntersectionObserver' in window) new IntersectionObserver((en) => { visible = en[0].isIntersecting; }).observe(sec);
  G.ticker.add(() => {
    // Passo legato al tempo, non ai fotogrammi: stessa velocità a 60 e a 120 Hz.
    const k = Math.min(G.ticker.deltaRatio(60), 4);
    const boost = 1 + Math.min(Math.abs(vel) / 250, 10);
    const skew = G.utils.clamp(-10, 10, vel / -220);
    vel *= Math.pow(0.92, k);
    rows.forEach((r) => {
      r.x += r.dir * 0.7 * boost * k;
      if (r.x <= -r.w) r.x += r.w;
      if (r.x >= 0 && r.dir > 0) r.x -= r.w;
      if (visible) G.set(r.el, { x: r.x, skewX: skew });
    });
  });
}

/* =================== CHI SIAMO =================== */
function initChiSiamo(sec, { G, reduce }) {
  if (reduce) return;
  $$('.mo-js-words', sec).forEach((el) => wordsOnScroll(el, G));
  const top = $('.mo-about-top', sec);
  G.fromTo($('.mo-big25 .mo-fl', sec), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: top, start: 'top 85%', end: 'bottom 45%', scrub: true } });
  G.from($('.mo-about-headline', sec), { y: 60, opacity: 0, duration: 1, ease: 'power4.out', scrollTrigger: { trigger: top, start: 'top 75%' } });

  // "Dall'idea al prodotto finito": l'animazione segue l'illustrazione stessa (bug risolto su mobile)
  const art = $('.mo-idea-art', sec);
  const line = $('.mo-idea-line i', sec);
  if (art) {
    const tl = G.timeline({ scrollTrigger: { trigger: art, start: 'top 85%', end: 'bottom 35%', scrub: 0.8 } });
    if ($('.mo-box-svg', art)) {
      const draw = $$('.mo-bx-draw', art);
      G.set(draw, { strokeDasharray: 1, strokeDashoffset: 1 });
      tl.fromTo($$('.mo-bx-guide', art), { opacity: 0 }, { opacity: 0.6, duration: 0.4 }, 0)
        .to(draw, { strokeDashoffset: 0, duration: 1, stagger: 0.15 }, 0)
        .fromTo($$('.mo-bx-face', art), { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.12 }, 1.1)
        .fromTo($('.mo-bx-label', art), { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.5 }, 1.6)
        .to($$('.mo-bx-guide', art), { opacity: 0, duration: 0.4 }, 1.6);
    } else {
      tl.fromTo($('.mo-idea-img', art), { opacity: 0, scale: 0.9, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: 1.4 }, 0);
    }
    if (line) tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 2.1, ease: 'none' }, 0);
  }

  // Card dei motivi che si impilano
  const reasons = $$('.mo-reason', sec);
  reasons.forEach((card, i) => {
    if (i === reasons.length - 1) return;
    const next = reasons[i + 1];
    G.to(card, {
      scale: 0.93,
      ease: 'none',
      scrollTrigger: { trigger: next, start: 'top bottom', end: () => `top ${parseFloat(getComputedStyle(next).top) || 120}px`, scrub: true, invalidateOnRefresh: true },
    });
  });
}

/* =================== PAUSA EMOZIONALE =================== */
function initPausa(sec, { G, reduce }) {
  const cv = $('.mo-emo-canvas', sec);
  if (cv && cv.getContext) emoCanvas(cv, reduce);
  if (reduce) return;
  const fx = sec.getAttribute('data-fx') || '50';
  const fy = sec.getAttribute('data-fy') || '30';
  G.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: '+=120%', pin: true, scrub: 0.8, anticipatePin: 1 } })
    .fromTo($('.mo-emo-frame', sec), { clipPath: `circle(16% at ${fx}% ${fy}%)` }, { clipPath: 'circle(80% at 50% 50%)', ease: 'none', duration: 1 }, 0)
    .fromTo($('.mo-emo-img', sec), { scale: 1.35, transformOrigin: `${fx}% ${fy}%` }, { scale: 1, transformOrigin: `${fx}% ${fy}%`, ease: 'none', duration: 1 }, 0)
    .fromTo($('.mo-emo-veil', sec), { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0.65)
    .fromTo($$('.mo-emo-line span', sec), { yPercent: 110 }, { yPercent: 0, duration: 0.35, stagger: 0.1, ease: 'power3.out' }, 0.75)
    .to({}, { duration: 0.5 });
}

/* Pixel che fluttuano e linee che ondeggiano */
function emoCanvas(cv, reduce) {
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, parts = [], running = false, raf = 0;
  const COLS = ['#2563eb', '#2563eb', '#1d4ed8', '#1d4ed8', '#60a5fa', '#93c5fd', '#f59e0b'];
  const rnd = (a, b) => a + Math.random() * (b - a);
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Stesse misure (es. la barra dell'indirizzo del telefono che compare o sparisce): niente da rifare,
    // così i pixel non vengono rigenerati in posizioni nuove.
    if (cv.clientWidth === W && cv.clientHeight === H && cv.width === Math.round(W * dpr)) return false;
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.max(60, Math.min(200, Math.round((W * H) / 9000)));
    parts = [];
    for (let i = 0; i < n; i++) {
      const c = COLS[Math.floor(Math.random() * COLS.length)];
      parts.push({ x: rnd(0, W), y: rnd(0, H), s: rnd(4, c === '#f59e0b' ? 10 : 16), vy: rnd(0.12, 0.55), amp: rnd(6, 34), ph: rnd(0, 6.28), f: rnd(0.25, 0.9), rot: rnd(0, 6.28), vr: rnd(-0.008, 0.008), c, a: rnd(0.35, 1) });
    }
  }
  function square(x, y, s, r) {
    const h = s / 2, rr = Math.min(3, s / 4);
    ctx.save(); ctx.translate(x, y); ctx.rotate(r);
    ctx.beginPath();
    ctx.moveTo(-h + rr, -h); ctx.lineTo(h - rr, -h); ctx.quadraticCurveTo(h, -h, h, -h + rr);
    ctx.lineTo(h, h - rr); ctx.quadraticCurveTo(h, h, h - rr, h); ctx.lineTo(-h + rr, h);
    ctx.quadraticCurveTo(-h, h, -h, h - rr); ctx.lineTo(-h, -h + rr); ctx.quadraticCurveTo(-h, -h, -h + rr, -h);
    ctx.fill(); ctx.restore();
  }
  function draw(t, dk = 0) {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const base = H * (0.18 + i * 0.13), amp = 18 + i * 5;
      ctx.strokeStyle = i === 3 ? 'rgba(245,158,11,.28)' : 'rgba(96,165,250,.2)';
      ctx.beginPath();
      for (let x = -20; x <= W + 20; x += 14) {
        const y = base + Math.sin(x * 0.006 + t * 0.0006 * (1 + i * 0.15) + i) * amp + Math.sin(x * 0.013 - t * 0.0009 + i * 2) * amp * 0.35;
        if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (let k = 0; k < parts.length; k++) {
      const p = parts[k];
      // Movimento legato al tempo trascorso (dk = fotogrammi "da 60 Hz" passati): i pixel restano
      // autonomi e non accelerano quando il telefono alza la frequenza dello schermo durante lo scroll.
      p.y -= p.vy * dk; p.rot += p.vr * dk;
      if (p.y < -24) { p.y = H + 24; p.x = rnd(0, W); }
      ctx.globalAlpha = p.a;
      ctx.fillStyle = p.c;
      square(p.x + Math.sin(t * 0.001 * p.f + p.ph) * p.amp, p.y, p.s, p.rot);
    }
    ctx.globalAlpha = 1;
  }
  let last = 0;
  function loop(t) {
    const dk = last ? Math.min((t - last) / (1000 / 60), 3) : 0;
    last = t;
    draw(t, dk);
    if (running) raf = requestAnimationFrame(loop);
  }
  resize();
  draw(0);
  window.addEventListener('resize', () => { if (resize() !== false && !running) draw(performance.now()); });
  if (reduce || !('IntersectionObserver' in window)) return;
  new IntersectionObserver((entries) => {
    const vis = entries[0].isIntersecting;
    if (vis && !running) { running = true; last = 0; raf = requestAnimationFrame(loop); }
    else if (!vis && running) { running = false; cancelAnimationFrame(raf); }
  }).observe(cv);
}

/* =================== SERVIZI =================== */
function initServizi(sec, { G, d }) {
  const track = $('.mo-svc-track', sec);
  const svcPanels = $$('.mo-svc-panel[data-name]', sec);
  if (!track || !svcPanels.length) return;
  const endPanel = $('.mo-svc-end', sec);
  const hud = $('.mo-svc-hud', sec);
  const hudCount = $('.mo-hud-count', hud);
  const hudName = $('.mo-hud-name', hud);
  const hudBar = $('.mo-hud-bar i', hud);
  const dotsWrap = $('.mo-svc-dots', sec);
  svcPanels.forEach(() => dotsWrap.appendChild(document.createElement('i')));
  const dots = Array.from(dotsWrap.children);
  let current = -1;
  function setActive(i) {
    if (i === current) return;
    current = i;
    hudCount.textContent = `${i + 1} / ${svcPanels.length}`;
    hudName.textContent = svcPanels[i].getAttribute('data-name');
    dots.forEach((dot, k) => dot.classList.toggle('mo-on', k === i));
  }
  function indexAt(center) {
    let idx = 0;
    svcPanels.forEach((p, i) => { if (p.offsetLeft <= center) idx = i; });
    return idx;
  }
  setActive(0);
  track.addEventListener('scroll', () => {
    if (d.classList.contains('mo-h-scroll')) return;
    setActive(indexAt(track.scrollLeft + track.clientWidth / 2));
  }, { passive: true });

  // Su desktop: scorrimento orizzontale bloccato; su mobile resta il carosello a swipe.
  const mm = G.matchMedia();
  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    d.classList.add('mo-h-scroll');
    track.scrollLeft = 0;
    const dist = () => track.scrollWidth - window.innerWidth;
    const tween = G.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: sec,
        start: 'top top',
        end: () => `+=${dist()}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (s) => {
          const center = s.progress * dist() + window.innerWidth / 2;
          setActive(indexAt(center));
          const endEdge = endPanel ? endPanel.offsetLeft + endPanel.offsetWidth * 0.3 : Infinity;
          hud.classList.toggle('mo-is-on', center >= svcPanels[0].offsetLeft && center < endEdge);
          G.set(hudBar, { scaleX: s.progress });
        },
        onLeave: () => hud.classList.remove('mo-is-on'),
        onLeaveBack: () => hud.classList.remove('mo-is-on'),
      },
    });
    const inPanel = (p) => ({ trigger: p, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true });
    svcPanels.forEach((p) => {
      G.fromTo($('.mo-svc-art', p), { xPercent: 28, rotation: 4 }, { xPercent: -28, rotation: -4, ease: 'none', scrollTrigger: inPanel(p) });
      G.fromTo($('.mo-svc-ghost', p), { xPercent: 15 }, { xPercent: -45, ease: 'none', scrollTrigger: inPanel(p) });
      G.from($$('.mo-svc-title, .mo-svc-lead, .mo-chips li', p), {
        y: 40, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.04,
        scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 70%', toggleActions: 'play none none reverse' },
      });
      // Animazione propria di ogni illustrazione di riserva (non dipende dalla posizione del servizio)
      const art = $('[data-art]', p);
      if (!art) return;
      const st = inPanel(p);
      switch (art.getAttribute('data-art')) {
        case 'identita': G.fromTo($('.mo-id-sq', art), { rotation: -90, svgOrigin: '200 200' }, { rotation: 0, svgOrigin: '200 200', ease: 'none', scrollTrigger: st }); break;
        case 'web': G.fromTo($('.mo-web-cursor', art), { x: -150, y: -90 }, { x: 20, y: 10, ease: 'none', scrollTrigger: st }); break;
        case 'social': G.fromTo($$('.mo-heart', art), { y: 70, opacity: 0 }, { y: -50, opacity: 1, stagger: 0.15, ease: 'none', scrollTrigger: st }); break;
        case 'app': G.fromTo($('.mo-app-phone', art), { x: 140, rotation: 8, svgOrigin: '290 260' }, { x: 0, rotation: 0, svgOrigin: '290 260', ease: 'none', scrollTrigger: st }); break;
        case 'rete': G.to($('.mo-orbit', art), { rotation: 240, svgOrigin: '200 200', ease: 'none', scrollTrigger: st }); break;
        case 'formazione': G.fromTo($$('.mo-layer', art), { y: (i) => i * 24 }, { y: (i) => -i * 26, ease: 'none', scrollTrigger: st }); break;
        default: break;
      }
    });
    return () => {
      d.classList.remove('mo-h-scroll');
      hud.classList.remove('mo-is-on');
      G.set(track, { clearProps: 'transform' });
    };
  });
}

/* =================== PORTFOLIO =================== */
function initPortfolio(sec, { G, ST, reduce, mobileQ, d }) {
  // Dati dei progetti scritti dal plugin nella pagina (JSON), letti qui
  let PROJECTS = [];
  try { PROJECTS = JSON.parse($('.mo-pf-data', sec)?.textContent || '[]'); } catch (e) { PROJECTS = []; }
  const board = $('.mo-pf-board', sec);
  const cards = $$('.mo-pf-card', board);
  const modal = $('.mo-pf-modal');
  if (!board || !cards.length) return;

  const initial = sec.getAttribute('data-mode') === 'grid' ? 'grid' : 'chaos';
  let mode = mobileQ.matches || reduce ? 'grid' : initial;
  let filter = 'all';
  const drags = [];
  let justDragged = false;
  const modeBtns = $$('.mo-pf-mode button', sec);
  const filterBtns = $$('.mo-pf-filter button', sec);

  function placeChaos() {
    const m = mobileQ.matches;
    const bandH = m ? BAND_H.mob : BAND_H.desk;
    const bands = Math.max(1, Math.ceil(cards.length / SLOTS.length));
    board.style.height = bands > 1 ? `${bands * bandH}px` : '';
    cards.forEach((c, i) => {
      const s = SLOTS[i % SLOTS.length];
      const band = Math.floor(i / SLOTS.length);
      c.style.left = `${m ? s.mx : s.x}%`;
      c.style.top = bands > 1 ? `${band * bandH + ((m ? s.my : s.y) / 100) * bandH}px` : `${m ? s.my : s.y}%`;
      G.set(c, { x: 0, y: 0, rotation: s.r });
    });
  }
  function applyLayout(animate) {
    const state = animate && !reduce ? Flip.getState(cards) : null;
    board.classList.toggle('mo-is-chaos', mode === 'chaos');
    board.classList.toggle('mo-is-grid', mode === 'grid');
    cards.forEach((c) => {
      const match = filter === 'all' || c.getAttribute('data-cat') === filter;
      c.classList.toggle('mo-is-out', !match);
      c.tabIndex = match ? 0 : -1;
      c.setAttribute('aria-hidden', match ? 'false' : 'true');
      c.setAttribute('data-cursor', mode === 'chaos' ? 'Trascina' : 'Apri');
    });
    if (mode === 'chaos') {
      placeChaos();
      drags.forEach((dr) => { dr.enable(); dr.update(); });
    } else {
      board.style.height = '';
      cards.forEach((c) => { c.style.left = ''; c.style.top = ''; G.set(c, { x: 0, y: 0, rotation: 0 }); });
      drags.forEach((dr) => dr.disable());
    }
    modeBtns.forEach((b) => b.setAttribute('aria-pressed', b.getAttribute('data-mode') === mode ? 'true' : 'false'));
    filterBtns.forEach((b) => b.setAttribute('aria-pressed', b.getAttribute('data-filter') === filter ? 'true' : 'false'));
    if (state) {
      Flip.from(state, {
        duration: 0.85, ease: 'power3.inOut', stagger: 0.025, absolute: true,
        onEnter: (els) => G.fromTo(els, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.5, clearProps: 'opacity' }),
        onComplete: () => { ST.refresh(); drags.forEach((dr) => dr.update()); },
      });
    } else {
      ST.refresh();
    }
  }

  // Trascinamento sul tavolo. Il tavolo è un livello isolato (isolation:isolate nel CSS),
  // così lo z-index alzato dal trascinamento non porta mai le card sopra l'header.
  cards.forEach((c, i) => {
    drags.push(Draggable.create(c, {
      type: 'x,y', bounds: board, dragClickables: true, zIndexBoost: true, edgeResistance: 0.75, minimumMovement: 4,
      onPress: () => { if (!reduce) G.to(c, { scale: 1.05, duration: 0.2 }); },
      onRelease: () => { if (!reduce) G.to(c, { scale: 1, duration: 0.35, ease: 'back.out(2)' }); },
      onDragStart: () => { justDragged = true; if (!reduce) G.to(c, { rotation: G.utils.random(-9, 9), duration: 0.4 }); },
      onDragEnd: () => setTimeout(() => { justDragged = false; }, 80),
      onClick: () => { if (mode === 'chaos') openProject(i); },
    })[0]);
  });
  applyLayout(false);

  modeBtns.forEach((b) => b.addEventListener('click', () => { if (mode === b.getAttribute('data-mode')) return; mode = b.getAttribute('data-mode'); applyLayout(true); }));
  filterBtns.forEach((b) => b.addEventListener('click', () => { filter = b.getAttribute('data-filter'); applyLayout(true); }));
  if (mobileQ.addEventListener) mobileQ.addEventListener('change', () => { if (mode === 'chaos') placeChaos(); });

  /* Scheda progetto */
  const mCover = $('.mo-pfm-cover', modal);
  const mTitle = $('.mo-pfm-title', modal), mCat = $('.mo-pfm-cat', modal), mBadge = $('.mo-pfm-badge', modal);
  const mBrief = $('.mo-pfm-brief', modal), mWork = $('.mo-pfm-work', modal), mResult = $('.mo-pfm-result', modal);
  const mGallery = $('.mo-pfm-gallery', modal);
  const mClose = $('.mo-pfm-close', modal);
  const anims = () => $$('.mo-pfm-anim, .mo-pfm-bar', modal).filter((el) => !el.hidden);
  let openIdx = -1, lastFocus = null;

  function imgEl(src, alt, pos, w, h) {
    const im = document.createElement('img');
    im.src = src; im.alt = alt || '';
    if (pos) im.style.objectPosition = pos;
    if (w) im.width = w;
    if (h) im.height = h;
    im.decoding = 'async';
    return im;
  }
  function fillModal(i) {
    const p = PROJECTS[i];
    mCover.replaceChildren(imgEl(p.copertina.url, p.copertina.alt, p.copertina.pos));
    mCover.setAttribute('data-flip-id', `pf-${i}`);
    mBadge.textContent = p.areaLabel;
    mTitle.textContent = p.nome;
    mCat.textContent = `${p.areaLabel}, ${p.tipo}`;
    mBrief.textContent = p.richiesta;
    mWork.textContent = p.lavoro;
    mResult.textContent = p.risultato;
    const gal = p.galleria || [];
    mGallery.replaceChildren(...gal.map((g) => imgEl(g.url, g.alt, null, g.width, g.height)));
    mGallery.hidden = !gal.length;
  }
  const inView = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight; };
  function openProject(i) {
    const card = cards[i];
    lastFocus = card;
    openIdx = i;
    const cover = $('.mo-pf-cover', card);
    const state = !reduce ? Flip.getState(cover) : null;
    fillModal(i);
    modal.scrollTop = 0;
    modal.hidden = false;
    d.classList.add('mo-modal-open');
    if (state) {
      Flip.from(state, { targets: mCover, duration: 0.8, ease: 'power3.inOut', zIndex: 5 });
      G.fromTo($('.mo-pfm-bg', modal), { opacity: 0 }, { opacity: 1, duration: 0.45 });
      G.fromTo(anims(), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, delay: 0.45, ease: 'power3.out' });
    }
    mClose.focus({ preventScroll: true });
  }
  function closeProject() {
    if (openIdx < 0) return;
    const card = cards[openIdx];
    const finish = () => {
      modal.hidden = true;
      d.classList.remove('mo-modal-open');
      G.set([mCover, $('.mo-pfm-bg', modal), ...$$('.mo-pfm-anim, .mo-pfm-bar', modal)], { clearProps: 'all' });
      openIdx = -1;
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    };
    if (!reduce && inView(card) && !card.classList.contains('mo-is-out')) {
      G.to(anims(), { opacity: 0, duration: 0.2 });
      G.to($('.mo-pfm-bg', modal), { opacity: 0, duration: 0.45, delay: 0.25 });
      Flip.fit(mCover, $('.mo-pf-cover', card), { duration: 0.7, ease: 'power3.inOut', scale: true, onComplete: finish });
    } else {
      finish();
    }
  }
  function stepProject(dir) {
    const i = (openIdx + dir + PROJECTS.length) % PROJECTS.length;
    openIdx = i;
    lastFocus = cards[i];
    fillModal(i);
    modal.scrollTop = 0;
    if (!reduce) G.fromTo([mCover, ...$$('.mo-pfm-anim', modal).filter((el) => !el.hidden)], { x: dir * 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out' });
  }
  mClose.addEventListener('click', closeProject);
  $('.mo-pfm-prev', modal).addEventListener('click', () => stepProject(-1));
  $('.mo-pfm-next', modal).addEventListener('click', () => stepProject(1));
  cards.forEach((c, i) => {
    c.addEventListener('click', (e) => {
      if (justDragged) return;
      if (mode === 'chaos' && drags.length && e.detail !== 0) return;
      openProject(i);
    });
  });
  document.addEventListener('keydown', (e) => {
    if (modal.hidden) return;
    if (e.key === 'Escape') { closeProject(); return; }
    if (e.key === 'ArrowRight') stepProject(1);
    if (e.key === 'ArrowLeft') stepProject(-1);
    if (e.key === 'Tab') {
      const f = $$('button', modal);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // I lavori cadono sul tavolo
  if (!reduce) {
    ST.create({
      trigger: board, start: 'top 80%', once: true,
      onEnter: () => {
        const vis = cards.filter((c) => !c.classList.contains('mo-is-out'));
        if (mode === 'chaos') {
          G.from(vis, { y: -320, rotation: () => G.utils.random(-35, 35), opacity: 0, duration: 1, ease: 'back.out(1.1)', stagger: { each: 0.08, from: 'random' }, clearProps: 'opacity', onComplete: () => drags.forEach((dr) => dr.update()) });
        } else {
          G.from(vis, { y: 50, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06, clearProps: 'opacity' });
        }
      },
    });
  }
}

/* =================== GARANZIE =================== */
function initGaranzie(sec, { G, reduce, fine }) {
  if (reduce) return;
  /* Lo scudo si compone pixel dopo pixel, il sigillo ruota.
     Avanzamento calcolato dalla posizione reale sullo schermo (bug risolto),
     così non dipende dalle sezioni bloccate (pin) che stanno sopra. */
  const garArt = $('.mo-gar-art', sec);
  const garRing = $('.mo-gar-ring', sec);
  if (garArt && garRing) {
    const shPx = $$('.mo-shield .mo-px-on i', garArt).map((el) => ({ el, x: G.utils.random(-320, 320), y: G.utils.random(-280, 280), r: G.utils.random(-180, 180), d: Math.random() * 0.45 }));
    const renderShield = (p) => {
      shPx.forEach((o) => {
        const t = Math.min(1, Math.max(0, (p - o.d) / 0.55));
        const e = 1 - Math.pow(1 - t, 3), k = 1 - e;
        o.el.style.transform = `translate(${(o.x * k).toFixed(1)}px,${(o.y * k).toFixed(1)}px) rotate(${(o.r * k).toFixed(1)}deg) scale(${(0.3 + 0.7 * e).toFixed(3)})`;
        o.el.style.opacity = e.toFixed(3);
      });
      garArt.classList.toggle('mo-is-done', p > 0.98);
    };
    renderShield(0);
    garRing.style.transformOrigin = '50% 50%';
    let lastP = -1, lastR = -1;
    G.ticker.add(() => {
      const vh = window.innerHeight, sr = sec.getBoundingClientRect();
      if (sr.bottom < -50 || sr.top > vh + 50) return;
      // L'animazione segue l'illustrazione stessa, non il blocco intero (bug risolto su mobile)
      const r = garArt.getBoundingClientRect();
      const start = vh * 0.95, end = vh * 0.5 - r.height / 2;
      const p = Math.min(1, Math.max(0, (start - r.top) / (start - end)));
      if (Math.abs(p - lastP) > 0.0005) { renderShield(p); lastP = p; }
      const rot = Math.min(1, Math.max(0, (vh - sr.top) / (vh + sr.height))) * 360;
      if (Math.abs(rot - lastR) > 0.05) { garRing.style.transform = `rotate(${rot.toFixed(2)}deg)`; lastR = rot; }
    });
  }

  /* Il timbro, all'ingresso di ogni card nello schermo */
  const garCards = $$('.mo-gar-card', sec);
  G.set(garCards, { y: 40, opacity: 0 });
  G.set(garCards.map((c) => $('.mo-gar-stamp', c)), { scale: 2.4, rotation: -35, opacity: 0 });
  let garQueue = [], garTimer = 0;
  const garIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { garQueue.push(en.target); garIO.unobserve(en.target); } });
    clearTimeout(garTimer);
    garTimer = setTimeout(() => {
      const batch = garQueue.splice(0);
      if (!batch.length) return;
      G.to(batch, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1 });
      G.to(batch.map((c) => $('.mo-gar-stamp', c)), { scale: 1, rotation: -8, opacity: 1, duration: 0.5, ease: 'back.out(3)', stagger: 0.1, delay: 0.35 });
    }, 30);
  }, { threshold: 0.15 });
  garCards.forEach((c) => garIO.observe(c));

  // Inclinazione 3D delle card: solo con il mouse
  if (fine) {
    garCards.forEach((c) => {
      G.set(c, { transformPerspective: 900 });
      const rx = G.quickTo(c, 'rotationX', { duration: 0.5, ease: 'power3' });
      const ry = G.quickTo(c, 'rotationY', { duration: 0.5, ease: 'power3' });
      c.addEventListener('mousemove', (e) => {
        const r = c.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 10);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
      });
      c.addEventListener('mouseleave', () => { rx(0); ry(0); });
    });
  }
}

/* =================== CONTATTI =================== */
function initContatti(sec, { G, ST, reduce }) {
  initForm(sec, { G, ST, reduce });
  if (reduce) return;
  G.from($$('.mo-ct-line-in', sec), { yPercent: 110, duration: 1, ease: 'power4.out', stagger: 0.12, scrollTrigger: { trigger: sec, start: 'top 70%' } });
  G.from($$('.mo-ct-item', sec), { y: 30, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: $('.mo-ct-list', sec), start: 'top 90%' } });
  const fig = $('.mo-ct-figure', sec);
  G.fromTo($('.mo-ct-img-wrap', sec), { clipPath: 'inset(100% 0% 0% 0% round 12px)' }, { clipPath: 'inset(0% 0% 0% 0% round 12px)', duration: 1.2, ease: 'power4.inOut', scrollTrigger: { trigger: fig, start: 'top 80%' } });
  G.fromTo($('.mo-ct-img', sec), { scale: 1.25, yPercent: -6 }, { scale: 1.05, yPercent: 6, ease: 'none', scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true } });
  G.from($('.mo-ct-badge', sec), { scale: 0, rotation: -120, duration: 0.9, ease: 'back.out(1.8)', scrollTrigger: { trigger: fig, start: 'top 60%' } });
  G.from($$('.mo-ct-form .mo-fld, .mo-ct-form .mo-chk, .mo-ct-form .mo-form-actions', sec), { y: 30, opacity: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: $('.mo-ct-form', sec), start: 'top 85%' } });
}

function initForm(sec, { G, ST, reduce }) {
  const form = $('.mo-ct-form', sec);
  if (!form) return;
  const formMsg = $('.mo-form-msg', form);
  const formDone = $('.mo-form-done', sec);
  const btn = $('button[type="submit"]', form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = $$('[required]', form);
    let firstBad = null;
    fields.forEach((el) => {
      const ok = el.type === 'checkbox' ? el.checked : el.checkValidity() && el.value.trim() !== '';
      if (el.type !== 'checkbox') el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok && !firstBad) firstBad = el;
    });
    if (firstBad) {
      formMsg.textContent = 'Controlla i campi: servono nome, un’email valida, il messaggio e il consenso privacy.';
      firstBad.focus();
      return;
    }
    formMsg.textContent = '';
    btn.disabled = true;
    const ok = await sendForm(form);
    btn.disabled = false;
    if (!ok) {
      formMsg.textContent = 'Non siamo riusciti a inviare la richiesta. Riprova tra poco oppure scrivici con i pulsanti qui accanto.';
      return;
    }
    const nome = $('[name="nome"]', form).value.trim().split(' ')[0];
    $('.mo-form-done-title', formDone).textContent = `Grazie, ${nome}!`;
    const show = () => { form.hidden = true; formDone.hidden = false; formDone.focus(); };
    if (!reduce) {
      G.to(form, { opacity: 0, y: -20, duration: 0.35, onComplete: () => { show(); G.fromTo(formDone, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }); ST.refresh(); } });
    } else {
      show();
    }
  });
}

/** Invio della richiesta a WordPress (il plugin la spedisce per email e, se attivo, ne salva una copia). */
async function sendForm(form) {
  const fd = new FormData(form);
  if (fd.get('sito')) return true; // campo trappola compilato: è un robot, fingiamo che sia andato tutto bene
  try {
    const res = await fetch(form.getAttribute('data-endpoint'), { method: 'POST', body: fd, credentials: 'same-origin' });
    const out = await res.json().catch(() => ({}));
    return res.ok && out.ok !== false;
  } catch (e) {
    return false;
  }
}

/* =================== PAROLE CHE SI ACCENDONO (manifesto e classe mo-words) =================== */
/** Avvolge ogni parola in <span class="mo-mw">, lasciando intatti grassetti, link e a capo. */
function splitWords(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
  nodes.forEach((n) => {
    const frag = document.createDocumentFragment();
    n.nodeValue.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
      const s = document.createElement('span');
      s.className = 'mo-mw';
      s.textContent = part;
      frag.appendChild(s);
    });
    n.parentNode.replaceChild(frag, n);
  });
  return $$('.mo-mw', el);
}
function wordsOnScroll(el, G) {
  const words = splitWords(el);
  G.fromTo(words, { opacity: 0.16 }, { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
}

/* =================== ANIMAZIONI CON LE CLASSI (per qualsiasi elemento WPBakery) ===================
   Scrivi la classe nel campo "Nome classe extra" dell'elemento o della riga:
   mo-reveal (entra dal basso) · mo-reveal-left · mo-reveal-right · mo-zoom
   mo-delay-1 … mo-delay-5 (ritardo, da aggiungere alle precedenti)
   mo-stagger (gli elementi interni entrano uno dopo l'altro)
   mo-words (il testo si accende parola per parola mentre scorri)
   mo-parallax / mo-parallax-forte (si muove più lento della pagina)
   mo-tilt (si inclina seguendo il mouse) · mo-magnetic (pulsante che segue il mouse)  */
function initGeneric({ G, reduce, fine }) {
  if (reduce) return;
  const ritardo = (el) => { const m = /(?:^|\s)mo-delay-(\d)/.exec(el.className); return m ? +m[1] * 0.15 : 0; };
  // Durante l'ingresso si sospende l'eventuale transizione CSS dell'elemento (es. il sollevamento
  // delle card al passaggio del mouse): altrimenti l'animazione partirebbe dal punto sbagliato.
  const senzaTransizione = (els) => { G.set(els, { transition: 'none' }); return () => G.set(els, { clearProps: 'transition' }); };
  $$('.mo-reveal, .mo-reveal-left, .mo-reveal-right, .mo-zoom').forEach((el) => {
    const from = el.classList.contains('mo-reveal-left') ? { x: -60 } : el.classList.contains('mo-reveal-right') ? { x: 60 } : el.classList.contains('mo-zoom') ? { scale: 0.85 } : { y: 50 };
    const ripristina = senzaTransizione(el);
    G.from(el, { ...from, opacity: 0, duration: 0.9, delay: ritardo(el), ease: 'power3.out', onComplete: ripristina, scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  $$('.mo-stagger').forEach((el) => {
    // In WPBakery i contenuti stanno dentro .wpb_wrapper: si animano quelli
    const box = el.querySelector('.wpb_wrapper') || el;
    const items = Array.from(box.children).filter((c) => c.offsetParent !== null);
    if (!items.length) return;
    const ripristina = senzaTransizione(items);
    G.from(items, { y: 40, opacity: 0, duration: 0.7, stagger: 0.1, delay: ritardo(el), ease: 'power3.out', onComplete: ripristina, scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  $$('.mo-words').forEach((el) => wordsOnScroll(el, G));
  $$('.mo-parallax, .mo-parallax-forte').forEach((el) => {
    const k = el.classList.contains('mo-parallax-forte') ? 30 : 12;
    G.fromTo(el, { yPercent: k }, { yPercent: -k, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  if (fine) {
    $$('.mo-tilt').forEach((c) => {
      G.set(c, { transformPerspective: 900 });
      const rx = G.quickTo(c, 'rotationX', { duration: 0.5, ease: 'power3' });
      const ry = G.quickTo(c, 'rotationY', { duration: 0.5, ease: 'power3' });
      c.addEventListener('mousemove', (e) => {
        const r = c.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 10);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
      });
      c.addEventListener('mouseleave', () => { rx(0); ry(0); });
    });
  }
}

/* =================== CURSORE E PULSANTI MAGNETICI (solo mouse) =================== */
function initPointer({ G, fine, reduce, d }) {
  if (!fine || reduce) return;
  d.classList.add('mo-has-cursor');
  const cur = $('.mo-cursor');
  const lab = $('.mo-cursor-label', cur);
  const cx = G.quickTo(cur, 'x', { duration: 0.25, ease: 'power3' });
  const cy = G.quickTo(cur, 'y', { duration: 0.25, ease: 'power3' });
  window.addEventListener('mousemove', (e) => {
    cx(e.clientX); cy(e.clientY);
    const t = e.target.closest ? e.target : e.target.parentElement;
    if (!t || !t.closest) return;
    const lbl = t.closest('[data-cursor]');
    const lnk = t.closest('a, button');
    const isLabel = !!lbl && (!lnk || lnk === lbl);
    cur.classList.toggle('mo-is-label', isLabel);
    cur.classList.toggle('mo-is-link', !!lnk && !isLabel);
    cur.classList.toggle('mo-on-dark', !!t.closest('[data-dark], .mo-t-blue, .mo-t-navy, .mo-r-blue, .mo-r-navy'));
    lab.textContent = isLabel ? lbl.getAttribute('data-cursor') : '';
  });
  document.addEventListener('mouseleave', () => G.to(cur, { opacity: 0, duration: 0.2 }));
  document.addEventListener('mouseenter', () => G.to(cur, { opacity: 1, duration: 0.2 }));

  $$('.mo-magnetic').forEach((el) => {
    const mx = G.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
    const my = G.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      mx((e.clientX - r.left - r.width / 2) * 0.35);
      my((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('mouseleave', () => G.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,.35)' }));
  });
}

/* Avvio: lo script è caricato in fondo alla pagina */
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSite);
else initSite();

})();
