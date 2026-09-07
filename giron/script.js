// ==========================================
// ALCALDÍA MUNICIPAL DE GIRÓN, SANTANDER
// Shell interactivo: barra lateral retráctil + 14 apartados
// ==========================================

const state = {
    currentSlide: 1,
    totalSlides: 14,
    sidebarCollapsed: false,
};

// ---- Escalado de la lámina al espacio disponible ----
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

function updateSlideDisplay() {
    let activeSlideEl = null;
    document.querySelectorAll('.slide').forEach((slide) => {
        const isActive = parseInt(slide.dataset.slide, 10) === state.currentSlide;
        slide.classList.toggle('active', isActive);
        if (isActive) activeSlideEl = slide;
    });

    document.querySelectorAll('.nav-item').forEach((item) => {
        item.classList.toggle('active', parseInt(item.dataset.nav, 10) === state.currentSlide);
    });

    if (activeSlideEl) {
        document.getElementById('crumb-title').textContent = activeSlideEl.dataset.title || '';
        document.getElementById('crumb-eyebrow').textContent = activeSlideEl.dataset.eyebrow || 'Alcaldía de Girón';
    }
    document.getElementById('header-count').textContent = `${state.currentSlide} / ${state.totalSlides}`;
}

function goToSlide(n) {
    if (n < 1 || n > state.totalSlides) return;
    state.currentSlide = n;
    updateSlideDisplay();
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    state.sidebarCollapsed = !state.sidebarCollapsed;
    sidebar.classList.toggle('collapsed', state.sidebarCollapsed);
    // Recalcular el zoom de la lámina una vez termine la transición de ancho del sidebar.
    setTimeout(resizeSlideStage, 400);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goToSlide(state.currentSlide + 1 > state.totalSlides ? 1 : state.currentSlide + 1);
    if (e.key === 'ArrowLeft') goToSlide(state.currentSlide - 1 < 1 ? state.totalSlides : state.currentSlide - 1);
});

window.addEventListener('resize', resizeSlideStage);

window.addEventListener('DOMContentLoaded', () => {
    resizeSlideStage();
    updateSlideDisplay();
});
