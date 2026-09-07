// ==========================================
// ALCALDÍA MUNICIPAL DE GIRÓN, SANTANDER
// Shell interactivo: barra lateral retráctil (14 apartados) +
// barra inferior (navega portada ↔ contenido dentro de cada solución)
// ==========================================

const state = {
    currentSlide: 1,
    totalSlides: 28,
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

// El nav-item de la barra lateral apunta a la PORTADA de cada sección (el número más
// bajo del par portada/contenido, o 1 para el resumen). Resaltamos ese nav-item tanto
// si el usuario está viendo la portada como el contenido de esa misma solución.
function sectionStartFor(slideNumber) {
    const navNumbers = [...document.querySelectorAll('.nav-item')]
        .map((el) => parseInt(el.dataset.nav, 10))
        .sort((a, b) => a - b);
    let start = navNumbers[0];
    for (const n of navNumbers) {
        if (n <= slideNumber) start = n; else break;
    }
    return start;
}

// Desliza la pastilla de selección hasta el nav-item activo (en vez de reasignar
// un fondo instantáneo por clase en cada item).
function moveNavIndicator() {
    const indicator = document.getElementById('navIndicator');
    const active = document.querySelector('.nav-item.active');
    const nav = document.querySelector('.sidebar-nav');
    if (!indicator || !active || !nav) return;
    const itemRect = active.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    const top = itemRect.top - navRect.top + nav.scrollTop;
    indicator.style.transform = `translateY(${top}px)`;
    indicator.style.height = `${itemRect.height}px`;
    indicator.style.opacity = '1';
}

function updateSlideDisplay() {
    let activeSlideEl = null;
    document.querySelectorAll('.slide').forEach((slide) => {
        const isActive = parseInt(slide.dataset.slide, 10) === state.currentSlide;
        slide.classList.toggle('active', isActive);
        if (isActive) activeSlideEl = slide;
    });

    const currentSectionStart = sectionStartFor(state.currentSlide);
    document.querySelectorAll('.nav-item').forEach((item) => {
        item.classList.toggle('active', parseInt(item.dataset.nav, 10) === currentSectionStart);
    });
    moveNavIndicator();

    if (activeSlideEl) {
        document.getElementById('crumb-title').textContent = activeSlideEl.dataset.title || '';
        document.getElementById('crumb-eyebrow').textContent = activeSlideEl.dataset.eyebrow || 'Alcaldía de Girón';
    }
    document.getElementById('header-count').textContent = `${state.currentSlide} / ${state.totalSlides}`;
    document.getElementById('slide-number-display').textContent = `${state.currentSlide} / ${state.totalSlides}`;
    document.getElementById('slide-progress').style.width = `${(state.currentSlide / state.totalSlides) * 100}%`;
}

function goToSlide(n) {
    if (n < 1 || n > state.totalSlides) return;
    state.currentSlide = n;
    updateSlideDisplay();
}

function navigateSlide(direction) {
    let next = state.currentSlide + direction;
    if (next > state.totalSlides) next = 1;
    if (next < 1) next = state.totalSlides;
    goToSlide(next);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    state.sidebarCollapsed = !state.sidebarCollapsed;
    sidebar.classList.toggle('collapsed', state.sidebarCollapsed);
    // El colapso oculta las etiquetas de grupo y reacomoda los nav-items de inmediato
    // (sin transición propia), así que la pastilla se puede reposicionar ya mismo.
    moveNavIndicator();
    // Recalcular el zoom de la lámina una vez termine la transición de ancho del sidebar.
    setTimeout(resizeSlideStage, 400);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') navigateSlide(1);
    if (e.key === 'ArrowLeft') navigateSlide(-1);
});

window.addEventListener('resize', () => { resizeSlideStage(); moveNavIndicator(); });

window.addEventListener('DOMContentLoaded', () => {
    resizeSlideStage();
    updateSlideDisplay();
});
