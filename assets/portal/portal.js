/* ============================================================================
   PORTAL · Estudio de Presentaciones — lógica
   Datos: assets/portal/decks.js (window.DECKS). Sin dependencias.
   ========================================================================== */
(() => {
'use strict';

/* ---------------------------------------------------------------- constantes */
const CANON = 'https://fullservicepresentations.vercel.app';   // base de los enlaces que se comparten
const IS_LOCAL = location.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]', ''].includes(location.hostname);
const NEW_DAYS = 2;
const REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

const CATS = [
  { id: 'ia',            label: 'Agentes de IA',          dot: 'var(--violet)', g: ['#5E3AE2', '#3A2BC4'] },
  { id: 'software',      label: 'Software & ecosistemas', dot: 'var(--sky)',    g: ['#0A67AE', '#000087'] },
  { id: 'demos',         label: 'Demos',                  dot: 'var(--green)',  g: ['#00896A', '#005E48'] },
  { id: 'institucional', label: 'Institucional',          dot: 'var(--navy)',   g: ['#000087', '#3A2BC4'] },
];
const CAT_BY_ID = Object.fromEntries(CATS.map(c => [c.id, c]));
const GRAD_ALL = ['#000087', '#5E3AE2'];
const SORTS = {
  recent: (a, b) => b._t - a._t,
  oldest: (a, b) => a._t - b._t,
  client: (a, b) => a.client.localeCompare(b.client, 'es') || b._t - a._t,
  title:  (a, b) => a.title.localeCompare(b.title, 'es'),
};

/* ---------------------------------------------------------------- utilidades */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/* quita tildes y pasa a minúsculas conservando la longitud (para resaltar sobre el texto original) */
const fold = s => String(s ?? '').split('').map(c => (c.normalize('NFD')[0] || c).toLowerCase()[0] || c).join('');
const ic = (n, cls = '') => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MONTHS_FULL = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const today0 = (() => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); })();
const fmtDate = d => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
function relDate(days) {
  if (days <= 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) return `Hace ${plural(Math.floor(days / 7), 'semana', 'semanas')}`;
  if (days < 365) return `Hace ${plural(Math.floor(days / 30), 'mes', 'meses')}`;
  return `Hace ${plural(Math.floor(days / 365), 'año', 'años')}`;
}
const shortRel = d => d._days <= 30 ? relDate(d._days) : fmtDate(d._date);

function monogram(client) {
  const w = client.split(/\s+/).filter(x => /^[A-ZÁÉÍÓÚÑ]/.test(x));
  return ((w[0] || client)[0] + (w[1] ? w[1][0] : '')).toUpperCase();
}
function prepare(d) {
  const [y, m, dd] = d.date.split('-').map(Number);
  const date = new Date(y, m - 1, dd);
  const ver = (d.slug.match(/-(v\d+|vf)$/i) || [])[1];
  return Object.assign({}, d, {
    _date: date, _t: date.getTime(), _days: Math.round((today0 - date) / 864e5),
    _ver: ver ? ver.toUpperCase() : '',
    _hay: fold([d.client, d.company, d.title, d.desc, d.keywords, d.slug, d.categoryLabel, d.investment, d.slides,
                (CAT_BY_ID[d.category] || {}).label, fmtDate(date), MONTHS_FULL[m - 1], y].join(' ')),
  });
}
const DECKS = (window.DECKS || []).map(prepare);
const BY_SLUG = Object.fromEntries(DECKS.map(d => [d.slug, d]));
const CLIENTS = [...new Set(DECKS.map(d => d.client))].sort((a, b) => a.localeCompare(b, 'es'));

const urlOf = d => `${CANON}/${d.slug}`;
const shownUrl = d => `${CANON.replace('https://', '')}/${d.slug}`;
const openHref = d => (IS_LOCAL || d.path !== `${d.slug}/index.html`) ? d.path : `/${d.slug}/`;   // demos con /docs usan su ruta real

