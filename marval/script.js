// ==========================================
// MARVAL S.A.S. — Switch Escenario A / Escenario B
// ==========================================

const state = {
    scenario: 'a',
    currentSlide: 1,
    totalSlides: 10,
    autoplayActive: false,
    autoplayTimer: null,
};

// Cifras que difieren entre escenarios (calculadas desde las cotizaciones fuente)
const SCENARIO_DATA = {
    a: {
        badge: 'Escenario A',
        version: 'Escenario A · 0.1',
        ecoAgenteIA: '$5.838.275,08',
        ecoCimientos: '$61.679.976,67',
        investTotal: '$103.049.261,2',
        invest40a: '$41.219.704,50',
        invest40b: '$41.219.704,50',
        invest20: '$20.609.852,25',
    },
    b: {
        badge: 'Escenario B',
        version: 'Escenario B · 0.1',
        ecoAgenteIA: '$8.757.412,62',
        ecoCimientos: '$74.636.185,28',
        investTotal: '$118.924.607,4',
        invest40a: '$47.569.842,96',
        invest40b: '$47.569.842,96',
        invest20: '$23.784.921,48',
    },
};

function applyScenarioContent(esc) {
    const d = SCENARIO_DATA[esc];
    document.getElementById('cover-scenario-badge').textContent = d.badge;
    document.getElementById('cover-version').textContent = d.version;
    document.getElementById('eco-agente-ia').textContent = d.ecoAgenteIA;
    document.getElementById('eco-cimientos').textContent = d.ecoCimientos;
    document.getElementById('invest-total-text').textContent = d.investTotal;
    document.getElementById('invest-40a').textContent = d.invest40a;
    document.getElementById('invest-40b').textContent = d.invest40b;
    document.getElementById('invest-20').textContent = d.invest20;
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

window.addEventListener('resize', moveScenarioPill);

window.addEventListener('DOMContentLoaded', () => {
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
