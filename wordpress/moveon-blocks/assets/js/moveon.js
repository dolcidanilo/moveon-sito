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
const Lenis = window.Lenis;

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

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
  G.registerPlugin(ST);
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
        // Lenis toglie già lo spazio dell'header (scroll-padding-top del CSS): qui si corregge solo la differenza.
        // Le sezioni bloccate (pin) partono a filo dello schermo: lo spazio dell'header si ridà indietro.
        else {
          const pad = parseFloat(getComputedStyle(d).scrollPaddingTop) || 0;
          const pin = t.hasAttribute('data-mo-pin') && (t.getAttribute('data-mo-pin') !== 'h' || d.classList.contains('mo-h-scroll'));
          lenis.scrollTo(t, { offset: pin ? pad : pad - headerH(), duration: 1.4 });
        }
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
  const INIT = { hero: initHero, nastro: initNastro, chiSiamo: initChiSiamo, pausa: initPausa, servizi: initServizi, carosello: initCarosello, garanzie: initGaranzie, contatti: initContatti, progetto: initProgetto, progetti: initProgetti, situazioni: initSituazioni };
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
  if (sec.classList.contains('mo-hero--slide')) { initHeroSlide(sec, { G, reduce, setHeroPlay }); return; }
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

/* =================== HERO A IMMAGINI =================== */
// Ogni settore ha la sua foto. Il passaggio da una all'altra avviene «pixel dopo pixel»: la foto nuova
// si compone a tessere quadrate, ogni volta con un disegno diverso. La foto ferma si avvicina lentamente.
const HS_DISEGNI = ['random', 'center', 'edges', 'start', 'end'];
function initHeroSlide(sec, { G, reduce, setHeroPlay }) {
  const slides = $$('.mo-hs-slide', sec);
  const dots = $$('.mo-hs-dot', sec);
  const tilesBox = $('.mo-hs-tiles', sec);
  const pausaBtn = $('.mo-hs-pausa', sec);
  const words = $$('.mo-hw-in', sec);
  const hl = $$('.mo-hl-path', sec);
  const fade = $$('.mo-hero-sub, .mo-hero-actions, .mo-hs-nav', sec);
  const durata = parseFloat(sec.getAttribute('data-durata')) || 6;
  const dissolvenza = sec.getAttribute('data-transizione') === 'dissolvenza';
  const n = slides.length;
  let cur = 0, busy = false, giro = null, inPausa = false, visibile = true, disegno = 0;
  const imgOf = (k) => $('img', slides[k]);

  // Prima che l'immagine sia caricata non si può calcolare come «coprire» lo schermo
  function pronta(img, fn) {
    if (img.complete && img.naturalWidth) { fn(); return; }
    let fatto = false;
    const via = () => { if (!fatto) { fatto = true; fn(); } };
    img.addEventListener('load', via, { once: true });
    img.addEventListener('error', via, { once: true });
    setTimeout(via, 2500);
  }

  // Tessere con la foto: ognuna mostra il suo pezzo, così insieme ricompongono l'immagine «a tutto schermo»
  function tessere(k, colonne) {
    const img = imgOf(k);
    const W = sec.clientWidth, H = sec.clientHeight;
    const cols = colonne || (window.innerWidth < 768 ? 6 : 12);
    const lato = Math.ceil(W / cols);
    const rows = colonne === 1 ? 1 : Math.ceil(H / lato);
    const iw = img.naturalWidth || 1920, ih = img.naturalHeight || 1080;
    const sc = Math.max(W / iw, H / ih);
    const dw = iw * sc, dh = ih * sc;
    const [px, py] = (slides[k].getAttribute('data-pos') || '50% 50%').split(/\s+/).map((v) => (parseFloat(v) || 50) / 100);
    const ox = (W - dw) * px, oy = (H - dh) * py;
    const src = (img.currentSrc || img.src).replace(/"/g, '%22');
    tilesBox.textContent = '';
    const out = [];
    const frag = document.createDocumentFragment();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const t = document.createElement('i');
        const w = colonne === 1 ? W : lato, h = colonne === 1 ? H : lato;
        t.className = 'mo-hs-tile';
        t.style.cssText = `left:${c * lato}px;top:${r * lato}px;width:${w + 1}px;height:${h + 1}px;background-image:url("${src}");background-size:${dw}px ${dh}px;background-position:${ox - c * lato}px ${oy - r * lato}px`;
        frag.appendChild(t);
        out.push(t);
      }
    }
    tilesBox.appendChild(frag);
    return { tiles: out, cols, rows };
  }

  // La foto ferma si avvicina lentamente (molto meno di quanto si nota)
  function respiro(k) {
    if (reduce) return;
    G.fromTo(imgOf(k), { scale: 1 }, { scale: 1.07, duration: durata + 2, ease: 'none', overwrite: true });
  }
  function segna(k) {
    dots.forEach((d, i) => { d.classList.toggle('mo-is-on', i === k); G.set($('.mo-hs-bar b', d), { scaleX: 0 }); });
  }
  function avanza() {
    if (giro) giro.kill();
    giro = null;
    if (n < 2 || reduce || inPausa) return;
    const bar = dots[cur] && $('.mo-hs-bar b', dots[cur]);
    giro = G.fromTo(bar || {}, { scaleX: 0 }, { scaleX: 1, duration: durata, ease: 'none', onComplete: () => vai((cur + 1) % n) });
    if (!visibile) giro.pause();
  }
  function mostra(k) {
    slides.forEach((s, i) => s.classList.toggle('mo-is-on', i === k));
    G.set(imgOf(k), { scale: 1 });
    tilesBox.textContent = '';
    cur = k;
    busy = false;
    respiro(k);
    avanza();
  }
  function vai(k) {
    if (busy || k === cur || n < 2) return;
    busy = true;
    if (giro) { giro.kill(); giro = null; }
    segna(k);
    pronta(imgOf(k), () => {
      if (reduce) { mostra(k); return; }
      if (dissolvenza) {
        const { tiles } = tessere(k, 1);
        G.fromTo(tiles, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: 'power2.inOut', onComplete: () => mostra(k) });
        return;
      }
      const { tiles, cols, rows } = tessere(k);
      const from = HS_DISEGNI[disegno++ % HS_DISEGNI.length];
      G.fromTo(tiles,
        { scale: 0, opacity: 0, rotation: () => G.utils.random(-28, 28), borderRadius: '30%' },
        { scale: 1, opacity: 1, rotation: 0, borderRadius: '0%', duration: 0.75, ease: 'power3.out', stagger: { grid: [rows, cols], from, amount: 1.05 }, onComplete: () => mostra(k) });
    });
  }

  dots.forEach((d, i) => d.addEventListener('click', () => vai(i)));
  if (pausaBtn) pausaBtn.addEventListener('click', () => {
    inPausa = !inPausa;
    pausaBtn.setAttribute('aria-pressed', inPausa ? 'true' : 'false');
    pausaBtn.setAttribute('aria-label', inPausa ? 'Riprendi lo scorrimento delle immagini' : 'Ferma lo scorrimento delle immagini');
    if (inPausa) { if (giro) giro.pause(); } else if (giro) giro.resume(); else avanza();
  });
  // Fuori dallo schermo le immagini non scorrono
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((e) => {
      visibile = e[0].isIntersecting;
      if (giro) { if (visibile && !inPausa) giro.resume(); else giro.pause(); }
    }).observe(sec);
  }
  // Le immagini successive si caricano subito dopo la prima
  slides.slice(1).forEach((s) => { const i = $('img', s); if (i) i.loading = 'eager'; });

  // Entrata: la prima foto si compone pixel dopo pixel, poi il titolo parola per parola
  const intro = G.timeline({ paused: true });
  if (!reduce) {
    G.set(words, { yPercent: 115 });
    if (hl.length) G.set(hl, { strokeDasharray: 1, strokeDashoffset: 1 });
    G.set(fade, { y: 24, opacity: 0 });
    slides[0].classList.remove('mo-is-on');
    busy = true; // fino alla fine dell'entrata i clic sui settori aspettano
    intro
      .add(() => {
        pronta(imgOf(0), () => {
          const { tiles, cols, rows } = tessere(0);
          G.fromTo(tiles,
            { scale: 0, opacity: 0, rotation: () => G.utils.random(-35, 35), borderRadius: '30%' },
            { scale: 1, opacity: 1, rotation: 0, borderRadius: '0%', duration: 0.8, ease: 'power3.out', stagger: { grid: [rows, cols], from: 'random', amount: 1.2 }, onComplete: () => mostra(0) });
        });
      }, 0)
      .to(words, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.1 }, 0.35)
      .to(fade, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.12 }, 1.05);
    if (hl.length) intro.to(hl, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 1.15);
    setHeroPlay(() => intro.play());
  } else {
    setHeroPlay(() => {});
    mostra(0);
  }
  if (reduce) return;

  // Scorrendo, il testo sale un po' più veloce delle foto (profondità)
  const st = { trigger: sec, start: 'top top', end: 'bottom top', scrub: 0.6 };
  G.to($('.mo-hero-copy', sec), { y: -90, ease: 'none', scrollTrigger: st });
  G.to($('.mo-hs', sec), { yPercent: 12, ease: 'none', scrollTrigger: st });
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
  // La foto si apre mentre la sezione sale: comincia appena compare dal basso e finisce quando è al centro dello schermo
  // (nessun blocco dello scorrimento). La frase entra quando l'apertura è completa.
  G.timeline({ scrollTrigger: { trigger: sec, start: 'top bottom', end: 'center center', scrub: 0.6 } })
    .fromTo($('.mo-emo-frame', sec), { clipPath: `circle(16% at ${fx}% ${fy}%)` }, { clipPath: 'circle(80% at 50% 50%)', ease: 'none', duration: 1 }, 0)
    .fromTo($('.mo-emo-img', sec), { scale: 1.35, transformOrigin: `${fx}% ${fy}%` }, { scale: 1, transformOrigin: `${fx}% ${fy}%`, ease: 'none', duration: 1 }, 0)
    .fromTo($('.mo-emo-veil', sec), { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.35 }, 0.65);
  G.fromTo($$('.mo-emo-line span', sec), { yPercent: 110 }, {
    yPercent: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: sec, start: 'center center', toggleActions: 'play none none reverse' },
  });
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