/* ------------------------------------------------------------------ toast / copia */
function toast(msg, icon = 'check') {
  const el = document.createElement('div');
  el.className = 'toast'; el.innerHTML = `${ic(icon)}<span>${esc(msg)}</span>`;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 260); }, 2600);
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const t = document.createElement('textarea'); t.value = text; t.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(t); t.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch {}
    t.remove(); return ok;
  }
}

/* ==========================================================================
   AUTENTICACIÓN (compuerta del lado del cliente)
   Las credenciales NO viajan en texto plano: se guarda solo un hash SHA-256 con sal.
   ATENCIÓN: sigue siendo una barrera de cortesía (todo el código es público). Para protección
   real hace falta autenticación del lado del servidor (Vercel). Ver wiki/despliegue.md.
   ========================================================================== */
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
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
const store = remember => remember ? localStorage : sessionStorage;
function readSession() {
  try {
    for (const s of [localStorage, sessionStorage]) {
      const raw = s.getItem(SESSION_KEY); if (!raw) continue;
      const v = JSON.parse(raw);
      if (v && v.exp > Date.now() && USERS.some(u => u.email === v.email)) return v;
      s.removeItem(SESSION_KEY);
    }
    if (localStorage.getItem('campus_auth') === 'true') {       // migración del portal anterior
      const u = USERS[0]; const v = { email: u.email, name: u.name, exp: Date.now() + REMEMBER_DAYS * 864e5 };
      localStorage.setItem(SESSION_KEY, JSON.stringify(v));
      ['campus_auth', 'campus_theme', 'campus_sort'].forEach(k => localStorage.removeItem(k));
      return v;
    }
  } catch {}
  return null;
}
function saveSession(user, remember) {
  const v = { email: user.email, name: user.name, exp: Date.now() + (remember ? REMEMBER_DAYS * 864e5 : 12 * 3600e3) };
  try { store(remember).setItem(SESSION_KEY, JSON.stringify(v)); } catch {}
  return v;
}
function clearSession() { try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); } catch {} }

const loginView = $('#loginView'), appEl = $('#app');
const loginForm = $('#loginForm'), loginEmail = $('#loginEmail'), loginPass = $('#loginPass');
const loginAlert = $('#loginAlert'), loginAlertMsg = $('#loginAlertMsg'), loginSubmit = $('#loginSubmit');
let fails = 0, lockUntil = 0;

function showAlert(msg) {
  loginAlertMsg.textContent = msg; loginAlert.hidden = false;
  loginAlert.classList.remove('shake'); void loginAlert.offsetWidth; loginAlert.classList.add('shake');
}
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = loginEmail.value.trim().toLowerCase(), pass = loginPass.value;
  loginAlert.hidden = true;
  if (!email || !pass) { showAlert('Escribe tu correo y tu contraseña.'); return; }
  if (Date.now() < lockUntil) { showAlert(`Demasiados intentos. Espera ${Math.ceil((lockUntil - Date.now()) / 1000)} s e inténtalo de nuevo.`); return; }

  loginSubmit.disabled = true;
  const label = loginSubmit.innerHTML; loginSubmit.innerHTML = '<span class="spin"></span><span>Verificando…</span>';
  let hash = '';
  try { hash = await sha256(`${SALT}:${email}:${pass}`); }
  catch { showAlert('Este navegador no permite verificar la contraseña. Abre el portal por https.'); }
  await new Promise(r => setTimeout(r, 350));
  loginSubmit.disabled = false; loginSubmit.innerHTML = label;
  if (!hash) return;

  const user = USERS.find(u => u.email === email && u.hash === hash);
  if (user) {
    fails = 0; loginPass.value = '';
    startApp(saveSession(user, $('#remember').checked));
    toast(`Hola, ${user.name.split(' ')[0]}`);
  } else {
    fails++;
    if (fails >= 5) { lockUntil = Date.now() + 30000; fails = 0; showAlert('Demasiados intentos. Espera 30 s e inténtalo de nuevo.'); }
    else showAlert('Correo o contraseña incorrectos. Revisa tus datos.');
    loginPass.value = ''; loginPass.focus();
  }
});
$('#togglePass').addEventListener('click', e => {
  const b = e.currentTarget, show = loginPass.type === 'password';
  loginPass.type = show ? 'text' : 'password';
  b.setAttribute('aria-pressed', show); b.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
  b.innerHTML = ic(show ? 'eye-off' : 'eye'); loginPass.focus();
});
loginPass.addEventListener('keyup', e => { $('#capsHint').hidden = !(e.getModifierState && e.getModifierState('CapsLock')); });
loginPass.addEventListener('blur', () => { $('#capsHint').hidden = true; });

