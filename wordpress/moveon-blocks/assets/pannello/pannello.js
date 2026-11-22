/* Pannello clienti MoveOn · «Il tuo sito» (1.12.0)
 * Una piccola applicazione senza librerie: bacheca, modifica delle sezioni con anteprima, foto, richieste, aiuto.
 * Parla con WordPress tramite /wp-json/moveon-pannello/v1/. */
(() => {
  'use strict';
  const root = document.getElementById('mp');
  if (!root) return;
  const API = root.dataset.api;
  const NONCE = root.dataset.nonce;
  const ESCI = root.dataset.esci;
  const LOGO_MOVEON = root.dataset.moveon;

  /* ---------- Icone (tratto 1.8, 24×24) ---------- */
  const P = {
    casa: '<path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    sito: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5"/>',
    foto: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    posta: '<path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/>',
    aiuto: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>',
    esci: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h11"/>',
    apri: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    destra: '<path d="m9 6 6 6-6 6"/>',
    sinistra: '<path d="m15 6-6 6 6 6"/>',
    su: '<path d="m6 15 6-6 6 6"/>',
    giu: '<path d="m6 9 6 6 6-6"/>',
    cestino: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    piu: '<path d="M12 5v14M5 12h14"/>',
    ok: '<path d="m5 12 5 5 9-10"/>',
    annulla: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
    computer: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    telefono: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>',
    carica: '<path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
    chiama: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
    chat: '<path d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.3-3.6A8 8 0 0 1 4 12z"/>',
    occhio: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    chiudi: '<path d="M6 6l12 12M18 6 6 18"/>',
    matita: '<path d="m4 20 4-1L19 8a2.1 2.1 0 0 0-3-3L5 16z"/>',
    // sezioni
    hero: '<path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3zM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"/>',
    intestazione: '<path d="M5 6h14M5 6v0M12 6v13M9 19h6"/>',
    numeri: '<path d="M9 4 7 20M17 4l-2 16M4 9h16M3 15h16"/>',
    punti: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    passi: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
    elenco: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    faq: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>',
    recensioni: '<path d="M7 7h4v4c0 3-1.5 5-4 6M15 7h4v4c0 3-1.5 5-4 6"/>',
    invito: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1zM15 9a3 3 0 0 1 0 6M18 6a7 7 0 0 1 0 12"/>',
    contatti: '<path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/>',
    chi_breve: '<circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/>',
    nastro: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
    garanzie: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    servizi: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    situazioni: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    carosello: '<rect x="7" y="5" width="10" height="14" rx="2"/><path d="M4 7v10M20 7v10"/>',
    lavori: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 15 5-5 4 4 3-3 6 6"/>',
  };
  const ico = (n, cls = '') => `<svg class="mp-ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || P.sito}</svg>`;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- API ---------- */
  async function api(path, opt = {}) {
    const init = { method: opt.method || 'GET', headers: { 'X-WP-Nonce': NONCE }, credentials: 'same-origin' };
    if (opt.json) { init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(opt.json); }
    if (opt.form) init.body = opt.form;
    const r = await fetch(API + path, init);
    let d = {};
    try { d = await r.json(); } catch (e) { /* risposta vuota */ }
    if (!r.ok) throw new Error(d.errore || d.message || 'Qualcosa non ha funzionato. Riprova.');
    return d;
  }

  /* ---------- Stato ---------- */
  const S = { stato: null, pagina: null, sezione: null, bozza: null, sporco: false, gruppo: null, device: 'computer', foto: null, richieste: null };

  /* ---------- Avvisi e conferme ---------- */
  function toast(testo, tipo = 'ok') {
    const t = document.createElement('div');
    t.className = 'mp-toast mp-toast-' + tipo;
    t.setAttribute('role', 'status');
    t.innerHTML = (tipo === 'ok' ? ico('ok') : ico('aiuto')) + '<span>' + esc(testo) + '</span>';
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('mp-vis'));
    setTimeout(() => { t.classList.remove('mp-vis'); setTimeout(() => t.remove(), 400); }, tipo === 'ok' ? 2600 : 4500);
  }
  function conferma(titolo, testo, si = 'Sì', no = 'Annulla', pericolo = false) {
    return new Promise((ok) => {
      const d = document.createElement('div');
      d.className = 'mp-dialogo';
      d.innerHTML = `<div class="mp-dialogo-box" role="alertdialog" aria-modal="true" aria-labelledby="mp-dt"><h2 id="mp-dt">${esc(titolo)}</h2><p>${esc(testo)}</p><div class="mp-dialogo-az"><button class="mp-btn" data-r="0">${esc(no)}</button><button class="mp-btn ${pericolo ? 'mp-btn-pericolo' : 'mp-btn-primario'}" data-r="1">${esc(si)}</button></div></div>`;
      document.body.appendChild(d);
      requestAnimationFrame(() => d.classList.add('mp-vis'));
      $('[data-r="1"]', d).focus();
      const tasto = (e) => { if (e.key === 'Escape') chiudi(false); };
      const chiudi = (v) => { document.removeEventListener('keydown', tasto); d.classList.remove('mp-vis'); setTimeout(() => d.remove(), 250); ok(v); };
      document.addEventListener('keydown', tasto);
      d.addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (b) chiudi(b.dataset.r === '1'); else if (e.target === d) chiudi(false); });
    });
  }

  /* ---------- Struttura ---------- */
  function guscio() {
    const m = S.stato.marchio;
    const marchio = m.logo ? `<img src="${esc(m.logo)}" alt="">` : `<span>${esc(m.iniziali)}</span>`;
    const voci = [
      ['', 'casa', 'Bacheca'],
      ['sito', 'sito', 'Il tuo sito'],
      ['foto', 'foto', 'Le tue foto'],
      ['richieste', 'posta', 'Richieste'],
      ['aiuto', 'aiuto', 'Aiuto'],
    ];
    const nav = voci.map(([h, i, t]) => `<a href="#/${h}" data-nav="${h}">${ico(i)}<span>${t}</span>${h === 'richieste' ? '<b class="mp-badge" data-badge hidden></b>' : ''}</a>`).join('');
    root.innerHTML = `
      <aside class="mp-side">
        <div class="mp-marchio"><div class="mp-marchio-logo">${marchio}</div><div><strong>${esc(m.nome)}</strong><small>Il tuo sito</small></div></div>
        <nav class="mp-nav" aria-label="Menu">${nav}</nav>
        <div class="mp-side-fondo">
          <a class="mp-esci" href="${esc(ESCI)}">${ico('esci')}<span>Esci</span></a>
          <p class="mp-firma">Il tuo sito · by <img src="${esc(LOGO_MOVEON)}" alt="MoveOn" width="66" height="14"></p>
        </div>
      </aside>
      <div class="mp-corpo">
        <header class="mp-top"><div class="mp-top-marchio"><div class="mp-marchio-logo">${marchio}</div><strong>${esc(m.nome)}</strong></div><div class="mp-top-titolo" id="mp-titolo"></div><div class="mp-top-az" id="mp-az"></div></header>
        <main class="mp-main" id="mp-main" tabindex="-1"></main>
      </div>
      <nav class="mp-tab" aria-label="Menu">${nav}</nav>`;
    aggiornaBadge();
  }
  function aggiornaBadge() {
    $$('[data-badge]').forEach((b) => { b.textContent = S.stato.nuove; b.hidden = !S.stato.nuove; });
  }
  function titolo(t, azioni = '') {
    $('#mp-titolo').innerHTML = t;
    $('#mp-az').innerHTML = azioni;
    document.title = (S.stato.marchio.nome || 'Il tuo sito') + ' · Il tuo sito · by MoveOn';
  }
  function attiva(n) {
    $$('[data-nav]').forEach((a) => a.classList.toggle('mp-attivo', a.dataset.nav === n));
  }

  /* ---------- Bacheca ---------- */
  function vistaBacheca() {
    attiva('');
    const ora = new Date().getHours();
    const saluto = ora < 13 ? 'Buongiorno' : ora < 18 ? 'Buon pomeriggio' : 'Buonasera';
    titolo('Bacheca');
    const pag = S.stato.pagine;
    const ultime = S.stato.ultime.map((r) => `<a class="mp-ric-riga" href="#/richieste/${r.id}"><span class="mp-ric-punto ${r.letta ? '' : 'mp-nuova'}"></span><strong>${esc(r.nome)}</strong><span>${esc(r.area || '')}</span><time>${esc(r.quando)}</time></a>`).join('') || '<p class="mp-vuoto-piccolo">Ancora nessuna richiesta: quando qualcuno compila il modulo del sito, la trovi qui.</p>';
    $('#mp-main').innerHTML = `
      <section class="mp-ciao"><h1>${saluto}!</h1><p>Da qui gestisci il sito di <strong>${esc(S.stato.marchio.nome)}</strong>: cambi testi e foto quando vuoi, e il sito si aggiorna subito.</p></section>
      <section class="mp-carte">
        <a class="mp-carta mp-carta-grande" href="#/sito${pag.length === 1 ? '/' + pag[0].id : ''}">
          <span class="mp-carta-ico">${ico('matita')}</span>
          <h2>Modifica il sito</h2>
          <p>${pag.length === 1 ? pag[0].sezioni + ' sezioni da personalizzare' : pag.length + ' pagine da personalizzare'}</p>
          <span class="mp-carta-vai">Inizia ${ico('destra')}</span>
        </a>
        <a class="mp-carta" href="#/richieste">
          <span class="mp-carta-ico">${ico('posta')}</span>
          <h2>Richieste</h2>
          <p>${S.stato.nuove ? `<b class="mp-numero">${S.stato.nuove}</b> ${S.stato.nuove === 1 ? 'nuova' : 'nuove'}` : 'Nessuna nuova richiesta'}</p>
          <span class="mp-carta-vai">Apri ${ico('destra')}</span>
        </a>
        <a class="mp-carta" href="#/foto">
          <span class="mp-carta-ico">${ico('foto')}</span>
          <h2>Le tue foto</h2>
          <p>Carica le foto da usare nel sito</p>
          <span class="mp-carta-vai">Apri ${ico('destra')}</span>
        </a>
      </section>
      <section class="mp-due">
        <div class="mp-box"><h3>Ultime richieste</h3><div class="mp-ric-lista-mini">${ultime}</div></div>
        <div class="mp-box"><h3>Come funziona</h3>
          <ol class="mp-passi">
            <li><span>1</span><div><strong>Scegli una sezione</strong><p>Apri «Il tuo sito» e tocca la parte che vuoi cambiare.</p></div></li>
            <li><span>2</span><div><strong>Cambia testi e foto</strong><p>Scrivi come in un normale documento, scegli le foto con un tocco.</p></div></li>
            <li><span>3</span><div><strong>Salva</strong><p>Il sito si aggiorna subito. Hai sbagliato? «Annulla l’ultima modifica» e torna com’era.</p></div></li>
          </ol>
        </div>
      </section>`;
  }

  /* ---------- Elenco pagine ---------- */
  function vistaSito() {
    attiva('sito');
    titolo('Il tuo sito');
    const p = S.stato.pagine;
    if (p.length === 1) { location.replace('#/sito/' + p[0].id); return; }
    $('#mp-main').innerHTML = `<section class="mp-intro"><h1>Le pagine del tuo sito</h1><p>Scegli la pagina da modificare.</p></section>
      <div class="mp-lista">${p.map((x) => `<a class="mp-riga" href="#/sito/${x.id}"><span class="mp-riga-ico">${ico('sito')}</span><div><strong>${esc(x.titolo)}</strong><small>${x.sezioni} sezioni · modificata il ${esc(x.modificata)}</small></div>${ico('destra', 'mp-riga-vai')}</a>`).join('') || '<p class="mp-vuoto">Non ci sono ancora pagine da modificare.</p>'}</div>`;
  }

  /* ---------- Editor della pagina ---------- */
  async function vistaPagina(id, indice) {
    attiva('sito');
    if (!S.pagina || S.pagina.id !== id) {
      $('#mp-main').innerHTML = '<div class="mp-carico"><span></span>Apro la pagina…</div>';
      try { S.pagina = await api('pagina/' + id); } catch (e) { $('#mp-main').innerHTML = `<p class="mp-vuoto">${esc(e.message)}</p>`; return; }
    }
    const pg = S.pagina;
    titolo(esc(pg.titolo), `<button class="mp-btn mp-btn-leggero mp-solo-tel" data-azione="anteprima">${ico('occhio')}<span>Anteprima</span></button><a class="mp-btn mp-btn-leggero" href="${esc(pg.url)}" target="_blank" rel="noopener">${ico('apri')}<span>Vedi il sito</span></a>`);
    if (!$('.mp-editor')) {
      $('#mp-main').innerHTML = `<div class="mp-editor">
        <div class="mp-ed-sx" id="mp-ed-sx"></div>
        <div class="mp-ed-dx" id="mp-ed-dx">
          <div class="mp-prev-barra">
            <div class="mp-seg" role="group" aria-label="Anteprima"><button data-device="computer" class="mp-on">${ico('computer')}<span>Computer</span></button><button data-device="telefono">${ico('telefono')}<span>Telefono</span></button></div>
            <span class="mp-prev-nota">Anteprima dal vivo</span>
            <button class="mp-btn mp-btn-icona mp-solo-tel" data-azione="chiudi-anteprima" aria-label="Chiudi l’anteprima">${ico('chiudi')}</button>
          </div>
          <div class="mp-prev-area"><div class="mp-prev-cornice" data-device="${S.device}"><iframe id="mp-iframe" title="Anteprima del sito"></iframe><div class="mp-prev-velo"><span></span></div></div></div>
        </div>
      </div>`;
      scalaAnteprima();
      caricaAnteprima();
    }
    if (indice === null || indice === undefined || !pg.sezioni[indice]) elencoSezioni();
    else apriSezione(indice);
  }

  function elencoSezioni() {
    S.sezione = null; S.bozza = null; S.sporco = false;
    const pg = S.pagina;
    $('#mp-ed-sx').innerHTML = `<div class="mp-ed-testa"><div><h1>${esc(pg.titolo)}</h1><p>Tocca una sezione per modificarla.</p></div>
        ${pg.annullabile ? `<button class="mp-btn mp-btn-leggero" data-azione="annulla-pagina">${ico('annulla')}<span>Annulla l’ultima modifica</span></button>` : ''}</div>
      <ol class="mp-sezioni">${pg.sezioni.map((s) => `<li><a href="#/sito/${pg.id}/${s.indice}" data-ancora="${esc(s.ancora)}"><span class="mp-sez-ico">${ico(s.tipo)}</span><span class="mp-sez-testo"><em>${esc(s.nome)}</em><strong>${esc(s.etichetta || s.riassunto || s.nome)}</strong>${s.etichetta && s.riassunto && s.riassunto !== s.etichetta ? `<small>${esc(s.riassunto)}</small>` : ''}</span>${ico('destra', 'mp-riga-vai')}</a></li>`).join('')}</ol>`;
    $$('.mp-sezioni a').forEach((a) => a.addEventListener('mouseenter', () => scorriAnteprima(a.dataset.ancora, false)));
  }

  function apriSezione(i) {
    const s = S.pagina.sezioni[i];
    S.sezione = s;
    S.bozza = JSON.parse(JSON.stringify(s.valori));
    S.sporco = false;
    const gruppi = [...new Set(s.campi.map((f) => f.gruppo))];
    if (!gruppi.includes(S.gruppo)) S.gruppo = gruppi[0];
    const nomiGruppi = { Testi: 'Testi', Elenchi: 'Elenchi', Foto: 'Foto', Sfondo: 'Colore e sfondo' };
    $('#mp-ed-sx').innerHTML = `<div class="mp-form">
      <div class="mp-form-testa"><a class="mp-indietro" href="#/sito/${S.pagina.id}">${ico('sinistra')}<span>Tutte le sezioni</span></a>
        <div class="mp-form-titolo"><span class="mp-sez-ico">${ico(s.tipo)}</span><div><em>${esc(s.nome)}</em><h1>${esc(s.etichetta || s.nome)}</h1></div></div>
        ${gruppi.length > 1 ? `<div class="mp-schede" role="tablist">${gruppi.map((g) => `<button role="tab" data-gruppo="${esc(g)}" aria-selected="${g === S.gruppo}">${esc(nomiGruppi[g] || g)}</button>`).join('')}</div>` : ''}
      </div>
      <div class="mp-campi" id="mp-campi"></div>
      <div class="mp-form-piede"><button class="mp-btn" data-azione="scarta" disabled>Annulla</button><button class="mp-btn mp-btn-primario" data-azione="salva" disabled>${ico('ok')}<span>Salva le modifiche</span></button></div>
    </div>`;
    disegnaCampi();
    scorriAnteprima(s.ancora, true);
  }

  function disegnaCampi() {
    const s = S.sezione;
    const box = $('#mp-campi');
    box.innerHTML = s.campi.filter((f) => f.gruppo === S.gruppo).map((f) => campoHTML(f, S.bozza[f.nome], f.nome)).join('');
    autoAltezza(box);
  }

  function campoHTML(f, v, chiave) {
    const id = 'mp-f-' + chiave.replace(/[^a-z0-9]/gi, '-');
    const aiuto = f.aiuto ? `<small class="mp-aiuto">${esc(f.aiuto)}</small>` : '';
    switch (f.tipo) {
      case 'testo':
        return `<label class="mp-campo" for="${id}"><span>${esc(f.etichetta)}</span><input id="${id}" data-k="${esc(chiave)}" value="${esc(v)}">${aiuto}</label>`;
      case 'testo_lungo':
        return `<label class="mp-campo" for="${id}"><span>${esc(f.etichetta)}</span><textarea id="${id}" data-k="${esc(chiave)}" rows="2">${esc(v)}</textarea>${aiuto || '<small class="mp-aiuto">Per andare a capo premi Invio.</small>'}</label>`;
      case 'scelta':
        if (f.opzioni.length <= 3) {
          return `<div class="mp-campo"><span>${esc(f.etichetta)}</span><div class="mp-seg mp-seg-campo" role="radiogroup">${f.opzioni.map((o) => `<button type="button" role="radio" data-k="${esc(chiave)}" data-v="${esc(o.value)}" aria-checked="${String(v) === o.value}">${esc(o.label)}</button>`).join('')}</div>${aiuto}</div>`;
        }
        return `<label class="mp-campo" for="${id}"><span>${esc(f.etichetta)}</span><select id="${id}" data-k="${esc(chiave)}">${f.opzioni.map((o) => `<option value="${esc(o.value)}"${String(v) === o.value ? ' selected' : ''}>${esc(o.label)}</option>`).join('')}</select>${aiuto}</label>`;
      case 'foto':
        return `<div class="mp-campo"><span>${esc(f.etichetta)}</span>${v && v.url
          ? `<div class="mp-foto-campo"><img src="${esc(v.url)}" alt=""><div class="mp-foto-az"><button type="button" class="mp-btn mp-btn-chiaro" data-scegli="${esc(chiave)}">${ico('foto')}<span>Cambia foto</span></button><button type="button" class="mp-btn mp-btn-icona mp-btn-chiaro" data-togli="${esc(chiave)}" aria-label="Togli la foto">${ico('cestino')}</button></div></div>`
          : `<button type="button" class="mp-foto-vuota" data-scegli="${esc(chiave)}">${ico('foto')}<strong>Aggiungi una foto</strong><small>JPG o PNG. Se lasci vuoto si usa quella di serie.</small></button>`}${aiuto}</div>`;
      case 'colore': {
        const tav = ['', '#ffffff', '#f4f5f7', '#0f172a', getComputedStyle(document.documentElement).getPropertyValue('--p').trim()];
        return `<div class="mp-campo"><span>${esc(f.etichetta)}</span><div class="mp-colori">${tav.map((c) => `<button type="button" class="mp-colore${c === '' ? ' mp-colore-nessuno' : ''}" style="${c ? 'background:' + esc(c) : ''}" data-k="${esc(chiave)}" data-v="${esc(c)}" aria-pressed="${(v || '') === c}" aria-label="${c || 'Colore originale'}">${c === '' ? 'Originale' : ''}</button>`).join('')}<label class="mp-colore mp-colore-scegli" aria-label="Scegli un colore"><input type="color" data-k="${esc(chiave)}" value="${esc(v || '#ffffff')}">${ico('piu')}</label></div>${aiuto}</div>`;
      }
      case 'elenco': {
        const voci = (v || []).map((voce, j) => {
          const testa = f.campi.map((c) => voce[c.nome]).find((x) => typeof x === 'string' && x.trim()) || `Voce ${j + 1}`;
          const corpo = f.campi.map((c) => campoHTML(c, voce[c.nome], `${chiave}.${j}.${c.nome}`)).join('');
          return `<details class="mp-voce"${(v || []).length <= 1 ? ' open' : ''}><summary><span class="mp-voce-n">${j + 1}</span><span class="mp-voce-t">${esc(testa.split('\n')[0])}</span><span class="mp-voce-az"><button type="button" class="mp-btn mp-btn-icona" data-sposta="${esc(chiave)}" data-j="${j}" data-dir="-1" aria-label="Sposta su"${j === 0 ? ' disabled' : ''}>${ico('su')}</button><button type="button" class="mp-btn mp-btn-icona" data-sposta="${esc(chiave)}" data-j="${j}" data-dir="1" aria-label="Sposta giù"${j === v.length - 1 ? ' disabled' : ''}>${ico('giu')}</button><button type="button" class="mp-btn mp-btn-icona mp-btn-rosso" data-elimina="${esc(chiave)}" data-j="${j}" aria-label="Elimina">${ico('cestino')}</button></span></summary><div class="mp-voce-corpo">${corpo}</div></details>`;
        }).join('');
        return `<div class="mp-campo mp-campo-elenco"><span>${esc(f.etichetta)}</span><div class="mp-voci">${voci || '<p class="mp-vuoto-piccolo">Ancora vuoto.</p>'}</div><button type="button" class="mp-btn mp-btn-tratteggio" data-aggiungi="${esc(chiave)}">${ico('piu')}<span>Aggiungi</span></button></div>`;
      }
    }
    return '';
  }

  // Valori annidati: «punti.2.titolo»
  function trova(chiave) {
    const parti = chiave.split('.');
    let campo = S.sezione.campi.find((f) => f.nome === parti[0]);
    let obj = S.bozza; let k = parti[0];
    for (let i = 1; i < parti.length; i += 2) {
      obj = obj[k][Number(parti[i])];
      k = parti[i + 1];
      campo = campo.campi.find((c) => c.nome === k);
    }
    return { obj, k, campo };
  }
  function imposta(chiave, valore) {
    const { obj, k } = trova(chiave);
    obj[k] = valore;
    sporca();
  }
  function sporca() {
    S.sporco = true;
    $$('[data-azione="salva"],[data-azione="scarta"]').forEach((b) => { b.disabled = false; });
  }
  function autoAltezza(el) {
    $$('textarea', el).forEach((t) => { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight + 2, 360) + 'px'; });
  }

  async function salva() {
    const b = $('[data-azione="salva"]');
    b.disabled = true; b.classList.add('mp-lavora');
    try {
      const { sezione } = await api(`pagina/${S.pagina.id}/sezione/${S.sezione.indice}`, { method: 'POST', json: { valori: S.bozza } });
      S.pagina.sezioni[sezione.indice] = sezione;
      S.pagina.annullabile = true;
      S.sezione = sezione;
      S.bozza = JSON.parse(JSON.stringify(sezione.valori));
      S.sporco = false;
      disegnaCampi();
      $$('[data-azione="salva"],[data-azione="scarta"]').forEach((x) => { x.disabled = true; });
      toast('Fatto! Il sito è aggiornato.');
      caricaAnteprima(sezione.ancora);
    } catch (e) {
      toast(e.message, 'errore');
      b.disabled = false;
    }
    b.classList.remove('mp-lavora');
  }

  /* ---------- Anteprima ---------- */
  function caricaAnteprima(ancora) {
    const f = $('#mp-iframe');
    if (!f) return;
    const cornice = f.parentElement;
    cornice.classList.add('mp-carica');
    const u = new URL(S.pagina.url);
    u.searchParams.set('mo_anteprima', Date.now());
    f.onload = () => {
      setTimeout(() => { cornice.classList.remove('mp-carica'); if (ancora || S.sezione) scorriAnteprima(ancora || S.sezione.ancora, true); }, 700);
    };
    f.src = u.toString();
  }
  function scalaAnteprima() {
    const c = $('.mp-prev-cornice'); const f = $('#mp-iframe');
    if (!c || !f) return;
    const W = 1366;
    if (S.device === 'computer' && window.innerWidth > 860 && c.clientWidth < W) {
      const k = c.clientWidth / W;
      Object.assign(f.style, { width: W + 'px', height: c.clientHeight / k + 'px', transform: `scale(${k})`, transformOrigin: '0 0' });
    } else {
      Object.assign(f.style, { width: '', height: '', transform: '', transformOrigin: '' });
    }
  }
  window.addEventListener('resize', scalaAnteprima);
  function scorriAnteprima(ancora, evidenzia) {
    const f = $('#mp-iframe');
    if (!f || !ancora) return;
    try {
      const w = f.contentWindow; const d = f.contentDocument;
      const el = d && d.getElementById(ancora);
      if (!el) return;
      const y = el.getBoundingClientRect().top + w.scrollY - 70;
      if (w.moLenis) w.moLenis.scrollTo(Math.max(0, y), { duration: 0.8, force: true }); else w.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      if (evidenzia) {
        el.style.transition = 'box-shadow .4s'; el.style.boxShadow = 'inset 0 0 0 4px ' + getComputedStyle(document.documentElement).getPropertyValue('--p');
        setTimeout(() => { el.style.boxShadow = ''; }, 1600);
      }
    } catch (e) { /* anteprima di un altro sito: niente */ }
  }

  /* ---------- Foto ---------- */
  async function caricaFoto(forza) {
    if (!S.foto || forza) S.foto = (await api('foto')).foto;
    return S.foto;
  }
  function grigliaFoto(foto, scegli) {
    return `<div class="mp-griglia">${foto.map((x) => `<button type="button" class="mp-foto" data-foto="${x.id}" ${scegli ? '' : 'tabindex="-1"'}><img src="${esc(x.mini || x.url)}" alt="${esc(x.nome)}" loading="lazy"></button>`).join('')}</div>`;
  }
  function zonaCarica() {
    return `<label class="mp-carica-zona"><input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden data-carica>${ico('carica')}<strong>Carica una foto</strong><small>Trascinala qui o tocca per sceglierla · JPG o PNG</small></label>`;
  }
  async function carica(files, dopo) {
    for (const file of files) {
      const fd = new FormData(); fd.append('foto', file);
      const t = document.createElement('div'); t.className = 'mp-foto mp-foto-carica'; t.innerHTML = '<span></span>';
      $('.mp-griglia')?.prepend(t);
      try {
        const { foto } = await api('foto', { method: 'POST', form: fd });
        S.foto = [foto, ...(S.foto || [])];
        dopo && dopo(foto);
      } catch (e) { toast(e.message, 'errore'); }
      t.remove();
    }
  }
  function collegaCarica(el, dopo) {
    const inp = $('[data-carica]', el);
    inp?.addEventListener('change', () => carica([...inp.files], dopo));
    const zona = $('.mp-carica-zona', el);
    if (!zona) return;
    ['dragenter', 'dragover'].forEach((t) => zona.addEventListener(t, (e) => { e.preventDefault(); zona.classList.add('mp-sopra'); }));
    ['dragleave', 'drop'].forEach((t) => zona.addEventListener(t, (e) => { e.preventDefault(); zona.classList.remove('mp-sopra'); }));
    zona.addEventListener('drop', (e) => carica([...e.dataTransfer.files].filter((f) => /^image\//.test(f.type)), dopo));
  }
  async function vistaFoto() {
    attiva('foto');
    titolo('Le tue foto');
    $('#mp-main').innerHTML = '<div class="mp-carico"><span></span>Carico le foto…</div>';
    const foto = await caricaFoto();
    const disegna = () => {
      $('#mp-main').innerHTML = `<section class="mp-intro"><h1>Le tue foto</h1><p>Qui trovi le foto caricate. Per metterne una nel sito, apri una sezione e tocca «Cambia foto».</p></section>${zonaCarica()}${S.foto.length ? grigliaFoto(S.foto, false) : '<p class="mp-vuoto">Non hai ancora caricato foto.</p>'}`;
      collegaCarica($('#mp-main'), () => { disegna(); toast('Foto caricata.'); });
    };
    S.foto = foto;
    disegna();
  }
  async function scegliFoto() {
    return new Promise(async (ok) => {
      const d = document.createElement('div');
      d.className = 'mp-dialogo mp-dialogo-foto';
      d.innerHTML = `<div class="mp-dialogo-box" role="dialog" aria-modal="true" aria-labelledby="mp-sf"><div class="mp-dialogo-testa"><h2 id="mp-sf">Scegli una foto</h2><button class="mp-btn mp-btn-icona" data-chiudi aria-label="Chiudi">${ico('chiudi')}</button></div><div class="mp-dialogo-corpo"><div class="mp-carico"><span></span>Carico le foto…</div></div></div>`;
      document.body.appendChild(d);
      requestAnimationFrame(() => d.classList.add('mp-vis'));
      const tasto = (e) => { if (e.key === 'Escape') chiudi(null); };
      const chiudi = (v) => { document.removeEventListener('keydown', tasto); d.classList.remove('mp-vis'); setTimeout(() => d.remove(), 250); ok(v); };
      document.addEventListener('keydown', tasto);
      $('[data-chiudi]', d).focus();
      d.addEventListener('click', (e) => {
        if (e.target === d || e.target.closest('[data-chiudi]')) return chiudi(null);
        const b = e.target.closest('[data-foto]');
        if (b) chiudi(S.foto.find((x) => String(x.id) === b.dataset.foto));
      });
      const foto = await caricaFoto();
      $('.mp-dialogo-corpo', d).innerHTML = zonaCarica() + (foto.length ? grigliaFoto(foto, true) : '<p class="mp-vuoto-piccolo">Carica la prima foto qui sopra.</p>');
      collegaCarica(d, (nuova) => chiudi(nuova));
    });
  }

  /* ---------- Richieste ---------- */
  async function vistaRichieste(id) {
    attiva('richieste');
    titolo('Richieste');
    if (!S.richieste) {
      $('#mp-main').innerHTML = '<div class="mp-carico"><span></span>Carico le richieste…</div>';
      S.richieste = (await api('richieste')).richieste;
    }
    const r = S.richieste;
    const sel = id ? r.find((x) => x.id === id) : null;
    if (!r.length) {
      $('#mp-main').innerHTML = '<section class="mp-intro"><h1>Richieste</h1><p>Quando qualcuno compila il modulo del sito, la richiesta arriva qui e per email.</p></section><p class="mp-vuoto">Ancora nessuna richiesta.</p>';
      return;
    }
    const lista = r.map((x) => `<a class="mp-ric${sel && sel.id === x.id ? ' mp-sel' : ''}" href="#/richieste/${x.id}"><span class="mp-ric-punto ${x.letta ? '' : 'mp-nuova'}"></span><span class="mp-ric-testo"><strong>${esc(x.nome)}</strong><small>${esc(x.area)}</small><em>${esc((x.messaggio || '').slice(0, 80))}</em></span><time>${esc(x.quando)}</time></a>`).join('');
    const tel = sel && sel.telefono ? sel.telefono.replace(/[^\d+]/g, '') : '';
    const wa = tel ? 'https://wa.me/' + (tel.startsWith('+') ? tel.slice(1) : '39' + tel) : '';
    const dettaglio = sel ? `<article class="mp-ric-det">
        <button class="mp-btn mp-btn-leggero mp-solo-tel" onclick="location.hash='#/richieste'">${ico('sinistra')}<span>Tutte</span></button>
        <header><div class="mp-avatar">${esc((sel.nome || '?').slice(0, 1).toUpperCase())}</div><div><h2>${esc(sel.nome)}</h2><p>${esc(sel.quando)}${sel.area ? ' · ' + esc(sel.area) : ''}</p></div></header>
        <div class="mp-ric-az">${sel.email ? `<a class="mp-btn mp-btn-primario" href="mailto:${esc(sel.email)}?subject=${encodeURIComponent('Risposta alla tua richiesta')}">${ico('posta')}<span>Rispondi</span></a>` : ''}${tel ? `<a class="mp-btn" href="tel:${esc(tel)}">${ico('chiama')}<span>Chiama</span></a><a class="mp-btn" href="${esc(wa)}" target="_blank" rel="noopener">${ico('chat')}<span>WhatsApp</span></a>` : ''}</div>
        <dl><div><dt>Email</dt><dd>${esc(sel.email) || '—'}</dd></div><div><dt>Telefono</dt><dd>${esc(sel.telefono) || '—'}</dd></div></dl>
        <div class="mp-ric-msg">${esc(sel.messaggio).replace(/\n/g, '<br>')}</div>
      </article>` : '<div class="mp-ric-vuota">' + ico('posta') + '<p>Scegli una richiesta per leggerla.</p></div>';
    $('#mp-main').innerHTML = `<div class="mp-ric-layout${sel ? ' mp-ha-sel' : ''}"><div class="mp-ric-lista">${lista}</div>${dettaglio}</div>`;
    if (sel && !sel.letta) {
      sel.letta = true;
      S.stato.nuove = Math.max(0, S.stato.nuove - 1);
      aggiornaBadge();
      $(`.mp-ric[href="#/richieste/${sel.id}"] .mp-ric-punto`)?.classList.remove('mp-nuova');
      api(`richieste/${sel.id}/letta`, { method: 'POST' }).catch(() => {});
    }
  }

  /* ---------- Aiuto ---------- */
  function vistaAiuto() {
    attiva('aiuto');
    titolo('Aiuto');
    const a = S.stato.aiuto;
    const domande = [
      ['Come cambio un testo?', 'Apri «Il tuo sito», tocca la sezione e scrivi nel campo. Quando hai finito premi «Salva le modifiche»: il sito si aggiorna subito.'],
      ['Come cambio una foto?', 'Nella sezione, scheda «Foto», tocca «Cambia foto». Puoi sceglierne una già caricata o caricarne una nuova dal computer o dal telefono.'],
      ['Ho sbagliato: come torno indietro?', 'Nella pagina con l’elenco delle sezioni c’è «Annulla l’ultima modifica»: il sito torna com’era prima dell’ultimo salvataggio.'],
      ['Come aggiungo una domanda, un servizio, una recensione?', 'Negli elenchi c’è il pulsante «Aggiungi». Con le frecce cambi l’ordine, con il cestino togli una voce.'],
      ['Dove vedo chi mi ha scritto?', 'In «Richieste» trovi tutti i messaggi del modulo, con i pulsanti per rispondere, chiamare o scrivere su WhatsApp. Ti arrivano anche per email.'],
    ];
    $('#mp-main').innerHTML = `<section class="mp-intro"><h1>Come possiamo aiutarti?</h1><p>Le risposte alle domande più comuni. Per tutto il resto, scrivici.</p></section>
      <div class="mp-aiuto-layout"><div class="mp-faq">${domande.map(([d, r]) => `<details><summary>${esc(d)}${ico('giu')}</summary><p>${esc(r)}</p></details>`).join('')}</div>
      <aside class="mp-box mp-contatto"><img src="${esc(LOGO_MOVEON)}" alt="MoveOn" width="110" height="24"><h3>Serve una mano?</h3><p>Per modifiche più grandi, nuove pagine o un consiglio, scrivi a chi ha realizzato il tuo sito.</p>${a.whatsapp ? `<a class="mp-btn mp-btn-primario mp-btn-largo" href="${esc(a.whatsapp)}" target="_blank" rel="noopener">${ico('chat')}<span>Scrivi su WhatsApp</span></a>` : ''}${a.email ? `<a class="mp-btn mp-btn-largo" href="mailto:${esc(a.email)}">${ico('posta')}<span>Manda un’email</span></a>` : ''}</aside></div>`;
  }

  /* ---------- Navigazione ---------- */
  let hashPrima = location.hash;
  async function vai() {
    if (!S.stato) return; // il pannello si sta ancora aprendo: ci pensa l'avvio
    const h = location.hash.replace(/^#\/?/, '');
    const parti = h.split('/');
    if (S.sporco && !(await conferma('Modifiche non salvate', 'Hai cambiato qualcosa senza salvare. Vuoi uscire e perdere le modifiche?', 'Esci senza salvare', 'Resta qui', true))) {
      history.replaceState(null, '', hashPrima);
      return;
    }
    S.sporco = false;
    hashPrima = location.hash;
    document.body.classList.remove('mp-anteprima-aperta');
    if (parti[0] !== 'sito' || !parti[1]) { /* uscendo dall'editor si ridisegna */ }
    try {
      if (parti[0] === 'sito' && parti[1]) await vistaPagina(Number(parti[1]), parti[2] !== undefined ? Number(parti[2]) : null);
      else if (parti[0] === 'sito') vistaSito();
      else if (parti[0] === 'foto') await vistaFoto();
      else if (parti[0] === 'richieste') await vistaRichieste(parti[1] ? Number(parti[1]) : null);
      else if (parti[0] === 'aiuto') vistaAiuto();
      else vistaBacheca();
    } catch (e) {
      $('#mp-main').innerHTML = `<p class="mp-vuoto">${esc(e.message)}</p>`;
    }
    if (!(parti[0] === 'sito' && parti[1])) S.pagina = null;
    $('#mp-main').focus({ preventScroll: true });
  }
  window.addEventListener('hashchange', vai);
  window.addEventListener('beforeunload', (e) => { if (S.sporco) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- Eventi dei campi ---------- */
  root.addEventListener('input', (e) => {
    const t = e.target;
    if (t.matches('textarea')) autoAltezza(t.parentElement);
    if (!t.dataset.k || !S.sezione) return;
    if (t.type === 'color') { imposta(t.dataset.k, t.value); $$(`.mp-colore[data-k="${CSS.escape(t.dataset.k)}"]`).forEach((b) => b.setAttribute('aria-pressed', 'false')); return; }
    imposta(t.dataset.k, t.value);
    const voce = t.closest('.mp-voce');
    if (voce && t === $('input,textarea', $('.mp-voce-corpo', voce))) $('.mp-voce-t', voce).textContent = t.value.split('\n')[0] || 'Voce';
  });
  root.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('select[data-k]') && S.sezione) imposta(t.dataset.k, t.value);
  });
  root.addEventListener('click', async (e) => {
    const b = e.target.closest('button, a');
    if (!b) return;
    if (b.dataset.gruppo) { S.gruppo = b.dataset.gruppo; $$('[data-gruppo]').forEach((x) => x.setAttribute('aria-selected', String(x === b))); disegnaCampi(); return; }
    if (b.dataset.v !== undefined && b.dataset.k) {
      imposta(b.dataset.k, b.dataset.v);
      $$(`[data-k="${CSS.escape(b.dataset.k)}"][data-v]`).forEach((x) => x.setAttribute(x.getAttribute('role') === 'radio' ? 'aria-checked' : 'aria-pressed', String(x === b)));
      return;
    }
    if (b.dataset.scegli) {
      const f = await scegliFoto();
      if (f) { imposta(b.dataset.scegli, { id: f.id, url: f.url }); disegnaCampi(); }
      return;
    }
    if (b.dataset.togli) { imposta(b.dataset.togli, { id: 0, url: '' }); disegnaCampi(); return; }
    if (b.dataset.aggiungi) {
      const { obj, k, campo } = trova(b.dataset.aggiungi);
      const nuova = {};
      campo.campi.forEach((c) => { nuova[c.nome] = c.tipo === 'foto' ? { id: 0, url: '' } : c.tipo === 'scelta' ? (c.opzioni[0] || {}).value || '' : ''; });
      obj[k] = [...(obj[k] || []), nuova];
      sporca(); disegnaCampi();
      const ult = $$('.mp-voce', $(`[data-aggiungi="${CSS.escape(b.dataset.aggiungi)}"]`).parentElement).pop();
      if (ult) { ult.open = true; ult.scrollIntoView({ block: 'center', behavior: 'smooth' }); $('input,textarea', ult)?.focus({ preventScroll: true }); }
      return;
    }
    if (b.dataset.elimina) {
      e.preventDefault();
      if (!(await conferma('Eliminare questa voce?', 'La voce sparirà dal sito quando salvi.', 'Elimina', 'Annulla', true))) return;
      const { obj, k } = trova(b.dataset.elimina);
      obj[k].splice(Number(b.dataset.j), 1);
      sporca(); disegnaCampi();
      return;
    }
    if (b.dataset.sposta) {
      e.preventDefault();
      const { obj, k } = trova(b.dataset.sposta);
      const j = Number(b.dataset.j); const n = j + Number(b.dataset.dir);
      if (n < 0 || n >= obj[k].length) return;
      [obj[k][j], obj[k][n]] = [obj[k][n], obj[k][j]];
      sporca(); disegnaCampi();
      return;
    }
    if (b.dataset.device) {
      S.device = b.dataset.device;
      $$('[data-device]', $('.mp-prev-barra')).forEach((x) => x.classList.toggle('mp-on', x === b));
      $('.mp-prev-cornice').dataset.device = S.device;
      scalaAnteprima();
      setTimeout(() => { scalaAnteprima(); if (S.sezione) scorriAnteprima(S.sezione.ancora, false); }, 450);
      return;
    }
    switch (b.dataset.azione) {
      case 'salva': salva(); break;
      case 'scarta':
        S.bozza = JSON.parse(JSON.stringify(S.sezione.valori)); S.sporco = false; disegnaCampi();
        $$('[data-azione="salva"],[data-azione="scarta"]').forEach((x) => { x.disabled = true; });
        break;
      case 'annulla-pagina':
        if (!(await conferma('Annullare l’ultima modifica?', 'Il sito torna com’era prima dell’ultimo salvataggio.', 'Sì, annulla', 'No'))) return;
        try { S.pagina = await api(`pagina/${S.pagina.id}/annulla`, { method: 'POST' }); elencoSezioni(); caricaAnteprima(); toast('Ultima modifica annullata.'); } catch (err) { toast(err.message, 'errore'); }
        break;
      case 'anteprima':
        document.body.classList.add('mp-anteprima-aperta');
        setTimeout(() => S.sezione && scorriAnteprima(S.sezione.ancora, true), 300);
        break;
      case 'chiudi-anteprima': document.body.classList.remove('mp-anteprima-aperta'); break;
    }
  });
  // Trascinare le foto anche fuori dalla zona non deve aprire il file nel browser
  ['dragover', 'drop'].forEach((t) => window.addEventListener(t, (e) => { if (!e.target.closest || !e.target.closest('.mp-carica-zona')) e.preventDefault(); }));

  /* ---------- Avvio ---------- */
  (async () => {
    root.innerHTML = '<div class="mp-avvio"><span></span></div>';
    try {
      S.stato = await api('stato');
    } catch (e) {
      root.innerHTML = `<p class="mp-vuoto">${esc(e.message)} <a href="${esc(ESCI)}">Esci</a></p>`;
      return;
    }
    guscio();
    vai();
  })();
})();
