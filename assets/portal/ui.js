/* ==========================================================================
   ui.js — Componentes de interfaz reutilizables (sin dependencias)
   Expone `window.UI`:
     UI.createSelect(cfg)  Desplegable propio, accesible (patrón ARIA "select-only combobox")
     UI.toast(msg)         Aviso breve, anunciado a lectores de pantalla
     UI.smoothScroll()     Scroll con inercia para la rueda del ratón
     UI.prefersReducedMotion()
   ========================================================================== */
(function (global) {
  'use strict';

  const doc = global.document;
  const prefersReducedMotion = () => global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Escapa texto para insertarlo en HTML/atributos. */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ------------------------------------------------------------------------
     SELECT — desplegable totalmente estilizado
     cfg: { label, options:[{value,label,count?}], value, align?:'right', onChange(value) }
     Teclado: ↑ ↓ Inicio Fin mueven · Enter/Espacio eligen · Esc cierra · letras saltan
     ------------------------------------------------------------------------ */
  let selectSeq = 0;
  const openSelects = new Set();

  const CHEVRON = '<svg class="select__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';
  const CHECK = '<svg class="select__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';

  function createSelect(cfg) {
    const uid = 'select-' + (++selectSeq);
    let options = cfg.options.slice();
    let value = cfg.value;
    let activeIndex = -1;
    let typed = '';
    let typedTimer = 0;

    const root = doc.createElement('div');
    root.className = 'select' + (cfg.align === 'right' ? ' select--right' : '');
    root.innerHTML =
      '<button type="button" class="select__trigger" role="combobox" aria-haspopup="listbox" aria-expanded="false"' +
      ' aria-controls="' + uid + '-list" aria-labelledby="' + uid + '-label ' + uid + '-value">' +
      '<span class="select__label" id="' + uid + '-label">' + esc(cfg.label) + '</span>' +
      '<span class="select__value" id="' + uid + '-value"></span>' + CHEVRON + '</button>' +
      '<ul class="select__list" role="listbox" id="' + uid + '-list" tabindex="-1" aria-labelledby="' + uid + '-label"></ul>';

    const trigger = root.querySelector('.select__trigger');
    const list = root.querySelector('.select__list');
    const valueEl = root.querySelector('.select__value');

    const indexOfValue = (v) => options.findIndex((o) => o.value === v);

    function renderOptions() {
      list.innerHTML = options.map((o, i) =>
        '<li class="select__option" role="option" id="' + uid + '-opt-' + i + '" data-index="' + i + '">' +
        CHECK + '<span class="select__text">' + esc(o.label) + '</span>' +
        (o.count != null ? '<span class="select__count">' + o.count + '</span>' : '') + '</li>').join('');
      paintSelection();
    }

    function paintSelection() {
      const sel = indexOfValue(value);
      valueEl.textContent = sel >= 0 ? options[sel].label : '';
      list.querySelectorAll('.select__option').forEach((li, i) => {
        li.setAttribute('aria-selected', String(i === sel));
        li.classList.toggle('is-active', i === activeIndex);
      });
      // El primer valor se considera "sin filtro"; cualquier otro marca el control como activo.
      root.classList.toggle('is-active', sel > 0 && cfg.highlightActive !== false);
    }

    function setActive(i, scroll) {
      activeIndex = Math.max(0, Math.min(options.length - 1, i));
      list.querySelectorAll('.select__option').forEach((li, k) => li.classList.toggle('is-active', k === activeIndex));
      trigger.setAttribute('aria-activedescendant', uid + '-opt-' + activeIndex);
      if (scroll) list.children[activeIndex].scrollIntoView({ block: 'nearest' });
    }

    function open() {
      if (root.classList.contains('is-open')) return;
      openSelects.forEach((s) => s.close());
      root.classList.remove('align-right');
      root.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      // Si el menú se saldría por la derecha de la pantalla, se alinea al borde derecho del botón.
      if (list.getBoundingClientRect().right > global.innerWidth - 8) root.classList.add('align-right');
      setActive(Math.max(indexOfValue(value), 0), true);
      openSelects.add(api);
    }

    function close() {
      if (!root.classList.contains('is-open')) return;
      root.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.removeAttribute('aria-activedescendant');
      openSelects.delete(api);
    }

    function choose(i) {
      const next = options[i];
      if (!next) return;
      const changed = next.value !== value;
      value = next.value;
      paintSelection();
      close();
      if (changed && cfg.onChange) cfg.onChange(value);
    }

    trigger.addEventListener('click', () => (root.classList.contains('is-open') ? close() : open()));
    trigger.addEventListener('blur', close);

    trigger.addEventListener('keydown', (e) => {
      const isOpen = root.classList.contains('is-open');
      switch (e.key) {
        case 'ArrowDown': case 'ArrowUp':
          e.preventDefault();
          if (!isOpen) { open(); break; }
          setActive(activeIndex + (e.key === 'ArrowDown' ? 1 : -1), true);
          break;
        case 'Home': if (isOpen) { e.preventDefault(); setActive(0, true); } break;
        case 'End': if (isOpen) { e.preventDefault(); setActive(options.length - 1, true); } break;
        case 'Enter': case ' ':
          e.preventDefault();
          if (isOpen) choose(activeIndex); else open();
          break;
        case 'Escape':
          if (isOpen) { e.preventDefault(); e.stopPropagation(); close(); }
          break;
        case 'Tab': close(); break;
        default:
          // Búsqueda por escritura: salta a la opción que empieza por lo tecleado.
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            typed += e.key.toLowerCase();
            clearTimeout(typedTimer);
            typedTimer = setTimeout(() => { typed = ''; }, 600);
            const hit = options.findIndex((o) => o.label.toLowerCase().startsWith(typed));
            if (hit >= 0) { if (!isOpen) open(); setActive(hit, true); }
          }
      }
    });

    // `mousedown` no debe quitar el foco al botón: así el teclado sigue funcionando.
    list.addEventListener('mousedown', (e) => e.preventDefault());
    list.addEventListener('click', (e) => {
      const li = e.target.closest('.select__option');
      if (li) choose(Number(li.dataset.index));
    });
    list.addEventListener('mousemove', (e) => {
      const li = e.target.closest('.select__option');
      if (li && Number(li.dataset.index) !== activeIndex) setActive(Number(li.dataset.index), false);
    });

    doc.addEventListener('pointerdown', (e) => { if (!root.contains(e.target)) close(); });

    const api = {
      el: root,
      close,
      getValue: () => value,
      setValue(v) { value = v; paintSelection(); },
      setOptions(next) { options = next.slice(); renderOptions(); },
    };
    renderOptions();
    return api;
  }

  /* ------------------------------------------------------------------------
     TOAST
     ------------------------------------------------------------------------ */
  let toastEl = null;
  let toastTimer = 0;
  function toast(message) {
    toastEl = toastEl || doc.getElementById('toast');
    if (!toastEl) return;
    toastEl.querySelector('.toast__msg').textContent = message;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 3200);
  }

  /* ------------------------------------------------------------------------
     SMOOTH SCROLL — desplazamiento con inercia para la rueda del ratón (sin dependencias)
     Interpola la posición hacia el destino con un suavizado independiente de los FPS.
     Se desactiva con `prefers-reduced-motion` y en pantallas táctiles (ya tienen inercia nativa);
     respeta el scroll de listas internas, el zoom (Ctrl + rueda) y el desplazamiento horizontal.
     ------------------------------------------------------------------------ */
  function smoothScroll(options) {
    const smoothing = (options && options.smoothing) || 0.14; // fracción de la distancia que se recorre por cuadro a 60 FPS
    if (prefersReducedMotion() || global.matchMedia('(pointer: coarse)').matches) return;

    const root = doc.documentElement;
    const maxScroll = () => root.scrollHeight - global.innerHeight;
    let target = global.scrollY;
    let current = target;
    let frame = 0;
    let last = 0;

    // ¿El elemento (o un ancestro) puede desplazarse por sí mismo en esa dirección?
    function nestedScroller(el, dy) {
      for (; el && el !== doc.body && el !== root; el = el.parentElement) {
        const overflowY = global.getComputedStyle(el).overflowY;
        if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
          if ((dy < 0 && el.scrollTop > 0) || (dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1)) return true;
        }
      }
      return false;
    }

    function tick(now) {
      const dt = Math.min(now - last, 64);
      last = now;
      current += (target - current) * (1 - Math.pow(1 - smoothing, dt / 16.67));
      if (Math.abs(target - current) < 0.4) {
        current = target;
        frame = 0;
        global.scrollTo({ top: current, behavior: 'instant' });
        return;
      }
      global.scrollTo({ top: current, behavior: 'instant' });
      frame = global.requestAnimationFrame(tick);
    }

    global.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.shiftKey || e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (nestedScroller(e.target, e.deltaY)) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? global.innerHeight : 1; // líneas / páginas / píxeles
      if (!frame) { current = global.scrollY; target = current; }
      target = Math.max(0, Math.min(maxScroll(), target + e.deltaY * unit));
      if (!frame) { last = global.performance.now(); frame = global.requestAnimationFrame(tick); }
    }, { passive: false });

    // Si la posición cambia por otro medio (teclado, barra de scroll, anclas), se vuelve a sincronizar.
    global.addEventListener('scroll', () => { if (!frame) { current = target = global.scrollY; } }, { passive: true });
  }

  global.UI = { createSelect, toast, smoothScroll, esc, prefersReducedMotion };
})(window);
