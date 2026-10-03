// ==========================================
// PLANTILLA CAMPUSLANDS — visor interactivo (una lámina a la vez)
// Al crear un deck: ajustar totalSlides al número real de láminas (máximo 10 salvo pedido textual).
// ==========================================

const state = {
    currentSlide: 1,
    totalSlides: 9,
    autoplayActive: false,
    autoplayTimer: null,
};

// ---- Escalado de la lámina al espacio disponible (evita tener que hacer zoom-out) ----
const SLIDE_NATIVE_W = 1056; // 11in a 96dpi, igual que el PDF impreso
const SLIDE_NATIVE_H = 594;  // 6.1875in a 96dpi

function resizeSlideStage() {
    const container = document.getElementById('slides-container');
    if (!container) return;
    // iOS/iPadOS: 100vh incluye la zona bajo la barra de Safari y esconde la barra inferior → se usa el alto visible real
    const vv = window.visualViewport;
    document.documentElement.style.setProperty('--app-h', Math.round(vv ? vv.height : window.innerHeight) + 'px');
    const availW = container.clientWidth - 16;
    const availH = container.clientHeight - 16;
    const scale = Math.min(availW / SLIDE_NATIVE_W, availH / SLIDE_NATIVE_H, 1.35);
    document.documentElement.style.setProperty('--slide-scale', scale.toFixed(4));
}

function isSlideVisible(slideEl) {
    return parseInt(slideEl.dataset.slide, 10) === state.currentSlide;
}

function updateSlideDisplay() {
    document.querySelectorAll('.slide').forEach((slide) => {
        slide.classList.toggle('active', isSlideVisible(slide));
    });
    document.getElementById('slide-number-display').textContent = `${state.currentSlide} / ${state.totalSlides}`;
    const progressPercent = (state.currentSlide / state.totalSlides) * 100;
    document.getElementById('slide-progress').style.width = `${progressPercent}%`;
}

function navigateSlide(direction) {
    state.currentSlide += direction;
    if (state.currentSlide > state.totalSlides) state.currentSlide = 1;
    if (state.currentSlide < 1) state.currentSlide = state.totalSlides;
    updateSlideDisplay();
}

function toggleAutoplay() {
    const apBtn = document.getElementById('btn-autoplay');
    const apIcon = document.getElementById('autoplay-icon');

    if (state.autoplayActive) {
        clearInterval(state.autoplayTimer);
        state.autoplayActive = false;
        apBtn.classList.remove('active');
        apIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`; // Play
    } else {
        state.autoplayActive = true;
        apBtn.classList.add('active');
        apIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>`; // Pause
        state.autoplayTimer = setInterval(() => navigateSlide(1), 5000);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') navigateSlide(1);
    if (e.key === 'ArrowLeft') navigateSlide(-1);
});

window.addEventListener('resize', resizeSlideStage);
window.addEventListener('orientationchange', () => { setTimeout(resizeSlideStage, 250); });
if (window.visualViewport) window.visualViewport.addEventListener('resize', resizeSlideStage);

// ---- Táctil: deslizar a izquierda/derecha cambia de lámina (un solo dedo; el pellizco para zoom no se toca) ----
(function setupSwipe() {
    let x0 = null, y0 = null;
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1 || (e.target.closest && e.target.closest('button'))) { x0 = null; return; }
        x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', (e) => {
        if (x0 === null) return;
        const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
        x0 = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) navigateSlide(dx < 0 ? 1 : -1);
    }, { passive: true });
})();

// ---- Celular en vertical: aviso (descartable) para girar el equipo ----
function setupRotateHint() {
    const host = document.getElementById('slides-container');
    if (!host) return;
    try { if (sessionStorage.getItem('rotateHintOff')) return; } catch (err) { /* sin storage */ }
    const hint = document.createElement('div');
    hint.className = 'rotate-hint on';
    hint.setAttribute('role', 'status');
    hint.innerHTML = '<span>Gira el celular en horizontal para ver mejor la presentación.</span><button type="button" aria-label="Cerrar aviso">&times;</button>';
    hint.querySelector('button').addEventListener('click', () => {
        hint.remove();
        try { sessionStorage.setItem('rotateHintOff', '1'); } catch (err) { /* sin storage */ }
    });
    host.appendChild(hint);
}

// Fuerza la carga de todas las @font-face: las láminas ocultas no las piden por sí solas,
// y el export a PDF (Chrome headless) caería a Georgia/Times en títulos y cursivas.
function preloadAllFonts() {
    if (!document.fonts) return;
    document.fonts.forEach((face) => { face.load().catch(() => {}); });
}

window.addEventListener('DOMContentLoaded', () => {
    preloadAllFonts();
    resizeSlideStage();
    updateSlideDisplay();
    setupRotateHint();
});

