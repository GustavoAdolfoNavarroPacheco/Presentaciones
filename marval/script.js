// ==========================================
// MARVAL S.A.S. — Switch Escenario A / Escenario B
// ==========================================

const state = {
    scenario: 'a',
    currentSlide: 1,
    totalSlides: 9,
    autoplayActive: false,
    autoplayTimer: null,
};

// Textos que difieren entre escenarios
const SCENARIO_DATA = {
    a: {
        badge: 'Escenario A',
        version: 'Escenario A · 0.1',
    },
    b: {
        badge: 'Escenario B',
        version: 'Escenario B · 0.1',
    },
};

function applyScenarioContent(esc) {
    const d = SCENARIO_DATA[esc];
    document.getElementById('cover-scenario-badge').textContent = d.badge;
    document.getElementById('cover-version').textContent = d.version;
}

// ---- Escalado de la lámina al espacio disponible (evita tener que hacer zoom-out) ----
const SLIDE_NATIVE_W = 1056; // 11in a 96dpi, igual que el PDF impreso
const SLIDE_NATIVE_H = 594;  // 6.1875in a 96dpi

function resizeSlideStage() {
    const container = document.getElementById('slides-container');
    if (!container) return;
    const availW = container.clientWidth - 16;
    const availH = container.clientHeight - 16;
    const scale = Math.min(availW / SLIDE_NATIVE_W, availH / SLIDE_NATIVE_H, 1.35);
    document.documentElement.style.setProperty('--slide-scale', scale.toFixed(4));
}

function switchScenario(target) {
    if (state.scenario === target) return;
    state.scenario = target;
    state.currentSlide = 1;

    document.body.classList.toggle('scenario-a', target === 'a');
    document.body.classList.toggle('scenario-b', target === 'b');
    document.getElementById('btn-scenario-a').classList.toggle('active', target === 'a');
    document.getElementById('btn-scenario-b').classList.toggle('active', target === 'b');

    applyScenarioContent(target);
    moveScenarioPill();
    updateSlideDisplay();
}

function moveScenarioPill() {
    const activeBtn = document.querySelector('.scenario-btn.active');
    const pill = document.getElementById('scenario-pill');
    if (!activeBtn || !pill) return;
    pill.style.left = `${activeBtn.offsetLeft}px`;
    pill.style.width = `${activeBtn.offsetWidth}px`;
}

function isSlideVisible(slideEl) {
    const sc = slideEl.dataset.scenario;
    return (sc === 'both' || sc === state.scenario) && parseInt(slideEl.dataset.slide, 10) === state.currentSlide;
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

window.addEventListener('resize', () => {
    moveScenarioPill();
    resizeSlideStage();
});

window.addEventListener('DOMContentLoaded', () => {
    resizeSlideStage();
    // Soporte para precargar el escenario B al exportar el segundo PDF: index.html?escenario=b
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('escenario') === 'b' ? 'b' : 'a';

    state.scenario = initial;
    document.body.classList.toggle('scenario-a', initial === 'a');
    document.body.classList.toggle('scenario-b', initial === 'b');
    document.getElementById('btn-scenario-a').classList.toggle('active', initial === 'a');
    document.getElementById('btn-scenario-b').classList.toggle('active', initial === 'b');

    applyScenarioContent(initial);
    moveScenarioPill();
    updateSlideDisplay();
});
