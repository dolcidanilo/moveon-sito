/*
 * Animazioni e comportamenti del sito, portati dal prototipo approvato (moveon-prototipo-motion.html).
 *
 * Differenze rispetto al prototipo, tutte per rendere i contenuti modificabili dal pannello:
 * - ogni blocco si inizializza solo se è presente nella pagina, nell'ordine in cui compare
 *   (così le sezioni bloccate con "pin" vengono create dall'alto in basso anche se i blocchi
 *   vengono riordinati, e le animazioni sotto di esse calcolano le posizioni giuste);
 * - ogni animazione cerca solo gli elementi dentro il proprio blocco;
 * - le animazioni delle illustrazioni dei Servizi seguono l'illustrazione scelta, non la posizione;
 * - posizioni dei lavori "sul tavolo" calcolate per qualsiasi numero di progetti;
 * - il nastro di parole si ferma quando è fuori dallo schermo (meno lavoro per il telefono).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { Draggable } from 'gsap/Draggable';
import Lenis from 'lenis';

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

export function initSite(data) {
  if (window.__moSiteStarted) return;
  window.__moSiteStarted = true;

  const d = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const mobileQ = window.matchMedia('(max-width: 767px)');
  const G = gsap;
  const ST = ScrollTrigger;
  G.registerPlugin(ST, Flip, Draggable);
  let lenis = null;
  let heroPlay = null;

  /* ---------- Menu mobile ---------- */
  const menuBtn = $('.menu-btn');
  const menu = document.getElementById('mobile-menu');
  function setMenu(open) {
    if (!menuBtn || !menu) return;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    d.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      if (lenis) lenis.stop();
      if (!reduce) {
        G.fromTo(menu, { clipPath: 'circle(0% at 100% 0%)' }, { clipPath: 'circle(150% at 100% 0%)', duration: 0.7, ease: 'power3.inOut' });
        G.fromTo($$('.mm-item', menu), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, delay: 0.2, ease: 'power3.out' });
      }
    } else {
      if (lenis) lenis.start();
      if (!reduce) G.to(menu, { clipPath: 'circle(0% at 100% 0%)', duration: 0.5, ease: 'power3.inOut', onComplete: () => { menu.hidden = true; } });
      else menu.hidden = true;
    }
  }
  if (menuBtn) menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));

  /* ---------- Ancore ---------- */
  const headerH = () => ($('.site-header')?.offsetHeight ?? 0);
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      if (d.classList.contains('menu-open')) setMenu(false);
      if (lenis) {
        if (id === '#top') lenis.scrollTo(0, { duration: 1.4 });
        // Le sezioni bloccate (pin) partono a filo dello schermo: niente spazio per l'header.
        else lenis.scrollTo(t, { offset: (id === '#servizi' && d.classList.contains('h-scroll')) || id === '#pausa' ? 0 : -headerH(), duration: 1.4 });
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
  const setScrolled = () => d.classList.toggle('scrolled', (window.scrollY || d.scrollTop) > 80);
  window.addEventListener('scroll', setScrolled, { passive: true });
  setScrolled();
  if ($('.progress')) G.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  const env = { G, ST, reduce, fine, mobileQ, d, data, setMenu, getLenis: () => lenis, setHeroPlay: (f) => { heroPlay = f; } };

  /* ---------- Blocchi, nell'ordine in cui compaiono nella pagina ---------- */
  const INIT = { hero: initHero, nastro: initNastro, chiSiamo: initChiSiamo, pausa: initPausa, servizi: initServizi, portfolio: initPortfolio, garanzie: initGaranzie, contatti: initContatti };
  $$('[data-block]').forEach((sec) => {
    const fn = INIT[sec.getAttribute('data-block')];
    if (fn) fn(sec, env);
  });

  /* Voce di menu attiva */
  $$('.nav a[data-nav]').forEach((link) => {
    const target = document.getElementById(link.getAttribute('data-nav'));
    if (target) ST.create({ trigger: target, start: 'top center', end: 'bottom center', onToggle: (s) => link.classList.toggle('is-active', s.isActive) });
  });

  /* Caricamento iniziale (breve), poi l'intro della hero */
  if (d.classList.contains('is-loading')) {
    G.timeline({ onComplete: () => d.classList.remove('is-loading') })
      // Stessa coreografia del prototipo, più rapida: al massimo un secondo (documento di consegna).
      .fromTo('.loader-grid i', { scale: 0 }, { scale: 1, duration: 0.2, stagger: 0.04, ease: 'back.out(2)' })
      .to('.loader-grid', { rotation: 90, duration: 0.25, ease: 'power2.inOut' })
      .add(() => { if (heroPlay) heroPlay(); })
      .to('.loader', { yPercent: -100, duration: 0.42, ease: 'power4.inOut' }, '<');
  } else if (heroPlay) {
    heroPlay();
  }

  initPointer(env);

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ST.refresh());
  window.addEventListener('load', () => ST.refresh());
}