function logout() {
  clearSession(); closeDrawer(true); closeMenu();
  appEl.hidden = true; loginView.hidden = false;
  document.title = 'Campuslands Full Service — Estudio de Presentaciones';
  loginEmail.focus(); toast('Sesión cerrada');
}

/* ==========================================================================
   ESTADO + URL   (?q=…&cat=…&cli=…&sort=…  y  #slug abre el detalle)
   ========================================================================== */
const state = { q: '', cat: '', cli: '', sort: 'recent', sortTouched: false };
let tokens = [];
const tokenize = q => fold(q).split(/\s+/).filter(Boolean);

function loadPrefs() {
  try { const s = localStorage.getItem('fs_portal_sort'); if (SORTS[s]) { state.sort = s; state.sortTouched = true; } } catch {}
}
function readUrl() {
  const p = new URLSearchParams(location.search);
  state.q = p.get('q') || '';
  state.cat = CAT_BY_ID[p.get('cat')] ? p.get('cat') : '';
  state.cli = CLIENTS.includes(p.get('cli')) ? p.get('cli') : '';
  if (SORTS[p.get('sort')]) { state.sort = p.get('sort'); state.sortTouched = true; }
}
function writeUrl() {
  const p = new URLSearchParams();
  if (state.q) p.set('q', state.q);
  if (state.cat) p.set('cat', state.cat);
  if (state.cli) p.set('cli', state.cli);
  if (state.sortTouched && state.sort !== 'recent') p.set('sort', state.sort);
  const qs = p.toString();
  history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
}

/* ==========================================================================
   FILTRADO (los conteos de cada filtro respetan a los demás)
   ========================================================================== */
function passes(d, ignore) {
  if (ignore !== 'q' && tokens.length && !tokens.every(t => d._hay.includes(t))) return false;
  if (ignore !== 'cat' && state.cat && d.category !== state.cat) return false;
  if (ignore !== 'cli' && state.cli && d.client !== state.cli) return false;
  return true;
}
function score(d) {
  const c = fold(d.client), t = fold(d.title), co = fold(d.company), k = fold(d.keywords), de = fold(d.desc), s = d.slug;
  let n = 0;
  for (const tk of tokens) {
    if (c.startsWith(tk)) n += 6; else if (c.includes(tk)) n += 4;
    if (s.includes(tk)) n += 3;
    if (t.includes(tk)) n += 4;
    if (co.includes(tk)) n += 2;
    if (k.includes(tk)) n += 2;
    if (de.includes(tk)) n += 1;
  }
  return n;
}
const effectiveSort = () => (tokens.length && !state.sortTouched) ? 'relevance'
  : (state.sort === 'relevance' && !tokens.length ? 'recent' : state.sort);
function sortDecks(list) {
  const key = effectiveSort();
  const cmp = key === 'relevance'
    ? (a, b) => score(b) - score(a) || b._t - a._t
    : (a, b) => SORTS[key](a, b) || b._t - a._t || a.title.localeCompare(b.title, 'es');
  return list.slice().sort(cmp);
}
const hasFilters = () => !!(tokens.length || state.cat || state.cli);

/* ==========================================================================
   RENDER
   ========================================================================== */
const el = {
  list: $('#list'), empty: $('#empty'), meta: $('#meta'), tabs: $('#tabBtns'), ind: $('#tabInd'),
  q: $('#q'), qClear: $('#qClear'), reset: $('#resetAll'),
};
let stagger = true;