/* =================== CAROSELLO PROGETTI =================== */
// Card in fila su un'elica 3D: quella al centro è in primo piano, le altre ruotano, si allontanano e sfumano.
// Si trascina (mouse o dito), si usano le frecce o la tastiera; un clic sulla card al centro apre la pagina del progetto.
function initCarosello(sec, { G, ST, reduce, mobileQ }) {
  const stage = $('.mo-car-stage', sec);
  const track = $('.mo-car-track', sec);
  const all = $$('.mo-car-card', sec);
  if (!stage || !track || !all.length) return;
  const numEl = $('.mo-car-num', sec), totEl = $('.mo-car-tot', sec);
  const nameEl = $('.mo-car-name', sec), catEl = $('.mo-car-cat', sec);
  const prevBtn = $('.mo-car-prev', sec), nextBtn = $('.mo-car-next', sec);
  const filterBtns = $$('.mo-car-filter button', sec);
  const pad = (n) => String(n).padStart(2, '0');
  const wrap = (v, n) => ((v % n) + n) % n;
  let list = all.slice();

  function setInfo(k) {
    const c = list[k];
    if (!c) return;
    if (numEl) numEl.textContent = pad(k + 1);
    if (totEl) totEl.textContent = pad(list.length);
    if (nameEl) { nameEl.textContent = c.dataset.nome; nameEl.href = c.href; }
    if (catEl) catEl.textContent = c.dataset.area + (c.dataset.tipo ? `, ${c.dataset.tipo}` : '');
  }
  function applyFilter(f) {
    filterBtns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.filter === f ? 'true' : 'false'));
    list = all.filter((c) => f === 'all' || c.dataset.cat === f);
    all.forEach((c) => { c.hidden = !list.includes(c); });
  }

  // Movimento ridotto (o editor): una fila semplice da scorrere, con frecce e filtri
  if (reduce) {
    const passo = () => (list[0]?.offsetWidth || 300) + 20;
    filterBtns.forEach((b) => b.addEventListener('click', () => { applyFilter(b.dataset.filter); track.scrollLeft = 0; setInfo(0); }));
    prevBtn?.addEventListener('click', () => track.scrollBy({ left: -passo() }));
    nextBtn?.addEventListener('click', () => track.scrollBy({ left: passo() }));
    track.addEventListener('scroll', () => setInfo(Math.min(list.length - 1, Math.round(track.scrollLeft / passo()))), { passive: true });
    return;
  }

  sec.classList.add('mo-car--3d');
  const st = { pos: 0 };
  let goal = 0, active = -1, spacing = 240;
  const anello = () => list.length >= 5; // con pochi progetti niente giro continuo
  const measure = () => { spacing = (all[0].offsetWidth || 300) * (mobileQ.matches ? 0.66 : 0.78); };
  const limita = (p) => {
    if (anello()) return p;
    const max = list.length - 1;
    return p < 0 ? p * 0.3 : p > max ? max + (p - max) * 0.3 : p;
  };

  function render() {
    const n = list.length;
    if (!n) return;
    const m = mobileQ.matches;
    list.forEach((c, i) => {
      let d = i - st.pos;
      if (anello()) d = wrap(d + n / 2, n) - n / 2;
      const a = Math.abs(d);
      const limite = m ? 2.7 : 3.6; // oltre, la card è sparita (sfuma fino a qui)
      if (a > limite) { c.style.visibility = 'hidden'; return; }
      c.style.visibility = '';
      const sg = Math.sign(d);
      const x = sg * (a <= 1 ? a * spacing : spacing + (a - 1) * spacing * 0.68);
      const z = -a * (m ? 150 : 240);
      const ry = Math.max(-1.5, Math.min(1.5, d)) * (m ? 14 : 20);
      const rz = Math.sin(d * 1.75) * (m ? 3 : 5);
      const y = Math.sin(d * 1.15) * (m ? 6 : 14);
      c.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;
      c.style.opacity = Math.max(0, Math.min(1, a < 0.5 ? 1 : 1 - (a - 0.5) / (limite - 0.4))).toFixed(3);
      c.style.setProperty('--mo-car-dim', Math.min(0.5, a * 0.17).toFixed(3));
      c.style.zIndex = String(1000 - Math.round(a * 100));
    });
    const k = wrap(Math.round(st.pos), n);
    if (k !== active) {
      const focusDentro = stage.contains(document.activeElement);
      active = k;
      list.forEach((c, i) => { c.classList.toggle('mo-is-active', i === k); c.tabIndex = i === k ? 0 : -1; });
      all.forEach((c) => { if (!list.includes(c)) c.tabIndex = -1; });
      setInfo(k);
      if (focusDentro) list[k].focus({ preventScroll: true });
    }
  }
  const normalizza = () => { if (anello()) { st.pos = wrap(st.pos, list.length); goal = wrap(goal, list.length); render(); } };
  function vai(target, dur = 0.8, ease = 'power3.inOut') {
    goal = anello() ? target : G.utils.clamp(0, list.length - 1, target);
    G.killTweensOf(st);
    G.to(st, { pos: goal, duration: dur, ease, onUpdate: render, onComplete: normalizza });
  }
  const passo = (dir) => vai((G.isTweening(st) ? goal : Math.round(st.pos)) + dir, 0.7, 'power3.out');
  function vaiA(i) {
    const n = list.length;
    let delta = i - wrap(Math.round(st.pos), n);
    if (anello()) delta = wrap(delta + n / 2, n) - n / 2;
    vai(Math.round(st.pos) + delta);
  }

  // Trascinamento (mouse e dito); in verticale la pagina scorre normalmente
  let drag = null, mosso = false, vel = 0, lastX = 0, lastT = 0;
  stage.addEventListener('dragstart', (e) => e.preventDefault());
  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || !list.length) return;
    drag = { x: e.clientX, y: e.clientY, pos: st.pos, id: e.pointerId, asse: null };
    mosso = false; vel = 0; lastX = e.clientX; lastT = performance.now();
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.asse) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      drag.asse = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (drag.asse === 'x') { mosso = true; G.killTweensOf(st); drag.pos = st.pos + dx / spacing; stage.classList.add('mo-is-dragging'); }
    }
    if (drag.asse !== 'x') return;
    st.pos = limita(drag.pos - dx / spacing);
    render();
    const now = performance.now();
    vel = 0.75 * ((e.clientX - lastX) / Math.max(1, now - lastT)) + 0.25 * vel;
    lastX = e.clientX; lastT = now;
  });
  const fine = (e) => {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    const eraX = drag.asse === 'x';
    drag = null;
    stage.classList.remove('mo-is-dragging');
    if (eraX) vai(Math.round(st.pos - G.utils.clamp(-3, 3, (vel * 240) / spacing)), 0.8, 'power3.out');
  };
  window.addEventListener('pointerup', fine);
  window.addEventListener('pointercancel', fine);

  // Clic: sulla card al centro apre il progetto, su un'altra la porta al centro
  stage.addEventListener('click', (e) => {
    const c = e.target.closest('.mo-car-card');
    if (!c) return;
    if (mosso) { e.preventDefault(); mosso = false; return; }
    const i = list.indexOf(c);
    if (i !== active) { e.preventDefault(); vaiA(i); return; }
    const img = $('img', c);
    if (img) img.style.viewTransitionName = 'mo-progetto-img'; // l'immagine «vola» nella pagina del progetto
  });
  // Tornando indietro dalla pagina del progetto (pagina rimasta in memoria) il nome si toglie
  window.addEventListener('pageshow', () => all.forEach((c) => { const img = $('img', c); if (img) img.style.viewTransitionName = ''; }));

  // Frecce, tastiera, trackpad (scorrimento orizzontale)
  prevBtn?.addEventListener('click', () => passo(-1));
  nextBtn?.addEventListener('click', () => passo(1));
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); passo(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); passo(1); }
  });
  let rotella = 0;
  stage.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 2) return;
    e.preventDefault();
    G.killTweensOf(st);
    st.pos = limita(st.pos + e.deltaX / spacing);
    render();
    clearTimeout(rotella);
    rotella = setTimeout(() => vai(Math.round(st.pos), 0.5, 'power3.out'), 140);
  }, { passive: false });

  // Filtri
  filterBtns.forEach((b) => b.addEventListener('click', () => {
    if (b.getAttribute('aria-pressed') === 'true') return;
    G.killTweensOf([st, track]);
    G.to(track, {
      opacity: 0, duration: 0.2, onComplete: () => {
        applyFilter(b.dataset.filter);
        active = -1; st.pos = -1.4; goal = 0;
        render();
        G.to(track, { opacity: 1, duration: 0.35 });
        G.to(st, { pos: 0, duration: 1, ease: 'power3.out', onUpdate: render, onComplete: normalizza });
      },
    });
  }));

  measure();
  render();
  window.addEventListener('resize', () => { measure(); render(); });
  // Entrata: le card arrivano girando quando la sezione compare
  ST.create({
    trigger: sec, start: 'top 70%', once: true,
    onEnter: () => {
      st.pos = anello() ? -2.6 : -1.6;
      render();
      G.fromTo(track, { opacity: 0 }, { opacity: 1, duration: 0.6 });
      G.to(st, { pos: 0, duration: 1.7, ease: 'expo.out', onUpdate: render, onComplete: normalizza });
    },
  });
}