// ---- PDF / impresión: sombras difuminadas → sombras vectoriales escalonadas ----
// Chrome exporta box-shadow/text-shadow con desenfoque como máscaras de luminosidad (SMask); varios visores de PDF de celular
// no las soportan y pintan rectángulos grises alrededor de cada tarjeta. Las sombras sin desenfoque son vectores simples.
// Cubre elementos y pseudoelementos (::before/::after), sombras externas e internas (inset). Solo actúa al imprimir/exportar.
(function pdfSafeShadows() {
    const saved = [];
    let styleEl = null;
    function split(s) { const out = []; let d = 0, cur = ''; for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; }
    function parse(one) {
        const m = one.match(/(rgba?\([^)]*\))/); if (!m) return null;
        const inset = /inset/.test(one);
        const nums = one.replace(m[1], '').replace('inset', '').trim().split(/\s+/).map(parseFloat);
        const c = m[1].match(/[\d.]+/g).map(Number);
        return { inset, x: nums[0] || 0, y: nums[1] || 0, blur: nums[2] || 0, c, a: c.length > 3 ? c[3] : 1 };
    }
    function convertBox(shadow) {
        const out = [];
        split(shadow).forEach((one) => {
            const s = parse(one);
            if (!s || s.blur <= 0) { out.push(one); return; }
            const n = Math.min(6, Math.max(3, Math.round(s.blur / 6)));
            for (let i = 1; i <= n; i++) {
                const k = i / n;
                if (s.inset) out.push(`inset ${(s.x * k).toFixed(1)}px ${(s.y * k).toFixed(1)}px 0 ${(s.blur / 2 * k).toFixed(1)}px rgba(${s.c[0]},${s.c[1]},${s.c[2]},${(s.a * 0.8 / n).toFixed(4)})`);
                else out.push(`${(s.x * k).toFixed(1)}px ${(s.y * k).toFixed(1)}px 0 ${(s.blur / 7 * k).toFixed(1)}px rgba(${s.c[0]},${s.c[1]},${s.c[2]},${(s.a * 0.9 / n).toFixed(4)})`);
            }
        });
        return out.join(', ');
    }
    function convertText(shadow) {
        const out = [];
        split(shadow).forEach((one) => {
            const s = parse(one);
            if (!s || s.blur <= 0) { out.push(one); return; }
            for (let i = 1; i <= 4; i++) out.push(`${(s.x * i / 4).toFixed(1)}px ${(s.y * i / 4).toFixed(1)}px 0 rgba(${s.c[0]},${s.c[1]},${s.c[2]},${(s.a * 0.2).toFixed(3)})`);
        });
        return out.join(', ');
    }
    function before() {
        if (saved.length || styleEl) return;
        let css = '', id = 0;
        document.body.querySelectorAll('*').forEach((el) => {
            if (el.classList && el.classList.contains('slide')) return;   // el marco de la lámina no lleva sombra en el PDF
            const cs = getComputedStyle(el), bs = cs.boxShadow, ts = cs.textShadow;
            if (bs && bs !== 'none' && /\d+px/.test(bs)) { saved.push([el, 'box-shadow', el.style.boxShadow]); el.style.setProperty('box-shadow', convertBox(bs), 'important'); }
            if (ts && ts !== 'none' && /\d+px/.test(ts)) { saved.push([el, 'text-shadow', el.style.textShadow]); el.style.setProperty('text-shadow', convertText(ts), 'important'); }
            ['::before', '::after'].forEach((ps) => {
                const pc = getComputedStyle(el, ps), pb = pc.boxShadow, pt = pc.textShadow;
                if ((pb && pb !== 'none' && /\d+px/.test(pb)) || (pt && pt !== 'none' && /\d+px/.test(pt))) {
                    const tag = 'pdfsh' + (++id); el.setAttribute('data-pdfsh', (el.getAttribute('data-pdfsh') || '') + ' ' + tag);
                    css += `[data-pdfsh~="${tag}"]${ps}{` + ((pb && pb !== 'none') ? `box-shadow:${convertBox(pb)} !important;` : '') + ((pt && pt !== 'none') ? `text-shadow:${convertText(pt)} !important;` : '') + '}\n';
                    saved.push([el, 'data-pdfsh', null]);
                }
            });
        });
        styleEl = document.createElement('style'); styleEl.textContent = css; document.head.appendChild(styleEl);
    }
    function after() {
        while (saved.length) { const [el, prop, v] = saved.pop(); if (prop === 'data-pdfsh') el.removeAttribute('data-pdfsh'); else if (v) el.style.setProperty(prop, v); else el.style.removeProperty(prop); }
        if (styleEl) { styleEl.remove(); styleEl = null; }
    }
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    if (window.matchMedia) { const mq = window.matchMedia('print'); const h = (e) => (e.matches ? before() : after()); if (mq.addEventListener) mq.addEventListener('change', h); else if (mq.addListener) mq.addListener(h); }
})();

// Fuerza la carga de todas las @font-face (las de láminas ocultas no se piden solas y el PDF caería a Liberation/Georgia).
(function preloadFontsForPdf() { if (document.fonts) document.fonts.forEach((face) => { face.load().catch(() => {}); }); })();