function highlight(text) {
  const raw = String(text ?? '');
  if (!tokens.length) return esc(raw);
  const f = fold(raw), mark = new Array(raw.length).fill(false);
  for (const t of tokens) { let i = f.indexOf(t); while (i !== -1) { for (let k = i; k < i + t.length; k++) mark[k] = true; i = f.indexOf(t, i + t.length); } }
  let out = '', open = false;
  for (let i = 0; i < raw.length; i++) {
    if (mark[i] && !open) { out += '<mark>'; open = true; }
    if (!mark[i] && open) { out += '</mark>'; open = false; }
    out += esc(raw[i]);
  }
  return out + (open ? '</mark>' : '');
}

const logoHtml = d => d.logo
  ? `<span class="logo"><img src="${esc(encodeURI(d.logo))}" alt="Logo de ${esc(d.client)}" loading="lazy" decoding="async" data-mono="${esc(monogram(d.client))}"></span>`
  : `<span class="logo"><span class="mono">${esc(monogram(d.client))}</span></span>`;

const newBadge = d => d._days <= NEW_DAYS ? `<span class="badge badge--new">${ic('zap', 'ic--sm')}Nueva</span>` : '';
const verBadge = d => d._ver ? `<span class="badge badge--ver" title="Versión de la propuesta">${esc(d._ver)}</span>` : '';

function rowHtml(d, i) {
  const demo = !d.pdf;
  const delay = stagger ? Math.min(i, 12) * 38 : 0;
  return `
  <article class="row cat-${d.category}" style="--d:${delay}ms">
    ${logoHtml(d)}
    <div class="main">
      <div class="client"><span>${highlight(d.client)}</span><span class="pill">${esc(d.categoryLabel)}</span>${verBadge(d)}${newBadge(d)}</div>
      <h3><button type="button" data-open="${esc(d.slug)}" title="Ver detalle">${highlight(d.title)}</button></h3>
    </div>
    <div class="date" title="${esc(fmtDate(d._date))}">${ic('calendar', 'ic--sm')}<span>${esc(shortRel(d))}</span></div>
    <div class="actions">
      <a class="btn btn--primary btn--sm" href="${esc(openHref(d))}" target="_blank" rel="noopener" title="Abrir ${esc(d.title)} en una pestaña nueva">${ic(demo ? 'play-circle' : 'play', 'ic--sm')}${demo ? 'Abrir demo' : 'Abrir'}</a>
      ${d.pdf ? `<a class="btn btn--tint btn--sm" href="${esc(encodeURI(d.pdf))}" target="_blank" rel="noopener" title="Ver el PDF">${ic('pdf', 'ic--sm')}PDF</a>` : ''}
      <button class="copy btn--icon" type="button" data-copy="${esc(d.slug)}" aria-label="Copiar enlace de ${esc(d.title)}" title="Copiar enlace · /${esc(d.slug)}">${ic('link', 'ic--sm')}</button>
    </div>
  </article>`;
}

function renderList() {
  const items = sortDecks(DECKS.filter(d => passes(d)));
  el.meta.innerHTML = hasFilters()
    ? `<b>${items.length}</b> de ${plural(DECKS.length, 'presentación', 'presentaciones')}`
    : `<b>${DECKS.length}</b> presentaciones`;
  el.reset.hidden = !hasFilters();
  el.empty.hidden = items.length > 0;
  if (!items.length) {
    el.list.innerHTML = '';
    $('#emptyMsg').textContent = tokens.length
      ? `No hay resultados para “${state.q.trim()}”${(state.cat || state.cli) ? ' con los filtros activos' : ''}. Revisa la ortografía o prueba con el nombre del cliente.`
      : 'Ninguna presentación cumple los filtros activos. Quita alguno para ampliar la búsqueda.';
    return;
  }
  el.list.innerHTML = items.map(rowHtml).join('');
}