/* =================== NON SAI DA DOVE PARTIRE? =================== */
// «Chiedimi un consiglio»: il messaggio con la situazione scelta viene scritto nel modulo contatti,
// che sia nella stessa pagina (#contatti) o in un'altra (pagina Contatti o home).
const MO_CONSIGLIO = 'mo-consiglio';
function initSituazioni(sec) {
  $$('.mo-si-btn', sec).forEach((a) => a.addEventListener('click', (e) => {
    const msg = a.getAttribute('data-messaggio') || '';
    try { sessionStorage.setItem(MO_CONSIGLIO, msg); } catch (err) { /* navigazione privata: niente messaggio */ }
    const href = a.getAttribute('href') || '';
    if (href.charAt(0) !== '#') return; // altra pagina: il modulo lo legge all'arrivo
    const form = document.querySelector('.mo-ct-form');
    if (form && document.querySelector(href)) {
      riempiConsiglio(form);
      return; // lo scorrimento fino al modulo lo fa il gestore delle ancore
    }
    e.preventDefault();
    window.location.href = (sec.getAttribute('data-home') || '/') + href; // il modulo sta nella home
  }));
}
function riempiConsiglio(form) {
  let msg = '';
  try { msg = sessionStorage.getItem(MO_CONSIGLIO) || ''; sessionStorage.removeItem(MO_CONSIGLIO); } catch (err) { msg = ''; }
  if (!msg) return;
  const testo = form.querySelector('textarea');
  if (testo && !testo.value.trim()) testo.value = msg;
  const scelta = form.querySelector('select');
  if (scelta) {
    const opt = Array.from(scelta.options).find((o) => /consiglia/i.test(o.textContent));
    if (opt) scelta.value = opt.value;
  }
}