/* =================== HERO =================== */
function initHero(sec, { G, reduce, fine, setHeroPlay }) {
  const px = $$('.bulb .px-on i', sec);
  const words = $$('.hw-in', sec);
  const hl = $$('.hl-path', sec);
  const fade = $$('.hero-sub, .hero-actions', sec);
  const glow = $('.bulb-glow', sec);
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
        G.to($$('.bulb .px-a i', sec), { boxShadow: '0 0 18px 3px rgba(245,158,11,.75)', duration: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: 0.06 });
      }, 1.3);
    if (hl.length) heroTl.to(hl, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 0.95);
    if (glow) heroTl.to(glow, { opacity: 1, duration: 1.2 }, 1.1);
  }
  setHeroPlay(() => heroTl.play());
  if (reduce) return;

  const heroST = { trigger: sec, start: 'top top', end: 'bottom top', scrub: 0.6 };
  G.to($$('.bulb .px-on', sec), {
    x: () => G.utils.random(-260, 260),
    y: () => G.utils.random(-320, 60),
    rotation: () => G.utils.random(-120, 120),
    opacity: 0.15,
    ease: 'none',
    scrollTrigger: heroST,
  });
  G.to($('.hero-copy', sec), { y: -90, ease: 'none', scrollTrigger: heroST });
  G.to($('.dots', sec), { y: 140, ease: 'none', scrollTrigger: heroST });
  G.to($('.ring', sec), { y: 220, ease: 'none', scrollTrigger: heroST });
  G.to($('.sq', sec), { y: -280, rotation: 180, ease: 'none', scrollTrigger: heroST });
  G.to($('.sq2', sec), { y: -140, rotation: -45, ease: 'none', scrollTrigger: heroST });

  const bw = $('.bulb-wrap', sec);
  bw.addEventListener('click', () => {
    G.timeline()
      .to(px, { x: () => G.utils.random(-240, 240), y: () => G.utils.random(-240, 240), rotation: () => G.utils.random(-180, 180), scale: 0.4, duration: 0.45, ease: 'power3.in', stagger: { each: 0.003, from: 'center' } })
      .to(px, { x: 0, y: 0, rotation: 0, scale: 1, duration: 1.1, ease: 'expo.out', stagger: { each: 0.006, from: 'random' } });
  });

  // Parallax con il mouse (solo mouse, mai al tocco)
  if (fine) {
    const bx = G.quickTo(bw, 'x', { duration: 0.9, ease: 'power3' });
    const by = G.quickTo(bw, 'y', { duration: 0.9, ease: 'power3' });
    const deco = $('.hero-deco', sec);
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
  const tracks = $$('.mq-track', sec);
  const rows = tracks.map((t, i) => ({ el: t, dir: i % 2 ? 1 : -1, x: 0, w: 0 }));
  const measure = () => rows.forEach((r) => { r.w = r.el.scrollWidth / 3; r.x = r.dir > 0 ? -r.w : 0; });
  measure();
  window.addEventListener('resize', measure);
  let vel = 0;
  let visible = true;
  ST.create({ start: 0, end: 'max', onUpdate: (s) => { vel = s.getVelocity(); } });
  if ('IntersectionObserver' in window) new IntersectionObserver((en) => { visible = en[0].isIntersecting; }).observe(sec);
  G.ticker.add(() => {
    const boost = 1 + Math.min(Math.abs(vel) / 250, 10);
    const skew = G.utils.clamp(-10, 10, vel / -220);
    vel *= 0.92;
    rows.forEach((r) => {
      r.x += r.dir * 0.7 * boost;
      if (r.x <= -r.w) r.x += r.w;
      if (r.x >= 0 && r.dir > 0) r.x -= r.w;
      if (visible) G.set(r.el, { x: r.x, skewX: skew });
    });
  });
}

