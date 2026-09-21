// ==========================================
// FINANCIERA COMULTRASAN — AGENTE DE IA NORMATIVO
// Shell interactivo: navegación de láminas + autoplay
// ==========================================

const state = {
    currentSlide: 1,
    totalSlides: 10,
    autoplayActive: false,
    autoplayTimer: null,
};

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

window.addEventListener('DOMContentLoaded', () => {
    resizeSlideStage();
    updateSlideDisplay();
});
