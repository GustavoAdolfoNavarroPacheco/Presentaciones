/* ==========================================================================
   portal.js — Lógica del portal de presentaciones
   Datos: assets/portal/decks.js (window.DECKS) · Componentes: assets/portal/ui.js
   Secciones: 1 Configuración · 2 Utilidades · 3 Estado y URL · 4 Sesión
              5 Tarjetas · 6 Render con animación · 7 Controles · 8 Arranque
   ========================================================================== */
(function () {
  'use strict';

  const { createSelect, toast, esc, prefersReducedMotion } = window.UI;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const EASE = 'cubic-bezier(.22, .8, .24, 1)';

  /* ---------- 1. CONFIGURACIÓN ---------- */

  const CANON = 'https://fullservicepresentations.vercel.app'; // base de los enlaces que se copian
  const IS_LOCAL = location.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]', ''].includes(location.hostname);

  // Color por categoría (Brandbook): punto del tag, filete superior y resplandor del logo.
  const CATS = [
    { id: 'ia', label: 'Agentes de IA', dot: '#5E3AE2', grad: 'linear-gradient(100deg, #5E3AE2, #3A2BC4)', glow: 'rgba(94, 58, 226, .35)', tex: 'rgba(94, 58, 226, .24)' },
    { id: 'software', label: 'Software & ecosistemas', dot: '#2CAAFF', grad: 'linear-gradient(100deg, #0A67AE, #000087)', glow: 'rgba(10, 103, 174, .35)', tex: 'rgba(10, 103, 174, .24)' },
    { id: 'demos', label: 'Demos', dot: '#00AA80', grad: 'linear-gradient(100deg, #00896A, #005E48)', glow: 'rgba(0, 137, 106, .35)', tex: 'rgba(0, 137, 106, .24)' },
    { id: 'institucional', label: 'Institucional', dot: '#000087', grad: 'linear-gradient(100deg, #000087, #3A2BC4)', glow: 'rgba(0, 0, 135, .3)', tex: 'rgba(0, 0, 135, .2)' },
  ];
  const CAT_BY_ID = Object.fromEntries(CATS.map((c) => [c.id, c]));

  // Texturas de tarjeta (definidas en portal.css como .tex-0 … .tex-5). Cada deck recibe una combinación
  // textura + esquina a partir de su slug: estable (no cambia al agregar decks nuevos) y variada entre vecinas.
  const TEXTURES = 6;
  const ANCHORS = [['100%', '0%'], ['0%', '0%'], ['100%', '60%']];
  function hashOf(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  const SORTS = [
    { value: 'recent', label: 'Más recientes' },
    { value: 'oldest', label: 'Más antiguos' },
    { value: 'client', label: 'Cliente A–Z' },
  ];
  const MONTH_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const DEFAULTS = { q: '', cat: 'all', cli: 'all', mes: 'all', sort: 'recent', vista: 'grid' };
  // En la URL: ?q=marval&cat=ia&cli=Marval&mes=2026-09&sort=client&vista=lista (solo lo que difiere del valor por defecto)
  const PARAMS = Object.keys(DEFAULTS);

  const ICON = {
    web: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.6v14.8a1 1 0 0 0 1.5.86l12-7.4a1 1 0 0 0 0-1.72l-12-7.4A1 1 0 0 0 7 4.6z"/></svg>',
    demo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2"/></svg>',
    pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    copy: '<svg class="i-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg><svg class="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
  };

  /* ---------- 2. UTILIDADES ---------- */

  /** Minúsculas y sin tildes: "Facturación" coincide con "facturacion". */
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function monogram(client) {
    const words = client.split(/\s+/).filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w));
    return ((words[0] || client)[0] + (words[1] ? words[1][0] : '')).toUpperCase();
  }

  /** Completa cada registro de decks.js con los campos derivados que usa el portal. */
  function prepare(d, index) {
    const [y, m, day] = d.date.split('-').map(Number);
    return Object.assign({}, d, {
      _order: index,
      _month: d.date.slice(0, 7),
      _dateLabel: day + ' ' + MONTH_SHORT[m - 1] + ' ' + y,
      _mono: monogram(d.client),
      _hay: norm([d.client, d.company, d.title, d.desc, d.keywords, d.slug, d.categoryLabel, d.investment, d.slides,
        (CAT_BY_ID[d.category] || {}).label, MONTH_NAMES[m - 1], day + ' ' + MONTH_SHORT[m - 1] + ' ' + y].join(' ')),
    });
  }
  const DECKS = (window.DECKS || []).map(prepare);
  const CLIENTS = [...new Set(DECKS.map((d) => d.client))].sort((a, b) => a.localeCompare(b, 'es'));
  const MONTH_KEYS = [...new Set(DECKS.map((d) => d._month))].sort().reverse();
  const monthLabel = (key) => MONTH_NAMES[Number(key.slice(5, 7)) - 1] + ' ' + key.slice(0, 4);
  const labelOf = (list, value) => (list.find((o) => o.value === value || o.id === value) || {}).label || value;

  /** Destino de la presentación: URL limpia `/<slug>/` en producción; ruta real en local o en demos (/docs). */
  const openHref = (d) => (IS_LOCAL || d.path !== d.slug + '/index.html' ? d.path : '/' + d.slug + '/');

  /** Archivos asociados a una presentación, con su tipo para mostrar icono/etiqueta. */
  function filesOf(d) {
    const isDemo = d.category === 'demos';
    const files = [{ kind: isDemo ? 'demo' : 'web', label: isDemo ? 'Demo' : 'Web', title: isDemo ? 'Abrir demo interactiva' : 'Abrir presentación', href: openHref(d) }];
    if (d.pdf) files.push({ kind: 'pdf', label: 'PDF', title: 'Abrir PDF', href: d.pdf });
    return files;
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {
      const t = document.createElement('textarea');
      t.value = text; t.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(t); t.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { /* sin portapapeles */ }
      t.remove();
      return ok;
    }
  }

  /* ---------- 3. ESTADO Y URL ---------- */

  let state = Object.assign({}, DEFAULTS);

  function readUrl() {
    const p = new URLSearchParams(location.search);
    const s = Object.assign({}, DEFAULTS);
    s.q = (p.get('q') || '').trim().slice(0, 80);
    const pick = (key, valid) => { const v = p.get(key); if (v && valid(v)) s[key] = v; };
    pick('cat', (v) => CAT_BY_ID[v]);
    pick('cli', (v) => CLIENTS.includes(v));
    pick('mes', (v) => MONTH_KEYS.includes(v));
    pick('sort', (v) => SORTS.some((o) => o.value === v));
    pick('vista', (v) => v === 'grid' || v === 'lista');
    return s;
  }

  /** Refleja el estado en la URL; solo escribe los valores distintos del predeterminado. */
  function writeUrl(mode) {
    const p = new URLSearchParams();
    PARAMS.forEach((k) => { if (state[k] !== DEFAULTS[k]) p.set(k, state[k]); });
    const qs = p.toString();
    const next = location.pathname + (qs ? '?' + qs : '');
    if (next === location.pathname + location.search) return;
    try { history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', next); } catch (e) { /* p. ej. file:// restringido */ }
  }

  /* ---------- 4. SESIÓN ----------
     Compuerta del lado del cliente: las credenciales no viajan en texto plano (solo un hash SHA-256
     con sal). Sigue siendo una barrera de cortesía: el código es público. Protección real exige
     autenticación en servidor (ver wiki/despliegue.md). */

  const SALT = 'campuslands-fs-v1';
  const USERS = [
    { email: 'gustavo.navarro@campuslands.com', name: 'Gustavo Navarro',
      hash: '09d0680eacaac15eeed5eccc057522dd76fce7c851f00850a599d91d3164feb2' },
  ];
  const SESSION_KEY = 'fs_session';
  const REMEMBER_DAYS = 30;

  async function sha256(text) {
    if (!(window.crypto && crypto.subtle)) throw new Error('nocrypto');
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function readSession() {
    try {
      for (const storage of [localStorage, sessionStorage]) {
        const raw = storage.getItem(SESSION_KEY);
        if (!raw) continue;
        const v = JSON.parse(raw);
        if (v && v.exp > Date.now() && USERS.some((u) => u.email === v.email)) return v;
        storage.removeItem(SESSION_KEY);
      }
      if (localStorage.getItem('campus_auth') === 'true') { // migración del portal anterior
        const u = USERS[0];
        const v = { email: u.email, name: u.name, exp: Date.now() + REMEMBER_DAYS * 864e5 };
        localStorage.setItem(SESSION_KEY, JSON.stringify(v));
        ['campus_auth', 'campus_theme', 'campus_sort'].forEach((k) => localStorage.removeItem(k));
        return v;
      }
    } catch (e) { /* almacenamiento bloqueado */ }
    return null;
  }
  function saveSession(user, remember) {
    const v = { email: user.email, name: user.name, exp: Date.now() + (remember ? REMEMBER_DAYS * 864e5 : 12 * 3600e3) };
    try { (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(v)); } catch (e) { /* sin persistencia */ }
    return v;
  }
  function clearSession() {
    try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* sin persistencia */ }
  }

  let session = readSession();
  const isLoggedIn = () => session !== null;
  const root = document.documentElement;

  function paintSession() {
    root.dataset.session = isLoggedIn() ? 'in' : 'out';
    if (!session) return;
    $('#userInitials').textContent = session.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
    $('#userName').textContent = session.name.split(' ')[0];
    $('#userChip').title = 'Sesión iniciada como ' + session.name;
  }

  /* ---------- 5. TARJETAS ---------- */

  const grid = $('#grid');
  const cards = new Map(); // slug -> <li class="card"> (se crean una vez y se reutilizan)

  function buildCard(d) {
    const cat = CAT_BY_ID[d.category] || CATS[3];
    const li = document.createElement('li');
    li.className = 'card';
    li.dataset.id = d.slug;
    li.style.setProperty('--accent', cat.grad);
    li.style.setProperty('--glow', cat.glow);
    li.style.setProperty('--dot', cat.dot);
    li.style.setProperty('--tex', cat.tex);
    const h = hashOf(d.slug);
    const anchor = ANCHORS[(h >>> 5) % ANCHORS.length];
    li.style.setProperty('--cx', anchor[0]);
    li.style.setProperty('--cy', anchor[1]);

    const files = filesOf(d).map((f) =>
      '<a class="file file--' + f.kind + '" href="' + esc(f.href) + '" target="_blank" rel="noopener" title="' + esc(f.title) +
      '" aria-label="' + esc(f.title + ' — ' + d.client) + '">' + ICON[f.kind] + esc(f.label) + '</a>').join('');

    li.innerHTML =
      '<article class="card__inner">' +
        '<div class="card__tex tex-' + (h % TEXTURES) + '" aria-hidden="true"></div>' +
        '<div class="logo is-loading"><span class="logo__mono" aria-hidden="true">' + esc(d._mono) + '</span><img alt="" loading="lazy" decoding="async"></div>' +
        '<time class="card__date" datetime="' + esc(d.date) + '">' + ICON.calendar + esc(d._dateLabel) + '</time>' +
        '<div class="card__body">' +
          '<p class="card__company" title="' + esc(d.company) + '">' + esc(d.client) + '</p>' +
          '<h2 class="card__title"><a class="card__link" href="' + esc(openHref(d)) + '" target="_blank" rel="noopener">' + esc(d.title) + '</a></h2>' +
          '<p class="card__desc">' + esc(d.desc) + '</p>' +
        '</div>' +
        '<ul class="tags">' +
          '<li class="tag tag--cat">' + esc(d.categoryLabel) + '</li>' +
          (d.slides ? '<li class="tag">' + esc(d.slides) + '</li>' : '') +
          (d.investment ? '<li class="tag" title="' + esc(d.investment) + '">' + esc(d.investment) + '</li>' : '') +
        '</ul>' +
        '<div class="card__foot">' +
          '<div class="files">' + files + '</div>' +
          '<button type="button" class="icon-btn copy-btn" data-id="' + esc(d.slug) + '" aria-label="Copiar enlace de ' + esc(d.title) + '" title="Copiar enlace">' + ICON.copy + '</button>' +
        '</div>' +
      '</article>';

    // Logo: esqueleto mientras carga; si falta o falla, queda el monograma.
    const logo = $('.logo', li);
    const img = $('img', logo);
    const done = () => { logo.classList.remove('is-loading'); logo.classList.add('is-loaded'); };
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', () => { logo.classList.remove('is-loading'); img.remove(); }, { once: true });
    if (d.logo) img.src = d.logo; else { logo.classList.remove('is-loading'); img.remove(); }
    if (img.complete && img.naturalWidth) done();

    li.hidden = true; // render() decide cuáles se muestran
    return li;
  }

  /* ---------- 6. FILTRADO, ORDEN Y RENDER CON ANIMACIÓN ---------- */

  function visibleDecks() {
    const terms = norm(state.q).split(/\s+/).filter(Boolean);
    const list = DECKS.filter((d) => {
      if (state.cat !== 'all' && d.category !== state.cat) return false;
      if (state.cli !== 'all' && d.client !== state.cli) return false;
      if (state.mes !== 'all' && d._month !== state.mes) return false;
      return terms.every((t) => d._hay.includes(t));
    });
    // Empates por fecha: se respeta el orden del arreglo (lo más nuevo se inserta arriba).
    const byDate = (a, b) => b.date.localeCompare(a.date) || a._order - b._order;
    if (state.sort === 'oldest') list.sort((a, b) => -byDate(a, b));
    else if (state.sort === 'client') list.sort((a, b) => a.client.localeCompare(b.client, 'es', { sensitivity: 'base' }) || byDate(a, b));
    else list.sort(byDate);
    return list;
  }

  /** Entrada escalonada (opacity + transform). */
  function stagger(els, extraDelay) {
    if (prefersReducedMotion()) return;
    els.forEach((el, i) => el.animate(
      [{ opacity: 0, transform: 'translateY(16px) scale(.98)' }, { opacity: 1, transform: 'none' }],
      { duration: 420, delay: (extraDelay || 0) + Math.min(i, 12) * 45, easing: EASE, fill: 'backwards' }));
  }

  const leaving = new Set(); // tarjetas que se están desvaneciendo (ya fuera del flujo)
  function settleLeaving(el) {
    el.getAnimations().forEach((a) => a.cancel());
    el.hidden = true;
    el.classList.remove('is-leaving');
    el.style.top = el.style.left = el.style.width = el.style.height = '';
    leaving.delete(el);
  }

  /**
   * Aplica filtros/orden al DOM con técnica FLIP: las tarjetas que se quedan se
   * deslizan a su nueva posición, las nuevas aparecen y las que sobran se
   * desvanecen en su sitio sin empujar al resto.
   */
  function render() {
    const visible = visibleDecks();
    const wanted = new Set(visible.map((d) => d.slug));
    const animate = isLoggedIn() && !prefersReducedMotion();

    [...leaving].forEach(settleLeaving);
    const shown = [...cards.values()].filter((el) => !el.hidden);
    shown.forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    const first = new Map(shown.map((el) => [el, el.getBoundingClientRect()]));
    const gridBox = grid.getBoundingClientRect();

    const entering = [], staying = [], going = [];
    cards.forEach((el, id) => {
      if (wanted.has(id)) (el.hidden ? entering : staying).push(el);
      else if (!el.hidden) going.push(el);
    });

    going.forEach((el) => {
      if (!animate) { el.hidden = true; return; }
      const r = first.get(el);
      el.style.top = r.top - gridBox.top + 'px';
      el.style.left = r.left - gridBox.left + 'px';
      el.style.width = r.width + 'px';
      el.style.height = r.height + 'px';
      el.classList.add('is-leaving');
      leaving.add(el);
      el.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.95)' }], { duration: 170, easing: 'ease-out', fill: 'forwards' });
      // Temporizador (no el evento `finish`): también limpia si la pestaña está en segundo plano.
      setTimeout(() => { if (leaving.has(el)) settleLeaving(el); }, 200);
    });
    entering.forEach((el) => { el.hidden = false; });

    // Orden en el DOM: [las que se van] [visibles en orden] [ocultas]. Solo se mueve lo necesario.
    const visEls = visible.map((d) => cards.get(d.slug));
    const rest = [...cards.values()].filter((el) => !wanted.has(el.dataset.id) && !leaving.has(el));
    [...leaving, ...visEls, ...rest].forEach((el, i) => {
      if (grid.children[i] !== el) grid.insertBefore(el, grid.children[i] || null);
    });

    if (animate) {
      staying.forEach((el) => {
        const a = first.get(el), b = el.getBoundingClientRect();
        const dx = a.left - b.left, dy = a.top - b.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        el.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 380, easing: EASE });
      });
      stagger(entering, 90);
    }

    paintStatus(visible.length);
  }

  const emptyEl = $('#empty');
  const chipsEl = $('#chips');
  const clearAllEl = $('#clearAll');
  let shownChipKeys = new Set();

  function paintStatus(count) {
    const total = DECKS.length;
    $('#count').innerHTML = count !== total
      ? 'Mostrando <strong>' + count + '</strong> de ' + total + ' presentaciones'
      : '<strong>' + total + '</strong> presentaciones';

    const chips = [];
    if (state.q) chips.push({ key: 'q', text: '“' + state.q + '”' });
    if (state.cat !== 'all') chips.push({ key: 'cat', text: labelOf(CATS, state.cat) });
    if (state.cli !== 'all') chips.push({ key: 'cli', text: state.cli });
    if (state.mes !== 'all') chips.push({ key: 'mes', text: monthLabel(state.mes) });
    chipsEl.innerHTML = chips.map((c) =>
      '<li class="chip' + (shownChipKeys.has(c.key) ? '' : ' is-new') + '"><span class="chip__text">' + esc(c.text) + '</span>' +
      '<button type="button" class="chip__x" data-clear="' + c.key + '" aria-label="Quitar filtro: ' + esc(c.text) + '">' + ICON.x + '</button></li>').join('');
    shownChipKeys = new Set(chips.map((c) => c.key));
    clearAllEl.hidden = chips.length < 2;

    const wasEmpty = !emptyEl.hidden;
    emptyEl.hidden = count > 0;
    if (count === 0) {
      $('#emptyText').innerHTML = state.q
        ? 'No encontramos resultados para <strong>“' + esc(state.q) + '”</strong> con los filtros actuales.'
        : 'Ninguna presentación coincide con los filtros seleccionados.';
      if (!wasEmpty && !prefersReducedMotion()) stagger([emptyEl], 120);
    }
  }

  /* ---------- 7. CONTROLES ---------- */

  const searchWrap = $('#search');
  const searchInput = $('#q');
  let renderTimer = 0;

  function paintSearch() {
    searchInput.value = state.q;
    searchWrap.classList.toggle('has-value', Boolean(state.q));
  }

  function setView(view) {
    grid.dataset.view = view;
    const seg = $('#viewToggle');
    seg.dataset.value = view;
    seg.querySelectorAll('.seg__btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
  }

  // Desplegables (opciones generadas desde los datos)
  const countBy = (fn) => DECKS.filter(fn).length;
  const selects = {
    cat: createSelect({
      label: 'Categoría', value: state.cat,
      options: [{ value: 'all', label: 'Todas', count: DECKS.length }].concat(CATS.map((c) => ({ value: c.id, label: c.label, count: countBy((d) => d.category === c.id) }))),
      onChange: (v) => apply({ cat: v }),
    }),
    cli: createSelect({
      label: 'Cliente', value: state.cli,
      options: [{ value: 'all', label: 'Todos', count: DECKS.length }].concat(CLIENTS.map((c) => ({ value: c, label: c, count: countBy((d) => d.client === c) }))),
      onChange: (v) => apply({ cli: v }),
    }),
    mes: createSelect({
      label: 'Fecha', value: state.mes,
      options: [{ value: 'all', label: 'Todas', count: DECKS.length }].concat(MONTH_KEYS.map((k) => ({ value: k, label: monthLabel(k), count: countBy((d) => d._month === k) }))),
      onChange: (v) => apply({ mes: v }),
    }),
    sort: createSelect({
      label: 'Ordenar', value: state.sort, align: 'right', highlightActive: false,
      options: SORTS,
      onChange: (v) => apply({ sort: v }),
    }),
  };
  $('#filterSlot').append(selects.cat.el, selects.cli.el, selects.mes.el);
  $('#sortSlot').prepend(selects.sort.el);

  /** Cambia filtros desde un control (crea entrada de historial) y re-renderiza. */
  function apply(patch) {
    Object.assign(state, patch);
    syncControls();
    render();
    writeUrl('push');
  }

  function syncControls() {
    Object.keys(selects).forEach((k) => selects[k].setValue(state[k]));
    paintSearch();
    setView(state.vista);
  }

  searchInput.addEventListener('input', () => {
    state.q = searchInput.value.trim().replace(/\s+/g, ' ');
    searchWrap.classList.toggle('has-value', Boolean(searchInput.value));
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => { render(); writeUrl('replace'); }, 90);
  });
  $('#searchClear').addEventListener('click', () => { searchInput.focus(); apply({ q: '' }); });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (searchInput.value) { apply({ q: '' }); } else { searchInput.blur(); }
  });
  // "/" enfoca el buscador desde cualquier parte
  document.addEventListener('keydown', (e) => {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || !isLoggedIn()) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  });

  $('#viewToggle').addEventListener('click', (e) => {
    const btn = e.target.closest('.seg__btn');
    if (!btn || btn.dataset.view === state.vista) return;
    state.vista = btn.dataset.view;
    setView(state.vista);
    stagger([...cards.values()].filter((el) => !el.hidden));
    writeUrl('push');
  });

  chipsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-clear]');
    if (btn) apply({ [btn.dataset.clear]: DEFAULTS[btn.dataset.clear] });
  });
  function clearFilters() { apply({ q: '', cat: 'all', cli: 'all', mes: 'all' }); }
  clearAllEl.addEventListener('click', clearFilters);
  $('#emptyReset').addEventListener('click', clearFilters);

  grid.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;
    const d = DECKS.find((x) => x.slug === btn.dataset.id);
    const url = CANON + '/' + d.slug;
    if (await copyText(url)) {
      btn.classList.add('is-copied');
      setTimeout(() => btn.classList.remove('is-copied'), 1600);
      toast('Enlace copiado: ' + url.replace('https://', ''));
    } else {
      toast(url);
    }
  });

  window.addEventListener('popstate', () => { state = readUrl(); syncControls(); render(); });

  // Sombra de la cabecera al hacer scroll
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => $('#topbar').classList.toggle('is-stuck', !entry.isIntersecting)).observe($('#sentinel'));
  }

  /* ----- Login ----- */
  const form = $('#loginForm');
  const emailInput = $('#loginEmail');
  const passInput = $('#loginPass');
  const alertEl = $('#loginAlert');
  const submitBtn = $('#loginSubmit');
  let busy = false, fails = 0, lockUntil = 0;

  $('#togglePass').addEventListener('click', (e) => {
    const show = passInput.type === 'password';
    passInput.type = show ? 'text' : 'password';
    e.currentTarget.innerHTML = show ? ICON.eyeOff : ICON.eye;
    e.currentTarget.setAttribute('aria-pressed', String(show));
    e.currentTarget.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
    passInput.focus();
  });
  passInput.addEventListener('keyup', (e) => { $('#capsHint').hidden = !(e.getModifierState && e.getModifierState('CapsLock')); });
  passInput.addEventListener('blur', () => { $('#capsHint').hidden = true; });

  function showLoginError(message) {
    $('#loginAlertMsg').textContent = message;
    alertEl.hidden = false;
    if (!prefersReducedMotion()) {
      $('#loginCard').animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-9px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(0)' }],
        { duration: 340, easing: 'ease-in-out' });
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    const email = emailInput.value.trim().toLowerCase();
    const pass = passInput.value;
    alertEl.hidden = true;
    if (!email || !pass) { showLoginError('Escribe tu correo y tu contraseña.'); return; }
    if (Date.now() < lockUntil) { showLoginError('Demasiados intentos. Espera ' + Math.ceil((lockUntil - Date.now()) / 1000) + ' s e inténtalo de nuevo.'); return; }

    busy = true;
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');
    let hash = '';
    try { hash = await sha256(SALT + ':' + email + ':' + pass); }
    catch (err) { showLoginError('Este navegador no permite verificar la contraseña. Abre el portal por https.'); }
    await new Promise((r) => setTimeout(r, prefersReducedMotion() ? 0 : 350));
    busy = false;
    submitBtn.disabled = false;
    submitBtn.classList.remove('is-loading');
    if (!hash) return;

    const user = USERS.find((u) => u.email === email && u.hash === hash);
    if (user) {
      fails = 0;
      onLogin(user, $('#remember').checked);
    } else {
      fails++;
      if (fails >= 5) { lockUntil = Date.now() + 30000; fails = 0; showLoginError('Demasiados intentos. Espera 30 s e inténtalo de nuevo.'); }
      else showLoginError('Correo o contraseña incorrectos. Revisa tus datos.');
      passInput.value = '';
      passInput.focus();
    }
  });

  function onLogin(user, remember) {
    session = saveSession(user, remember);
    form.reset();
    paintSession();
    render(); // el catálogo ya es visible: se recalcula y se anima la entrada
    stagger([...cards.values()].filter((el) => !el.hidden));
    toast('Hola, ' + user.name.split(' ')[0]);
    setTimeout(() => searchInput.focus({ preventScroll: true }), 260);
  }

  $('#logoutBtn').addEventListener('click', () => {
    clearSession();
    session = null;
    Object.values(selects).forEach((s) => s.close());
    paintSession();
    toast('Sesión cerrada');
    setTimeout(() => emailInput.focus({ preventScroll: true }), 80);
  });

  /* ---------- 8. ARRANQUE ---------- */

  state = readUrl();
  syncControls();
  paintSession();

  DECKS.forEach((d) => cards.set(d.slug, buildCard(d)));
  grid.replaceChildren(...cards.values()); // reemplaza los skeletons del HTML
  grid.removeAttribute('aria-busy');
  render();

  if (!isLoggedIn()) emailInput.focus({ preventScroll: true });
})();