/* =================== CHI SIAMO =================== */
function initChiSiamo(sec, { G, reduce }) {
  if (reduce) return;
  $$('.js-words', sec).forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, k) => {
      const s = document.createElement('span');
      s.className = 'mw';
      s.textContent = w;
      el.appendChild(s);
      if (k < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    G.fromTo($$('.mw', el), { opacity: 0.16 }, { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  });
  const top = $('.about-top', sec);
  G.fromTo($('.big25 .fl', sec), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: top, start: 'top 85%', end: 'bottom 45%', scrub: true } });
  G.from($('.about-headline', sec), { y: 60, opacity: 0, duration: 1, ease: 'power4.out', scrollTrigger: { trigger: top, start: 'top 75%' } });

  // "Dall'idea al prodotto finito": l'animazione segue l'illustrazione stessa (bug risolto su mobile)
  const art = $('.idea-art', sec);
  const line = $('.idea-line i', sec);
  if (art) {
    const tl = G.timeline({ scrollTrigger: { trigger: art, start: 'top 85%', end: 'bottom 35%', scrub: 0.8 } });
    if ($('.box-svg', art)) {
      const draw = $$('.bx-draw', art);
      G.set(draw, { strokeDasharray: 1, strokeDashoffset: 1 });
      tl.fromTo($$('.bx-guide', art), { opacity: 0 }, { opacity: 0.6, duration: 0.4 }, 0)
        .to(draw, { strokeDashoffset: 0, duration: 1, stagger: 0.15 }, 0)
        .fromTo($$('.bx-face', art), { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.12 }, 1.1)
        .fromTo($('.bx-label', art), { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.5 }, 1.6)
        .to($$('.bx-guide', art), { opacity: 0, duration: 0.4 }, 1.6);
    } else {
      tl.fromTo($('.idea-img', art), { opacity: 0, scale: 0.9, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: 1.4 }, 0);
    }
    if (line) tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 2.1, ease: 'none' }, 0);
  }

  // Card dei motivi che si impilano
  const reasons = $$('.reason', sec);
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
  const cv = $('.emo-canvas', sec);
  if (cv && cv.getContext) emoCanvas(cv, reduce);
  if (reduce) return;
  const fx = sec.getAttribute('data-fx') || '50';
  const fy = sec.getAttribute('data-fy') || '30';
  G.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: '+=120%', pin: true, scrub: 0.8, anticipatePin: 1 } })
    .fromTo($('.emo-frame', sec), { clipPath: `circle(16% at ${fx}% ${fy}%)` }, { clipPath: 'circle(80% at 50% 50%)', ease: 'none', duration: 1 }, 0)
    .fromTo($('.emo-img', sec), { scale: 1.35, transformOrigin: `${fx}% ${fy}%` }, { scale: 1, transformOrigin: `${fx}% ${fy}%`, ease: 'none', duration: 1 }, 0)
    .fromTo($('.emo-veil', sec), { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0.65)
    .fromTo($$('.emo-line span', sec), { yPercent: 110 }, { yPercent: 0, duration: 0.35, stagger: 0.1, ease: 'power3.out' }, 0.75)
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
  function draw(t) {
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
      if (running) { p.y -= p.vy; p.rot += p.vr; }
      if (p.y < -24) { p.y = H + 24; p.x = rnd(0, W); }
      ctx.globalAlpha = p.a;
      ctx.fillStyle = p.c;
      square(p.x + Math.sin(t * 0.001 * p.f + p.ph) * p.amp, p.y, p.s, p.rot);
    }
    ctx.globalAlpha = 1;
  }
  function loop(t) { draw(t); if (running) raf = requestAnimationFrame(loop); }
  resize();
  draw(0);
  window.addEventListener('resize', () => { resize(); draw(performance.now()); });
  if (reduce || !('IntersectionObserver' in window)) return;
  new IntersectionObserver((entries) => {
    const vis = entries[0].isIntersecting;
    if (vis && !running) { running = true; raf = requestAnimationFrame(loop); }
    else if (!vis && running) { running = false; cancelAnimationFrame(raf); }
  }).observe(cv);
}