/* =================== PAGINE DEI PROGETTI =================== */
function entrataTesta(sec, G) {
  const els = $$('.mo-prj-head .mo-wrap > *', sec);
  if (els.length) G.from(els, { y: 30, opacity: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out', clearProps: 'opacity,transform' });
}
function initProgetto(sec, { G, reduce }) {
  if (!reduce) entrataTesta(sec, G);
}
function initProgetti(sec, { G, reduce }) {
  const btns = $$('.mo-prjs-filter button', sec);
  const cards = $$('.mo-prjs-card', sec);
  if (!reduce) {
    entrataTesta(sec, G);
    G.from(cards, { y: 40, opacity: 0, duration: 0.8, stagger: 0.06, delay: 0.15, ease: 'power3.out', clearProps: 'opacity,transform' });
  }
  btns.forEach((b) => b.addEventListener('click', () => {
    const f = b.dataset.filter;
    btns.forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    const vis = cards.filter((c) => f === 'all' || c.dataset.cat === f);
    cards.forEach((c) => c.classList.toggle('mo-is-out', !vis.includes(c)));
    if (!reduce) G.fromTo(vis, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out', clearProps: 'opacity,transform' });
    ScrollTrigger.refresh();
  }));
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
  riempiConsiglio(form); // arrivo da «Chiedimi un consiglio» in un'altra pagina
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