function renderTabs() {
  const count = id => DECKS.filter(d => passes(d, 'cat') && (!id || d.category === id)).length;
  el.tabs.querySelectorAll('.tab').forEach(t => t.remove());
  const all = [{ id: '', label: 'Todas', dot: '' }, ...CATS];
  el.tabs.insertAdjacentHTML('beforeend', all.map(c =>
    `<button class="tab" type="button" data-cat="${c.id}" aria-pressed="${state.cat === c.id}">
      ${c.dot ? `<span class="dot" style="--dot:${c.dot}"></span>` : ''}${esc(c.label)}<span class="n">${count(c.id)}</span></button>`).join(''));
  placeIndicator();
}
function placeIndicator() {
  const on = el.tabs.querySelector('.tab[aria-pressed="true"]'); if (!on) return;
  const L = on.offsetLeft, R = el.tabs.offsetWidth - (on.offsetLeft + on.offsetWidth);
  const g = (CAT_BY_ID[state.cat] || {}).g || GRAD_ALL;
  el.ind.style.setProperty('--ia', g[0]); el.ind.style.setProperty('--ib', g[1]);
  el.ind.style.clipPath = `inset(0 ${R}px 0 ${L}px round 999px)`;
}

/* ---- desplegable propio (accesible: listbox, flechas, Enter, Esc, Tab, búsqueda opcional) ---- */
const dropdowns = [];
function makeDropdown(root, onSelect) {
  const btn = $('.dd-btn', root), label = $('.dd-label', root), list = $('.dd-list', root);
  const search = $('.dd-search input', root);
  let opts = [], value = '', q = '';
  const isOpen = () => root.classList.contains('open');
  const items = () => $$('.dd-item:not(.is-off)', list);

  function renderItems() {
    const f = fold(q).trim();
    const shown = opts.filter(o => !f || fold(o.label).includes(f));
    list.innerHTML = shown.length ? shown.map((o, i) =>
      `<button type="button" role="option" class="dd-item${o.disabled ? ' is-off' : ''}" tabindex="-1" data-v="${esc(o.value)}" aria-selected="${o.value === value}" ${o.disabled ? 'aria-disabled="true"' : ''} style="--i:${Math.min(i, 12)}">
        <span class="lbl">${esc(o.label)}</span>${o.count !== undefined ? `<span class="n">${o.count}</span>` : ''}${ic('check', 'tick')}</button>`).join('')
      : '<div class="dd-empty">Sin resultados</div>';
  }
  function open() {
    if (isOpen()) return;
    dropdowns.forEach(d => d.close());
    root.classList.add('open'); btn.setAttribute('aria-expanded', 'true');
    if (search) { search.value = ''; q = ''; renderItems(); setTimeout(() => search.focus(), 40); }
    else setTimeout(() => (list.querySelector('[aria-selected="true"]:not(.is-off)') || items()[0] || btn).focus(), 40);
    const sel = list.querySelector('[aria-selected="true"]'); if (sel) sel.scrollIntoView({ block: 'nearest' });
  }
  function close(refocus = false) {
    if (!isOpen()) return;
    root.classList.remove('open'); btn.setAttribute('aria-expanded', 'false');
    if (refocus) btn.focus();
  }
  function move(delta, from) {
    const all = items(); if (!all.length) return;
    const i = all.indexOf(from);
    const next = i === -1 ? (delta > 0 ? 0 : all.length - 1) : i + delta;
    if (next < 0) { if (search) search.focus(); return; }
    all[Math.min(next, all.length - 1)].focus();
  }

  btn.addEventListener('click', () => isOpen() ? close() : open());
  list.addEventListener('click', e => {
    const it = e.target.closest('.dd-item'); if (!it || it.classList.contains('is-off')) return;
    close(true); onSelect(it.dataset.v);
  });
  if (search) search.addEventListener('input', () => { q = search.value; renderItems(); });
  root.addEventListener('keydown', e => {
    const k = e.key;
    if (!isOpen()) {
      if (e.target === btn && (k === 'ArrowDown' || k === 'ArrowUp')) { e.preventDefault(); open(); }
      return;
    }
    if (k === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
    else if (k === 'Tab') close();
    else if (k === 'ArrowDown') { e.preventDefault(); move(1, e.target.closest('.dd-item')); }
    else if (k === 'ArrowUp') { e.preventDefault(); move(-1, e.target.closest('.dd-item')); }
    else if (k === 'Home' && e.target !== search) { e.preventDefault(); items()[0]?.focus(); }
    else if (k === 'End' && e.target !== search) { e.preventDefault(); items().pop()?.focus(); }
  });
  document.addEventListener('click', e => { if (!root.contains(e.target)) close(); });

  const api = {
    close,
    set(options, val, text, isSet) {
      opts = options; value = val; label.textContent = text; btn.classList.toggle('is-set', !!isSet);
      renderItems();
    },
  };
  dropdowns.push(api);
  return api;
}
const SORT_LABELS = { recent: 'Más recientes', oldest: 'Más antiguas', client: 'Cliente (A–Z)', title: 'Título (A–Z)', relevance: 'Relevancia' };
const ddClient = makeDropdown($('#ddClient'), v => { state.cli = v; render(); });
const ddSort = makeDropdown($('#ddSort'), v => {
  state.sort = v; state.sortTouched = true;
  try { localStorage.setItem('fs_portal_sort', v); } catch {}
  render();
});

function renderClients() {
  const counts = new Map(CLIENTS.map(c => [c, 0]));
  DECKS.forEach(d => { if (passes(d, 'cli')) counts.set(d.client, counts.get(d.client) + 1); });
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  ddClient.set(
    [{ value: '', label: 'Todos los clientes', count: total },
     ...CLIENTS.map(c => ({ value: c, label: c, count: counts.get(c), disabled: !counts.get(c) && state.cli !== c }))],
    state.cli, state.cli || 'Todos los clientes', !!state.cli);
}

function syncControls() {
  if (el.q.value !== state.q) el.q.value = state.q;
  el.qClear.hidden = !state.q; $('#searchBox').classList.toggle('has-value', !!state.q);
  const ef = effectiveSort();
  ddSort.set(Object.keys(SORT_LABELS).filter(k => k !== 'relevance' || tokens.length).map(k => ({ value: k, label: SORT_LABELS[k] })), ef, SORT_LABELS[ef], false);
}

function render() {
  tokens = tokenize(state.q);
  syncControls(); renderTabs(); renderClients(); renderList(); writeUrl();
  stagger = true;
}

/* ==========================================================================
   PANEL DE DETALLE
   ========================================================================== */
const drawer = $('#drawer'), scrim = $('#scrim');
let lastFocus = null;

function openDrawer(slug, fromHash = false) {
  const d = BY_SLUG[slug]; if (!d) return;
  if (!drawer.classList.contains('show')) lastFocus = document.activeElement;
  const related = DECKS.filter(x => x.client === d.client && x.slug !== d.slug).sort((a, b) => b._t - a._t);
  const demo = !d.pdf;
  $('#dCrumb').textContent = `${d.client} · ${CAT_BY_ID[d.category].label}`;
  $('#dBody').innerHTML = `
    <div class="d-hero cat-${d.category}">${logoHtml(d)}<div><div class="client"><span>${esc(d.client)}</span></div><h2 id="dTitle">${esc(d.title)}</h2></div></div>
    <div class="d-badges"><span class="pill cat-${d.category}">${esc(d.categoryLabel)}</span>${verBadge(d)}${newBadge(d)}${demo ? '<span class="badge badge--ver">Demo interactiva</span>' : ''}</div>
    <p class="d-desc">${esc(d.desc)}</p>
    <div class="d-facts">
      <div class="d-fact wide"><small>Razón social</small><b>${esc(d.company)}</b></div>
      <div class="d-fact"><small>Contenido</small><b>${esc(d.slides)}</b></div>
      <div class="d-fact"><small>Fecha</small><b>${esc(fmtDate(d._date))}<br><span style="font-weight:500;color:var(--ink-3);font-size:12px">${esc(relDate(d._days))}</span></b></div>
      ${d.investment ? `<div class="d-fact wide"><small>Inversión / modalidad</small><b>${esc(d.investment)}</b></div>` : ''}
    </div>
    <div class="d-sec"><h4>Enlaces para compartir</h4><div class="d-links">
      <div class="d-link">${ic('link')}<div class="url"><small>Presentación web</small><span>${esc(shownUrl(d))}</span></div>
        <button class="copy" type="button" data-copy="${esc(d.slug)}" aria-label="Copiar enlace web">${ic('copy', 'ic--sm')}<span>Copiar</span></button></div>
      ${d.pdf ? `<div class="d-link">${ic('pdf')}<div class="url"><small>Archivo PDF</small><span>${esc(d.pdf.split('/').pop())}</span></div>
        <a class="copy" href="${esc(encodeURI(d.pdf))}" target="_blank" rel="noopener" aria-label="Abrir PDF">${ic('external', 'ic--sm')}<span>Abrir</span></a>
        <a class="copy" href="${esc(encodeURI(d.pdf))}" download aria-label="Descargar PDF">${ic('pdf', 'ic--sm')}<span>Descargar</span></a></div>` : ''}
    </div></div>
    ${related.length ? `<div class="d-sec"><h4>Otras propuestas de ${esc(d.client)}</h4><div class="related">
      ${related.map(r => `<button class="rel cat-${r.category}" type="button" data-open="${esc(r.slug)}">${logoHtml(r)}<span><b>${esc(r.title)}${r._ver ? ' · ' + esc(r._ver) : ''}</b><small>${esc(r.categoryLabel)} · ${esc(shortRel(r))}</small></span></button>`).join('')}
    </div></div>` : ''}`;
  $('#dFoot').innerHTML = `
    <a class="btn btn--primary" href="${esc(openHref(d))}" target="_blank" rel="noopener">${ic(demo ? 'play-circle' : 'play')}${demo ? 'Abrir demo' : 'Abrir presentación'}</a>
    <button class="btn btn--soft" type="button" data-copy="${esc(d.slug)}">${ic('copy')}Copiar enlace</button>`;
  $('#dBody').scrollTop = 0;

  drawer.classList.add('show'); drawer.setAttribute('aria-hidden', 'false'); scrim.classList.add('show');
  appEl.inert = true; document.body.style.overflow = 'hidden';
  if (!fromHash) history.replaceState(null, '', location.pathname + location.search + '#' + slug);
  document.title = `${d.title} · ${d.client} — Campuslands`;
  $('#dClose').focus({ preventScroll: true });
}
function closeDrawer(silent = false) {
  if (!drawer.classList.contains('show')) return;
  drawer.classList.remove('show'); drawer.setAttribute('aria-hidden', 'true'); scrim.classList.remove('show');
  appEl.inert = false; document.body.style.overflow = '';
  document.title = 'Campuslands Full Service — Estudio de Presentaciones';
  history.replaceState(null, '', location.pathname + location.search);
  if (!silent && lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
}

/* ---- menú de usuario ---- */
const menu = $('#userMenu'), userBtn = $('#userBtn');
function closeMenu() { menu.classList.remove('open'); userBtn.setAttribute('aria-expanded', 'false'); }

/* ==========================================================================
   EVENTOS
   ========================================================================== */
function resetAll() { state.q = ''; state.cat = ''; state.cli = ''; render(); }

document.addEventListener('click', async e => {
  if (!e.target.closest('.usermenu')) closeMenu();
  if (e.target === scrim) { closeDrawer(); return; }
  const t = e.target.closest('[data-open],[data-copy],[data-cat]');
  if (!t) return;

  if (t.dataset.open) { openDrawer(t.dataset.open); return; }
  if (t.dataset.copy) {
    const d = BY_SLUG[t.dataset.copy];
    if (await copyText(urlOf(d))) {
      toast(`Enlace de ${d.client} copiado`);
      const keep = t.innerHTML, label = $('span', t);
      t.classList.add('done');
      t.innerHTML = ic('check', 'ic--sm') + (label ? '<span>Copiado</span>' : '');
      setTimeout(() => { t.classList.remove('done'); t.innerHTML = keep; }, 1600);
    } else toast(urlOf(d), 'link');
    return;
  }
  if (t.dataset.cat !== undefined) { state.cat = t.dataset.cat; render(); }
});

// logos que no cargan → iniciales
document.addEventListener('error', e => {
  const i = e.target;
  if (i && i.tagName === 'IMG' && i.dataset.mono) i.replaceWith(Object.assign(document.createElement('span'), { className: 'mono', textContent: i.dataset.mono }));
}, true);

el.q.addEventListener('input', () => { state.q = el.q.value; stagger = false; render(); });
el.qClear.addEventListener('click', () => { state.q = ''; render(); el.q.focus(); });
el.reset.addEventListener('click', resetAll);
$('#emptyReset').addEventListener('click', resetAll);
$('#dClose').addEventListener('click', () => closeDrawer());

userBtn.addEventListener('click', () => { const o = menu.classList.toggle('open'); userBtn.setAttribute('aria-expanded', o); });
$('#logout').addEventListener('click', logout);
$('#copyView').addEventListener('click', async () => { closeMenu(); toast(await copyText(location.origin + location.pathname + location.search) ? 'Vista copiada' : 'No se pudo copiar'); });

window.addEventListener('hashchange', () => {
  const s = decodeURIComponent(location.hash.slice(1));
  if (BY_SLUG[s]) openDrawer(s, true); else closeDrawer(true);
});
window.addEventListener('resize', placeIndicator);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeIndicator);
window.addEventListener('scroll', () => $('#topbar').classList.toggle('scrolled', window.scrollY > 6), { passive: true });

document.addEventListener('keydown', e => {
  if (appEl.hidden && !drawer.classList.contains('show')) return;
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
  if (e.key === 'Escape') {
    if (drawer.classList.contains('show')) { closeDrawer(); return; }
    if (menu.classList.contains('open')) { closeMenu(); userBtn.focus(); return; }
    if (document.activeElement === el.q) { if (state.q) { state.q = ''; render(); } else el.q.blur(); }
    return;
  }
  if (e.key === 'Tab' && drawer.classList.contains('show')) {      // foco atrapado en el panel
    const f = $$('a[href],button:not([disabled])', drawer).filter(x => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    return;
  }
  if (!drawer.classList.contains('show') && ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'))) {
    e.preventDefault(); el.q.focus(); el.q.select();
  }
});

/* ---- placeholder que "escribe" ejemplos (solo si el campo está vacío y sin foco) ---- */
(function typewriter() {
  if (REDUCED) return;
  const base = el.q.placeholder;
  const tops = [...DECKS.reduce((m, d) => m.set(d.client, (m.get(d.client) || 0) + 1), new Map())].sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]);
  const phrases = [...tops.map(c => `Buscar “${c}”…`), 'Buscar “agente de IA”…', 'Buscar “ERP”…', base];
  let p = 0, i = 0, dir = 1, timer;
  const idle = () => document.activeElement !== el.q && !el.q.value && !appEl.hidden;
  function tick() {
    if (!idle()) { el.q.placeholder = base; timer = setTimeout(tick, 1200); i = 0; dir = 1; return; }
    const s = phrases[p];
    i += dir; el.q.placeholder = s.slice(0, Math.max(i, 1)) + (i < s.length ? '▏' : '');
    if (dir === 1 && i >= s.length) { dir = -1; timer = setTimeout(tick, 2000); return; }
    if (dir === -1 && i <= 0) { dir = 1; p = (p + 1) % phrases.length; timer = setTimeout(tick, 350); return; }
    timer = setTimeout(tick, dir === 1 ? 55 : 28);
  }
  el.q.addEventListener('focus', () => { el.q.placeholder = base; });
  setTimeout(tick, 2500);
})();

/* ==========================================================================
   ARRANQUE
   ========================================================================== */
function startApp(session) {
  loginView.hidden = true; appEl.hidden = false;
  const initials = session.name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  ['avatar', 'avatar2'].forEach(id => $('#' + id).textContent = initials);
  ['userName', 'userName2'].forEach(id => $('#' + id).textContent = session.name);
  $('#userEmail').textContent = session.email;
  loadPrefs(); readUrl(); render();
  const s = decodeURIComponent(location.hash.slice(1));
  if (BY_SLUG[s]) openDrawer(s, true);
}

const session = readSession();
if (session) startApp(session); else { loginView.hidden = false; }
})();