/* =================== SERVIZI =================== */
function initServizi(sec, { G, d }) {
  const track = $('.svc-track', sec);
  const svcPanels = $$('.svc-panel[data-name]', sec);
  if (!track || !svcPanels.length) return;
  const endPanel = $('.svc-end', sec);
  const hud = $('.svc-hud', sec);
  const hudCount = $('.hud-count', hud);
  const hudName = $('.hud-name', hud);
  const hudBar = $('.hud-bar i', hud);
  const dotsWrap = $('.svc-dots', sec);
  svcPanels.forEach(() => dotsWrap.appendChild(document.createElement('i')));
  const dots = Array.from(dotsWrap.children);
  let current = -1;
  function setActive(i) {
    if (i === current) return;
    current = i;
    hudCount.textContent = `${i + 1} / ${svcPanels.length}`;
    hudName.textContent = svcPanels[i].getAttribute('data-name');
    dots.forEach((dot, k) => dot.classList.toggle('on', k === i));
  }
  function indexAt(center) {
    let idx = 0;
    svcPanels.forEach((p, i) => { if (p.offsetLeft <= center) idx = i; });
    return idx;
  }
  setActive(0);
  track.addEventListener('scroll', () => {
    if (d.classList.contains('h-scroll')) return;
    setActive(indexAt(track.scrollLeft + track.clientWidth / 2));
  }, { passive: true });

  // Su desktop: scorrimento orizzontale bloccato; su mobile resta il carosello a swipe.
  const mm = G.matchMedia();
  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    d.classList.add('h-scroll');
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
          hud.classList.toggle('is-on', center >= svcPanels[0].offsetLeft && center < endEdge);
          G.set(hudBar, { scaleX: s.progress });
        },
        onLeave: () => hud.classList.remove('is-on'),
        onLeaveBack: () => hud.classList.remove('is-on'),
      },
    });
    const inPanel = (p) => ({ trigger: p, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true });
    svcPanels.forEach((p) => {
      G.fromTo($('.svc-art', p), { xPercent: 28, rotation: 4 }, { xPercent: -28, rotation: -4, ease: 'none', scrollTrigger: inPanel(p) });
      G.fromTo($('.svc-ghost', p), { xPercent: 15 }, { xPercent: -45, ease: 'none', scrollTrigger: inPanel(p) });
      G.from($$('.svc-title, .svc-lead, .chips li', p), {
        y: 40, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.04,
        scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 70%', toggleActions: 'play none none reverse' },
      });
      // Animazione propria di ogni illustrazione di riserva (non dipende dalla posizione del servizio)
      const art = $('[data-art]', p);
      if (!art) return;
      const st = inPanel(p);
      switch (art.getAttribute('data-art')) {
        case 'identita': G.fromTo($('.id-sq', art), { rotation: -90, svgOrigin: '200 200' }, { rotation: 0, svgOrigin: '200 200', ease: 'none', scrollTrigger: st }); break;
        case 'web': G.fromTo($('.web-cursor', art), { x: -150, y: -90 }, { x: 20, y: 10, ease: 'none', scrollTrigger: st }); break;
        case 'social': G.fromTo($$('.heart', art), { y: 70, opacity: 0 }, { y: -50, opacity: 1, stagger: 0.15, ease: 'none', scrollTrigger: st }); break;
        case 'app': G.fromTo($('.app-phone', art), { x: 140, rotation: 8, svgOrigin: '290 260' }, { x: 0, rotation: 0, svgOrigin: '290 260', ease: 'none', scrollTrigger: st }); break;
        case 'rete': G.to($('.orbit', art), { rotation: 240, svgOrigin: '200 200', ease: 'none', scrollTrigger: st }); break;
        case 'formazione': G.fromTo($$('.layer', art), { y: (i) => i * 24 }, { y: (i) => -i * 26, ease: 'none', scrollTrigger: st }); break;
        default: break;
      }
    });
    return () => {
      d.classList.remove('h-scroll');
      hud.classList.remove('is-on');
      G.set(track, { clearProps: 'transform' });
    };
  });
}

/* =================== PORTFOLIO =================== */
function initPortfolio(sec, { G, ST, reduce, mobileQ, d, data }) {
  const PROJECTS = data.progetti || [];
  const board = $('.pf-board', sec);
  const cards = $$('.pf-card', board);
  const modal = $('.pf-modal');
  if (!board || !cards.length) return;

  const initial = sec.getAttribute('data-mode') === 'grid' ? 'grid' : 'chaos';
  let mode = mobileQ.matches || reduce ? 'grid' : initial;
  let filter = 'all';
  const drags = [];
  let justDragged = false;
  const modeBtns = $$('.pf-mode button', sec);
  const filterBtns = $$('.pf-filter button', sec);

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
    board.classList.toggle('is-chaos', mode === 'chaos');
    board.classList.toggle('is-grid', mode === 'grid');
    cards.forEach((c) => {
      const match = filter === 'all' || c.getAttribute('data-cat') === filter;
      c.classList.toggle('is-out', !match);
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
  const mCover = $('.pfm-cover', modal);
  const mTitle = $('.pfm-title', modal), mCat = $('.pfm-cat', modal), mBadge = $('.pfm-badge', modal);
  const mBrief = $('.pfm-brief', modal), mWork = $('.pfm-work', modal), mResult = $('.pfm-result', modal);
  const mGallery = $('.pfm-gallery', modal);
  const mClose = $('.pfm-close', modal);
  const anims = () => $$('.pfm-anim, .pfm-bar', modal).filter((el) => !el.hidden);
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
    const cover = $('.pf-cover', card);
    const state = !reduce ? Flip.getState(cover) : null;
    fillModal(i);
    modal.scrollTop = 0;
    modal.hidden = false;
    d.classList.add('modal-open');
    if (state) {
      Flip.from(state, { targets: mCover, duration: 0.8, ease: 'power3.inOut', zIndex: 5 });
      G.fromTo($('.pfm-bg', modal), { opacity: 0 }, { opacity: 1, duration: 0.45 });
      G.fromTo(anims(), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, delay: 0.45, ease: 'power3.out' });
    }
    mClose.focus({ preventScroll: true });
  }
  function closeProject() {
    if (openIdx < 0) return;
    const card = cards[openIdx];
    const finish = () => {
      modal.hidden = true;
      d.classList.remove('modal-open');
      G.set([mCover, $('.pfm-bg', modal), ...$$('.pfm-anim, .pfm-bar', modal)], { clearProps: 'all' });
      openIdx = -1;
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    };
    if (!reduce && inView(card) && !card.classList.contains('is-out')) {
      G.to(anims(), { opacity: 0, duration: 0.2 });
      G.to($('.pfm-bg', modal), { opacity: 0, duration: 0.45, delay: 0.25 });
      Flip.fit(mCover, $('.pf-cover', card), { duration: 0.7, ease: 'power3.inOut', scale: true, onComplete: finish });
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
    if (!reduce) G.fromTo([mCover, ...$$('.pfm-anim', modal).filter((el) => !el.hidden)], { x: dir * 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out' });
  }
  mClose.addEventListener('click', closeProject);
  $('.pfm-prev', modal).addEventListener('click', () => stepProject(-1));
  $('.pfm-next', modal).addEventListener('click', () => stepProject(1));
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
        const vis = cards.filter((c) => !c.classList.contains('is-out'));
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
  const garArt = $('.gar-art', sec);
  const garRing = $('.gar-ring', sec);
  if (garArt && garRing) {
    const shPx = $$('.shield .px-on i', garArt).map((el) => ({ el, x: G.utils.random(-320, 320), y: G.utils.random(-280, 280), r: G.utils.random(-180, 180), d: Math.random() * 0.45 }));
    const renderShield = (p) => {
      shPx.forEach((o) => {
        const t = Math.min(1, Math.max(0, (p - o.d) / 0.55));
        const e = 1 - Math.pow(1 - t, 3), k = 1 - e;
        o.el.style.transform = `translate(${(o.x * k).toFixed(1)}px,${(o.y * k).toFixed(1)}px) rotate(${(o.r * k).toFixed(1)}deg) scale(${(0.3 + 0.7 * e).toFixed(3)})`;
        o.el.style.opacity = e.toFixed(3);
      });
      garArt.classList.toggle('is-done', p > 0.98);
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
  const garCards = $$('.gar-card', sec);
  G.set(garCards, { y: 40, opacity: 0 });
  G.set(garCards.map((c) => $('.gar-stamp', c)), { scale: 2.4, rotation: -35, opacity: 0 });
  let garQueue = [], garTimer = 0;
  const garIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { garQueue.push(en.target); garIO.unobserve(en.target); } });
    clearTimeout(garTimer);
    garTimer = setTimeout(() => {
      const batch = garQueue.splice(0);
      if (!batch.length) return;
      G.to(batch, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1 });
      G.to(batch.map((c) => $('.gar-stamp', c)), { scale: 1, rotation: -8, opacity: 1, duration: 0.5, ease: 'back.out(3)', stagger: 0.1, delay: 0.35 });
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
  G.from($$('.ct-line-in', sec), { yPercent: 110, duration: 1, ease: 'power4.out', stagger: 0.12, scrollTrigger: { trigger: sec, start: 'top 70%' } });
  G.from($$('.ct-item', sec), { y: 30, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: $('.ct-list', sec), start: 'top 90%' } });
  const fig = $('.ct-figure', sec);
  G.fromTo($('.ct-img-wrap', sec), { clipPath: 'inset(100% 0% 0% 0% round 12px)' }, { clipPath: 'inset(0% 0% 0% 0% round 12px)', duration: 1.2, ease: 'power4.inOut', scrollTrigger: { trigger: fig, start: 'top 80%' } });
  G.fromTo($('.ct-img', sec), { scale: 1.25, yPercent: -6 }, { scale: 1.05, yPercent: 6, ease: 'none', scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true } });
  G.from($('.ct-badge', sec), { scale: 0, rotation: -120, duration: 0.9, ease: 'back.out(1.8)', scrollTrigger: { trigger: fig, start: 'top 60%' } });
  G.from($$('.ct-form .fld, .ct-form .chk, .ct-form .form-actions', sec), { y: 30, opacity: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: $('.ct-form', sec), start: 'top 85%' } });
}

function initForm(sec, { G, ST, reduce }) {
  const form = $('.ct-form', sec);
  if (!form) return;
  const formMsg = $('.form-msg', form);
  const formDone = $('.form-done', sec);
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
    const ok = await sendForm(new FormData(form));
    btn.disabled = false;
    if (!ok) {
      formMsg.textContent = 'Non siamo riusciti a inviare la richiesta. Riprova tra poco oppure scrivici con i pulsanti qui accanto.';
      return;
    }
    const nome = $('#f-nome', form).value.trim().split(' ')[0];
    $('.form-done-title', formDone).textContent = `Grazie, ${nome}!`;
    const show = () => { form.hidden = true; formDone.hidden = false; formDone.focus(); };
    if (!reduce) {
      G.to(form, { opacity: 0, y: -20, duration: 0.35, onComplete: () => { show(); G.fromTo(formDone, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }); ST.refresh(); } });
    } else {
      show();
    }
  });
}

/** Invio della richiesta. Fase 1: non viene ancora spedita (il collegamento all'email arriva nella Fase 4). */
async function sendForm(fd) {
  if (fd.get('sito')) return true; // campo trappola compilato: è un robot, fingiamo che sia andato tutto bene
  return true;
}

/* =================== CURSORE E PULSANTI MAGNETICI (solo mouse) =================== */
function initPointer({ G, fine, reduce, d }) {
  if (!fine || reduce) return;
  d.classList.add('has-cursor');
  const cur = $('.cursor');
  const lab = $('.cursor-label', cur);
  const cx = G.quickTo(cur, 'x', { duration: 0.25, ease: 'power3' });
  const cy = G.quickTo(cur, 'y', { duration: 0.25, ease: 'power3' });
  window.addEventListener('mousemove', (e) => {
    cx(e.clientX); cy(e.clientY);
    const t = e.target.closest ? e.target : e.target.parentElement;
    if (!t || !t.closest) return;
    const lbl = t.closest('[data-cursor]');
    const lnk = t.closest('a, button');
    const isLabel = !!lbl && (!lnk || lnk === lbl);
    cur.classList.toggle('is-label', isLabel);
    cur.classList.toggle('is-link', !!lnk && !isLabel);
    cur.classList.toggle('on-dark', !!t.closest('[data-dark], .t-blue, .t-navy, .r-blue, .r-navy'));
    lab.textContent = isLabel ? lbl.getAttribute('data-cursor') : '';
  });
  document.addEventListener('mouseleave', () => G.to(cur, { opacity: 0, duration: 0.2 }));
  document.addEventListener('mouseenter', () => G.to(cur, { opacity: 1, duration: 0.2 }));

  $$('.magnetic').forEach((el) => {
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
