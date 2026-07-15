/* ==========================================
   LÓGICA DE CONTROL — COLBEEF S.A.S. DEMO
   ========================================== */

const state = {
    currentSlide: 1,
    totalSlides: 11,
    activeView: 'slides', // 'slides' o 'simulator'
    theme: 'light',
    autoplayActive: false,
    autoplayTimer: null,
    isTyping: false,

    activeSimModule: 'clientes',

    // --- Clientes ---
    clientQuery: '',
    clientes: [
        { nombre: 'Frigorífico del Oriente', nit: 'NIT 900.201.801-4', tipo: 'Jurídica', telefono: '+57 316 822 6094', finca: 'Finca Santa Rita' },
        { nombre: 'Cárnicos San Francisco', nit: 'NIT 900.112.018-2', tipo: 'Jurídica', telefono: '+57 315 638 5923', finca: 'Sin registro' },
        { nombre: 'Distribuidora Guarín', nit: 'NIT 900.032.018-9', tipo: 'Jurídica', telefono: '+57 317 412 5678', finca: 'Finca La Concordia' },
        { nombre: 'Comercializadora Real de Minas', nit: 'NIT 900.052.018-1', tipo: 'Jurídica', telefono: '+57 314 432 4411', finca: 'Sin registro' },
        { nombre: 'Cárnicos Provenza', nit: 'NIT 900.062.018-6', tipo: 'Natural', telefono: '+57 313 800 1456', finca: 'Finca El Roble' },
        { nombre: 'Frigorífico Zona Sur', nit: 'NIT 900.082.018-3', tipo: 'Jurídica', telefono: '+57 321 443 2441', finca: 'Sin registro' },
        { nombre: 'Distribuidora Floridablanca', nit: 'NIT 900.092.018-8', tipo: 'Jurídica', telefono: '+57 317 517 8403', finca: 'Finca Buenavista' },
        { nombre: 'Cárnicos Piedecuesta', nit: 'NIT 900.102.019-5', tipo: 'Natural', telefono: '+57 315 219 8749', finca: 'Sin registro' },
    ],

    // --- Conductores ---
    driverQuery: '',
    driverPage: 1,
    driverPageSize: 4,
    conductores: [
        { nombre: 'Alberto Suárez', email: 'alberto.suarez@colbeef.com', cc: '1023456802', placa: 'CBF144', telefono: '3001234582', activo: true, registro: '11 mar 2026' },
        { nombre: 'Álvaro Jiménez', email: 'alvaro.jimenez@colbeef.com', cc: '1023456810', placa: 'CBF152', telefono: '3001234590', activo: true, registro: '11 mar 2026' },
        { nombre: 'Andrés Rueda', email: 'andres.rueda@colbeef.com', cc: '1023456784', placa: 'CBF126', telefono: '3001234564', activo: true, registro: '11 mar 2026' },
        { nombre: 'Camilo Duarte', email: 'camilo.duarte@colbeef.com', cc: '1023456795', placa: 'CBF137', telefono: '3001234575', activo: false, registro: '11 mar 2026' },
        { nombre: 'Carlos Rodríguez', email: 'carlos.rodriguez@colbeef.com', cc: '1023456781', placa: 'CBF123', telefono: '3001234561', activo: true, registro: '11 mar 2026' },
        { nombre: 'Diego Serrano', email: 'diego.serrano@colbeef.com', cc: '1023456805', placa: 'CBF147', telefono: '3001234585', activo: true, registro: '02 mar 2026' },
        { nombre: 'David Vargas', email: 'david.vargas@colbeef.com', cc: '1023456787', placa: 'CBF129', telefono: '3001234567', activo: true, registro: '11 mar 2026' },
        { nombre: 'Diego Ramírez', email: 'diego.ramirez@colbeef.com', cc: '1023456789', placa: 'CBF131', telefono: '3001234569', activo: false, registro: '11 mar 2026' },
    ],

    // --- Por Facturar ---
    facturarQuery: '',
    porFacturar: [
        { guia: '#026-B-11001-0003495976', fecha: '07 jul 2026', cliente: 'Diego Serrano', cantidad: 4, telefono: '+57 317 517 8403' },
        { guia: '#026-B-11001-0003495977', fecha: '06 jul 2026', cliente: 'Diego Lizarazo', cantidad: 0, telefono: '+57 315 219 8749' },
        { guia: '#026-B-11001-0003486193', fecha: '01 jul 2026', cliente: 'José Guillermo Paúl', cantidad: 0, telefono: '+57 313 800 1456' },
        { guia: '#026-B-11001-0003495979', fecha: '17 jun 2026', cliente: 'Eduard Cala', cantidad: 0, telefono: '+57 321 443 2441' },
        { guia: '#026-B-11001-0003495978', fecha: '25 may 2026', cliente: 'Héctor Suárez', cantidad: 0, telefono: '+57 316 822 6094' },
        { guia: '#026-B-11001-0003486194', fecha: '18 jun 2026', cliente: 'Diego Serrano', cantidad: 70, telefono: '+57 317 517 8403' },
    ],

    // --- Reportes Cartera ---
    carteraQuery: '',
    carteraProcesado: '13 abr 2026 07:43 am',
    reportesCartera: [
        { nit: '1096064001', nombre: 'Guillermo Paúl', cupo: 35000000, vencido: 30000000 },
        { nit: '45654654-2', nombre: 'Jhon Gómez', cupo: 35000001, vencido: 30000001 },
        { nit: '64565465-3', nombre: 'Verónica Gómez', cupo: 35000002, vencido: 30000002 },
    ],

    // --- Inventario Cava ---
    inventarioImportado: false,
    inventarioDia: '2026-07-15',
    inventarioCava: [
        { codigo: 'INV-0231', producto: 'Canal Res Tipo A', cantidad: 42, ubicacion: 'Cava 1 · Nivel 2' },
        { codigo: 'INV-0232', producto: 'Canal Res Tipo B', cantidad: 18, ubicacion: 'Cava 1 · Nivel 1' },
        { codigo: 'INV-0233', producto: 'Vísceras Rojas', cantidad: 65, ubicacion: 'Cava 2 · Nivel 1' },
        { codigo: 'INV-0234', producto: 'Canal Res Tipo A', cantidad: 27, ubicacion: 'Cava 2 · Nivel 3' },
    ],

    // --- Salidas Cava ---
    salidasFecha: '2026-07-15',
    salidasCliente: '',
    salidasCava: [
        { codigo: 'SAL-1187', s: 'S', ppie: '412 kg', fechaSacrificio: '14 jul 2026', c1Origen: 'Cava Principal', c1Destino: 'Planta Norte', c1Tipo: 'Canal', c1Peso: '210 kg', c2Origen: 'Cava Principal', c2Destino: 'Planta Norte', c2Tipo: 'Canal', c2Peso: '198 kg', pct: '408 kg', visOrigen: 'Cava Principal', visDestino: 'Planta Norte', deco: 'Completo', cliente: 'Frigorífico del Oriente' },
        { codigo: 'SAL-1188', s: 'S', ppie: '389 kg', fechaSacrificio: '14 jul 2026', c1Origen: 'Cava Regional', c1Destino: 'Centro Cárnico Frías', c1Tipo: 'Canal', c1Peso: '196 kg', c2Origen: 'Cava Regional', c2Destino: 'Centro Cárnico Frías', c2Tipo: 'Canal', c2Peso: '190 kg', pct: '386 kg', visOrigen: 'Cava Regional', visDestino: 'Centro Cárnico Frías', deco: 'Parcial', cliente: 'Cárnicos Provenza' },
    ],

    // --- Chats ---
    chatQuery: '',
    chatFilter: 'todos', // 'todos' | 'no-leidos' | 'ayuda'
    selectedChatId: null,
    chats: [
        {
            id: 1, nombre: 'Eduard Cala', telefono: '+57 321 443 2441', fecha: '09 jul 2026', unread: 0, guia: 'GUÍA 026-B-11001-000…', ayuda: false,
            historial: [
                { from: 'in', texto: 'Buenas, ¿pueden confirmar la guía de hoy?', time: '09:12' },
                { from: 'out', texto: 'Claro, la guía #026-B-11001-0003495976 quedó confirmada con 4 canales.', time: '09:15' },
            ]
        },
        {
            id: 2, nombre: 'Julio Acosta', telefono: '+57 317 800 1452', fecha: '07 jul 2026', unread: 2, guia: 'GUÍA 026-B-11001-000…', ayuda: true,
            historial: [
                { from: 'in', texto: 'Necesito ayuda, el bot no reconoce mi placa.', time: '08:02' },
                { from: 'in', texto: '¿Pueden revisar manualmente?', time: '08:03' },
            ]
        },
        {
            id: 3, nombre: 'Diego Serrano', telefono: '+57 317 517 8403', fecha: '15 jul 2026', unread: 1, guia: 'GUÍA 026-B-11001-000…', ayuda: false,
            historial: [
                { from: 'in', texto: 'Hola', time: '08:49 AM' },
            ]
        },
        {
            id: 4, nombre: 'Diego Lizarazo', telefono: '+57 315 219 8749', fecha: '07 jul 2026', unread: 0, guia: 'GUÍA 026-B-11001-000…', ayuda: false,
            historial: [
                { from: 'out', texto: 'Su guía fue procesada exitosamente.', time: '10:05' },
            ]
        },
        {
            id: 5, nombre: 'Héctor Suárez', telefono: '+57 316 822 6094', fecha: '01 jul 2026', unread: 0, guia: 'GUÍA 026-B-11001-000…', ayuda: false,
            historial: [
                { from: 'in', texto: '¿A qué hora abre la cava mañana?', time: '17:20' },
                { from: 'out', texto: 'La cava abre a las 6:00 am según el horario configurado.', time: '17:22' },
            ]
        },
    ],

    // --- Destinos ---
    destinoTab: 'planillaje', // 'planillaje' | 'cava'
    destinoQuery: '',
    destinosPlanillaje: [
        { destino: 'Cava Principal', abrev: 1, direccion: 'Frigorífico del Oriente', telefono: '310 458 7261', ubicacion: 'Calle 19 #12-34', depto: 'Norte de Santander', municipio: 'Piedecuesta' },
        { destino: 'Centro Cárnico Santander', abrev: 1, direccion: 'Carnes Premium SAS', telefono: '311 672 9405', ubicacion: 'Carrera 21 #45-18', depto: 'Antioquia', municipio: 'Altamira' },
        { destino: 'Centro Cárnico Frías', abrev: 1, direccion: 'Carnes Frías SAS', telefono: '320 513 7842', ubicacion: 'Carrera 15 #A-45', depto: 'Norte de Santander', municipio: 'Agua de la Virgen' },
        { destino: 'Cava Regional Oriente', abrev: 1, direccion: 'Distribución Frigorífica', telefono: '315 947 6023', ubicacion: 'Carrera 12 #34-45', depto: 'Antioquia', municipio: 'Buena Vista' },
        { destino: 'Planta Industrial Norte', abrev: 1, direccion: 'Industrias Cárnicas Colombia', telefono: '318 760 1439', ubicacion: 'Carrera 3 #24-12', depto: 'Atlántico', municipio: 'Chiquinquirá' },
    ],
    destinosCava: [
        { destino: 'Cava 1 · Nivel 1', abrev: 1, direccion: 'Bodega interna', telefono: '310 458 7261', ubicacion: 'Planta principal', depto: 'Norte de Santander', municipio: 'Piedecuesta' },
        { destino: 'Cava 1 · Nivel 2', abrev: 1, direccion: 'Bodega interna', telefono: '310 458 7261', ubicacion: 'Planta principal', depto: 'Norte de Santander', municipio: 'Piedecuesta' },
        { destino: 'Cava 2 · Nivel 1', abrev: 1, direccion: 'Bodega interna', telefono: '310 458 7261', ubicacion: 'Planta principal', depto: 'Norte de Santander', municipio: 'Piedecuesta' },
    ],

    // --- Usuarios ---
    userQuery: '',
    userTypeFilter: '',
    userPage: 1,
    userPageSize: 8,
    usuarios: [
        { nombre: 'Alejandra Gómez', tipo: 'Administrador', email: 'alejandra.gomez@colbeef.com', activo: true },
        { nombre: 'Eduard Cala', tipo: 'Administrador', email: 'eduard.cala@colbeef.com', activo: true },
        { nombre: 'Diego Serrano', tipo: 'Gestor', email: 'diego.serrano@colbeef.com', activo: true },
        { nombre: 'Carlos Rodríguez', tipo: 'Administrador', email: 'carlos.rodriguez@colbeef.com', activo: true },
        { nombre: 'Diana Reyes', tipo: 'Gestor', email: 'diana.reyes@colbeef.com', activo: true },
        { nombre: 'Fernando Ruiz', tipo: 'Administrador', email: 'fernando.ruiz@colbeef.com', activo: false },
        { nombre: 'Gustavo Navarro', tipo: 'Gestor', email: 'gustavo.navarro@colbeef.com', activo: true },
        { nombre: 'Héctor Cabrera', tipo: 'Super-admin', email: 'hector.cabrera@colbeef.com', activo: true },
        { nombre: 'Iván Guerrero', tipo: 'Administrador', email: 'ivan.guerrero@colbeef.com', activo: true },
        { nombre: 'Jorge Gómez', tipo: 'Gestor', email: 'jorge.gomez@colbeef.com', activo: true },
    ],
};

// ==========================================
// --- VISTA: Presentación / Simulador ---
// ==========================================
function switchView(view) {
    state.activeView = view;
    document.querySelectorAll('.viewport-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${view}-viewport`).classList.add('active');

    document.getElementById('btn-view-slides').classList.toggle('active', view === 'slides');
    document.getElementById('btn-view-simulator').classList.toggle('active', view === 'simulator');
    moveViewSelectorPill();
}

function moveViewSelectorPill() {
    const activeBtn = document.querySelector('.selector-btn.active');
    const pill = document.getElementById('view-selector-pill');
    if (!activeBtn || !pill) return;
    pill.style.width = `${activeBtn.offsetWidth}px`;
    pill.style.left = `${activeBtn.offsetLeft}px`;
}
window.addEventListener('load', moveViewSelectorPill);
window.addEventListener('resize', moveViewSelectorPill);

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        state.theme = 'light';
        themeIcon.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        state.theme = 'dark';
        themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
    }
}

// ==========================================
// --- CONTROLADOR DE PRESENTACIÓN DE SLIDES ---
// ==========================================
function updateSlideDisplay() {
    document.querySelectorAll('.slide').forEach(slide => {
        slide.classList.remove('active');
        if (parseInt(slide.getAttribute('data-slide')) === state.currentSlide) {
            slide.classList.add('active');
        }
    });
    document.getElementById('slide-number-display').innerText = `${state.currentSlide} / ${state.totalSlides}`;
    const progressPercent = (state.currentSlide / state.totalSlides) * 100;
    document.getElementById('slide-progress').style.width = `${progressPercent}%`;
}

function navigateSlide(direction) {
    state.currentSlide += direction;
    if (state.currentSlide > state.totalSlides) state.currentSlide = 1;
    if (state.currentSlide < 1) state.currentSlide = state.totalSlides;
    updateSlideDisplay();
}

function jumpToSlide(number) {
    if (state.activeView !== 'slides') switchView('slides');
    state.currentSlide = number;
    updateSlideDisplay();
}

function toggleAutoplay() {
    const apBtn = document.getElementById('btn-autoplay');
    const apIcon = document.getElementById('autoplay-icon');
    if (state.autoplayActive) {
        clearInterval(state.autoplayTimer);
        state.autoplayActive = false;
        apBtn.classList.remove('active');
        apIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`;
    } else {
        state.autoplayActive = true;
        apBtn.classList.add('active');
        apIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>`;
        state.autoplayTimer = setInterval(() => navigateSlide(1), 5000);
    }
}

document.addEventListener('keydown', (e) => {
    if (state.activeView === 'slides') {
        if (e.key === 'ArrowRight' || e.key === ' ') navigateSlide(1);
        else if (e.key === 'ArrowLeft') navigateSlide(-1);
    }
});

// ==========================================
// --- SIMULADOR DEMO: navegación de secciones ---
// ==========================================
function selectSimModule(mod) {
    state.activeSimModule = mod;
    document.querySelectorAll('.cs-icon-item').forEach(el => el.classList.toggle('active', el.dataset.module === mod));
    document.querySelectorAll('.cs-pane').forEach(el => el.classList.toggle('active', el.id === `cs-${mod}`));
}

const fmtCOP = n => '$' + n.toLocaleString('es-CO');

// ---------- 1. CLIENTES ----------
function renderClientes() {
    const q = state.clientQuery.trim().toLowerCase();
    const list = state.clientes.filter(c => !q || c.nombre.toLowerCase().includes(q) || c.nit.toLowerCase().includes(q));
    const el = document.getElementById('cs-clientes-grid');
    if (!list.length) { el.innerHTML = `<div class="cs-empty-inline">No se encontraron clientes para "${escapeHtml(state.clientQuery)}".</div>`; return; }
    el.innerHTML = list.map(c => `
        <div class="cs-client-card">
            <h5>${escapeHtml(c.nombre)}</h5>
            <div class="cs-client-row"><svg class="cs-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>${c.nit}</div>
            <div class="cs-client-row"><svg class="cs-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/></svg>${c.telefono}</div>
            <div class="cs-client-row"><svg class="cs-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>${c.tipo}</div>
            <div class="cs-client-row"><svg class="cs-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10l9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>${c.finca}</div>
        </div>`).join('');
}
function onClientSearch(v) { state.clientQuery = v; renderClientes(); }
function onSyncClientes(btn) { runWithLoading(btn, 700, () => { flashToast('Clientes sincronizados correctamente.'); flashHighlight(document.getElementById('cs-clientes-grid')); }); }
function onCrearCliente() { flashToast('Formulario de creación de cliente (demo) — no hay backend conectado.'); }

// ---------- 2. CONDUCTORES ----------
function renderConductores() {
    const q = state.driverQuery.trim().toLowerCase();
    let list = state.conductores.filter(d => !q || d.nombre.toLowerCase().includes(q) || d.placa.toLowerCase().includes(q));
    const totalPages = Math.max(1, Math.ceil(list.length / state.driverPageSize));
    if (state.driverPage > totalPages) state.driverPage = totalPages;
    const start = (state.driverPage - 1) * state.driverPageSize;
    const pageItems = list.slice(start, start + state.driverPageSize);

    const grid = document.getElementById('cs-conductores-grid');
    if (!pageItems.length) { grid.innerHTML = `<div class="cs-empty-inline">No se encontraron conductores.</div>`; }
    else {
        grid.innerHTML = pageItems.map((d) => `
        <div class="cs-driver-card">
            <div class="cs-driver-head">
                <h5>${escapeHtml(d.nombre)}</h5>
                <div class="cs-driver-actions">
                    <button class="cs-toggle ${d.activo ? 'on' : ''}" onclick="toggleConductor('${escapeHtml(d.nombre)}')" title="Activo/Inactivo"><span></span></button>
                </div>
            </div>
            <a class="cs-driver-email" href="#">${d.email}</a>
            <div class="cs-driver-meta">
                <span>CC ${d.cc}</span><span>${d.telefono}</span>
                <span>${d.placa}</span><span>Registro: ${d.registro}</span>
            </div>
        </div>`).join('');
    }
    document.getElementById('cs-conductores-pag').innerHTML = paginationHtml(state.driverPage, totalPages, 'goDriverPage');
}
function toggleConductor(nombre) {
    const d = state.conductores.find(x => x.nombre === nombre);
    if (d) d.activo = !d.activo;
    renderConductores();
}
function onDriverSearch(v) { state.driverQuery = v; state.driverPage = 1; renderConductores(); }
function goDriverPage(p) { state.driverPage = p; renderConductores(); }
function onCrearConductor() { flashToast('Formulario de creación de conductor (demo) — no hay backend conectado.'); }

// ---------- 3. POR FACTURAR ----------
function renderPorFacturar() {
    const q = state.facturarQuery.trim().toLowerCase();
    const list = state.porFacturar.filter(g => !q || g.cliente.toLowerCase().includes(q) || g.guia.toLowerCase().includes(q));
    const el = document.getElementById('cs-facturar-grid');
    if (!list.length) { el.innerHTML = `<div class="cs-empty-inline">No se encontraron guías.</div>`; return; }
    el.innerHTML = list.map(g => `
        <div class="cs-guia-card">
            <div class="cs-guia-head"><b>${g.guia}</b><span>${g.fecha}</span></div>
            <div class="cs-guia-row"><span>${escapeHtml(g.cliente)}</span><span class="cs-guia-qty">Cant. ${g.cantidad}</span></div>
            <div class="cs-guia-tel">Teléfono: <b>${g.telefono}</b></div>
        </div>`).join('');
}
function onFacturarSearch(v) { state.facturarQuery = v; renderPorFacturar(); }
function onExportarFacturar(btn) { runWithLoading(btn, 900, () => flashToast('Datos exportados correctamente.')); }
function onCrearPlantilla(btn) { runWithLoading(btn, 700, () => flashToast('Plantilla de facturación creada (demo).')); }

// ---------- 4. REPORTES CARTERA ----------
function renderReportesCartera() {
    const q = state.carteraQuery.trim().toLowerCase();
    const list = state.reportesCartera.filter(r => !q || r.nombre.toLowerCase().includes(q) || r.nit.includes(q));
    document.getElementById('cs-cartera-procesado').textContent = state.carteraProcesado;
    const el = document.getElementById('cs-cartera-tbody');
    if (!list.length) { el.innerHTML = `<tr><td colspan="4" class="cs-empty-cell">Sin resultados.</td></tr>`; return; }
    el.innerHTML = list.map(r => `
        <tr><td>${r.nit}</td><td>${escapeHtml(r.nombre)}</td><td>${fmtCOP(r.cupo)}</td><td>${fmtCOP(r.vencido)}</td></tr>
    `).join('');
}
function onCarteraSearch(v) { state.carteraQuery = v; renderReportesCartera(); }
function onImportarCartera(btn) {
    runWithLoading(btn, 900, () => {
        state.carteraProcesado = new Date().toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        flashToast('Reporte de cartera importado y reprocesado.');
        renderReportesCartera();
        flashHighlight(document.querySelector('.cs-table-wrap'));
    });
}

// ---------- 5. INVENTARIO CAVA ----------
function renderInventarioCava() {
    document.getElementById('cs-inv-dia').value = state.inventarioDia;
    const empty = document.getElementById('cs-inv-empty');
    const tableWrap = document.getElementById('cs-inv-table-wrap');
    if (!state.inventarioImportado) {
        empty.style.display = '';
        tableWrap.style.display = 'none';
        return;
    }
    empty.style.display = 'none';
    tableWrap.style.display = '';
    document.getElementById('cs-inv-tbody').innerHTML = state.inventarioCava.map(i => `
        <tr><td>${i.codigo}</td><td>${escapeHtml(i.producto)}</td><td>${i.cantidad}</td><td>${escapeHtml(i.ubicacion)}</td></tr>
    `).join('');
}
function onInventarioDia(v) { state.inventarioDia = v; }
function onImportarInventario(btn) {
    runWithLoading(btn, 900, () => {
        state.inventarioImportado = true;
        flashToast('Archivo del SIR importado correctamente.');
        renderInventarioCava();
        flashHighlight(document.getElementById('cs-inv-table-wrap'));
    });
}

// ---------- 6. SALIDAS CAVA ----------
function renderSalidasCava() {
    document.getElementById('cs-sal-fecha').value = state.salidasFecha;
    const q = state.salidasCliente.trim().toLowerCase();
    const list = q.length >= 3 ? state.salidasCava.filter(s => s.cliente.toLowerCase().includes(q)) : [];
    const tbody = document.getElementById('cs-sal-tbody');
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="12" class="cs-empty-cell">${q.length >= 3 ? 'Sin datos para ese cliente.' : 'Escribe al menos 3 letras del cliente para buscar.'}</td></tr>`;
        return;
    }
    tbody.innerHTML = list.map(s => `
        <tr>
            <td>${s.codigo}</td><td>${s.s}</td><td>${s.ppie}</td><td>${s.fechaSacrificio}</td>
            <td>${s.c1Origen}</td><td>${s.c1Destino}</td><td>${s.c1Tipo}</td><td>${s.c1Peso}</td>
            <td>${s.pct}</td><td>${s.visOrigen}</td><td>${s.visDestino}</td><td>${s.deco}</td>
        </tr>`).join('');
}
function onSalidasFecha(v) { state.salidasFecha = v; renderSalidasCava(); }
function onSalidasCliente(v) { state.salidasCliente = v; renderSalidasCava(); }
function onDespacho(btn) { runWithLoading(btn, 800, () => flashToast('Despacho generado correctamente (demo).')); }

// ---------- 7. CHATS ----------
function getAvatarBg(name) {
    const colors = [
        'linear-gradient(135deg, #FF6B6B, #FF8E53)',
        'linear-gradient(135deg, #4E54C8, #8F94FB)',
        'linear-gradient(135deg, #11998E, #38EF7D)',
        'linear-gradient(135deg, #FC4A1A, #F7B733)',
        'linear-gradient(135deg, #7F00FF, #E100FF)',
        'linear-gradient(135deg, #FF007F, #FF00FF)',
        'linear-gradient(135deg, #00B4DB, #0083B0)',
        'linear-gradient(135deg, #F857A6, #FF5858)',
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
        sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
}

function renderChats() {
    const q = state.chatQuery.trim().toLowerCase();
    let list = state.chats.filter(c => !q || c.nombre.toLowerCase().includes(q) || c.telefono.includes(q));
    if (state.chatFilter === 'no-leidos') list = list.filter(c => c.unread > 0);
    if (state.chatFilter === 'ayuda') list = list.filter(c => c.ayuda);

    document.getElementById('cs-chat-count-unread').textContent = state.chats.filter(c => c.unread > 0).length;
    document.getElementById('cs-chat-count-ayuda').textContent = state.chats.filter(c => c.ayuda).length;

    const listEl = document.getElementById('cs-chat-list');
    listEl.innerHTML = list.map(c => `
        <div class="cs-chat-item ${state.selectedChatId === c.id ? 'active' : ''}" onclick="selectChat(${c.id})">
            <div class="cs-chat-avatar" style="background: ${getAvatarBg(c.nombre)}">${c.nombre.charAt(0)}</div>
            <div class="cs-chat-info">
                <div class="cs-chat-top"><b>${escapeHtml(c.nombre)}</b><span>${c.fecha}</span></div>
                <div class="cs-chat-tel">${c.telefono}</div>
                <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                    <span class="cs-chat-badge">IA 💬</span>
                    ${c.ayuda ? `<span class="cs-chat-badge" style="background: var(--primary-glow); color: var(--primary-color);">SOPORTE ⚠️</span>` : ''}
                </div>
                <div class="cs-chat-guia">${c.guia}</div>
            </div>
            ${c.unread ? `<span class="cs-chat-unread">${c.unread}</span>` : ''}
        </div>`).join('') || `<div class="cs-empty-inline">No hay chats para este filtro.</div>`;

    renderChatDetail();
}
function selectChat(id) {
    state.selectedChatId = id;
    const c = state.chats.find(x => x.id === id);
    if (c) c.unread = 0;
    renderChats();
}
function renderChatDetail() {
    const detail = document.getElementById('cs-chat-detail');
    const c = state.chats.find(x => x.id === state.selectedChatId);
    if (!c) {
        detail.innerHTML = `<div class="cs-chat-empty"><div class="cs-chat-empty-icon">💬</div><h4>Sin selección</h4><p>Selecciona un chat de la lista de la izquierda para ver el historial de mensajes</p></div>`;
        return;
    }
    detail.innerHTML = `
        <div class="cs-chat-detail-head">
            <div class="cs-chat-detail-userinfo">
                <div class="cs-chat-avatar" style="background: ${getAvatarBg(c.nombre)}">${c.nombre.charAt(0)}</div>
                <div>
                    <div class="cs-chat-detail-name">
                        <b>${escapeHtml(c.nombre)}</b>
                        <span class="cs-chat-status-pulse"></span>
                        <span class="cs-chat-status-text">En línea (Agente IA)</span>
                    </div>
                    <div class="cs-chat-detail-tel">${c.telefono}</div>
                </div>
            </div>
            <div class="cs-chat-detail-actions">
                <button class="cs-chat-action-btn" title="Asistencia Humana" onclick="flashToast('Transfiriendo a agente humano…')">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <span>Pausar IA</span>
                </button>
                <button class="cs-chat-action-btn primary" title="Ver Guía" onclick="flashToast('Abriendo guía ${escapeHtml(c.guia.replace('GUÍA ', ''))}…')">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    <span>Ver Guía</span>
                </button>
            </div>
        </div>
        <div class="cs-chat-thread">
            ${c.historial.map(h => `
                <div class="cs-bubble ${h.from}">
                    <div class="cs-bubble-content">
                        <p>${escapeHtml(h.texto)}</p>
                    </div>
                    <div class="cs-bubble-meta">
                        <span>${h.time}</span>
                        ${h.from === 'out' ? `<svg class="cs-double-tick" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 12l5.25 5L18 6"/><path d="M16 6l-8 8.5L7.25 14"/></svg>` : ''}
                    </div>
                </div>
            `).join('')}
            ${state.isTyping && state.selectedChatId === c.id ? `
                <div class="cs-bubble in cs-bubble-typing">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            ` : ''}
        </div>
        <div class="cs-chat-suggestions" id="cs-chat-suggestions"></div>
        <form class="cs-chat-composer" onsubmit="sendChatMsg(event, ${c.id})">
            <button type="button" class="cs-composer-attachment" onclick="flashToast('Adjuntar archivo (demo)')">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            </button>
            <input type="text" placeholder="Escribe un mensaje aquí…" id="cs-chat-input" autocomplete="off">
            <button type="button" class="cs-composer-emoji" onclick="flashToast('Emojis (demo)')">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            </button>
            <button type="submit" class="cs-composer-send">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
        </form>
    `;
    const thread = detail.querySelector('.cs-chat-thread');
    if (thread) {
        thread.scrollTop = thread.scrollHeight;
    }
    renderChatSuggestions(c);
}
function sendChatMsg(e, id) {
    e.preventDefault();
    const input = document.getElementById('cs-chat-input');
    const val = input.value.trim();
    if (!val) return;
    const c = state.chats.find(x => x.id === id);
    c.historial.push({ from: 'out', texto: val, time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) });
    input.value = '';
    renderChatDetail();
}
function renderChatSuggestions(c) {
    const suggestionsEl = document.getElementById('cs-chat-suggestions');
    if (!suggestionsEl) return;

    if (c.id !== 3) {
        suggestionsEl.style.display = 'none';
        return;
    }

    suggestionsEl.style.display = 'flex';
    const h = c.historial;

    if (h.length === 1 && h[0].from === 'in' && h[0].texto === 'Hola') {
        const text = `Hola, Soy tu asistente de Colbeef, Te puedo ayudar con:

1. Cambio de Propietario
2. Planillaje
3. Cava/Despacho

¿Con qué te puedo ayudar?

Escribe *MENU* para volver al menú principal de opciones.`;
        suggestionsEl.innerHTML = `
            <div class="cs-chat-suggestions-title">💡 Respuesta sugerida para el Asistente</div>
            <div class="cs-chat-suggestion-card" onclick="sendSuggestedMsg(${c.id}, \`${escapeBackticks(text)}\`, '1')">
                <div class="cs-chat-suggestion-preview">${escapeHtml(text)}</div>
                <div class="cs-chat-suggestion-action">
                    <span>Enviar esta respuesta</span>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </div>
            </div>
        `;
    } 
    else if (h.length === 3 && h[2].from === 'in' && h[2].texto === '1') {
        const text = `📋 Para comenzar con el cambio de propietario, por favor envíame el número de GUÍA que deseas planillar.

Escribe *MENU* para volver al menú principal de opciones.`;
        suggestionsEl.innerHTML = `
            <div class="cs-chat-suggestions-title">💡 Respuesta sugerida para el Asistente</div>
            <div class="cs-chat-suggestion-card" onclick="sendSuggestedMsg(${c.id}, \`${escapeBackticks(text)}\`, '026-B-11001-0003495979')">
                <div class="cs-chat-suggestion-preview">${escapeHtml(text)}</div>
                <div class="cs-chat-suggestion-action">
                    <span>Enviar esta respuesta</span>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </div>
            </div>
        `;
    } 
    else if (h.length === 5 && h[4].from === 'in' && h[4].texto === '026-B-11001-0003495979') {
        const text = `La guía 026-B-11001-0003495979 tiene 40 animales en total, y 40 de ellos son de tu propiedad.

Para realizar el cambio de propietario, necesito la siguiente información de cada animal:

*   *Código del animal*
*   *Peso del animal*
*   *Tipo de documento del nuevo propietario* (CC, NIT, PASAPORTE)
*   *Número de documento del nuevo propietario*

Por favor, indícame los datos de los animales para los que deseas cambiar el propietario.

Escribe *MENU* para volver al menú principal de opciones.`;
        suggestionsEl.innerHTML = `
            <div class="cs-chat-suggestions-title">💡 Respuesta sugerida para el Asistente</div>
            <div class="cs-chat-suggestion-card" onclick="sendSuggestedMsg(${c.id}, \`${escapeBackticks(text)}\`, 'Ninguna. Finaliza el chat')">
                <div class="cs-chat-suggestion-preview">${escapeHtml(text)}</div>
                <div class="cs-chat-suggestion-action">
                    <span>Enviar esta respuesta</span>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </div>
            </div>
        `;
    } 
    else {
        suggestionsEl.innerHTML = `
            <button class="cs-chat-suggestion-reset" onclick="reiniciarAutoChat(${c.id})">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                <span>Reiniciar Simulación de Auto Chat</span>
            </button>
        `;
    }
}
function sendSuggestedMsg(chatId, textToSend, autoResponseText) {
    const c = state.chats.find(x => x.id === chatId);
    if (!c) return;

    let timeString = '08:49 AM';
    if (c.historial.length >= 2) timeString = '08:50 AM';

    c.historial.push({
        from: 'out',
        texto: textToSend,
        time: timeString
    });

    renderChatDetail();
    state.isTyping = true;
    renderChatDetail();

    setTimeout(() => {
        state.isTyping = false;
        c.historial.push({
            from: 'in',
            texto: autoResponseText,
            time: timeString
        });
        renderChats();
        if (autoResponseText === 'Ninguna. Finaliza el chat') {
            flashToast('🏁 Flujo de auto-chat completado con éxito.');
        }
    }, 1800);
}
function reiniciarAutoChat(chatId) {
    const c = state.chats.find(x => x.id === chatId);
    if (!c) return;
    c.historial = [
        { from: 'in', texto: 'Hola', time: '08:49 AM' }
    ];
    renderChats();
    flashToast('🔄 Simulación de auto-chat reiniciada.');
}
function escapeBackticks(str) {
    return str.replace(/`/g, '\\`');
}
function onChatSearch(v) { state.chatQuery = v; renderChats(); }
function setChatFilter(f) { state.chatFilter = state.chatFilter === f ? 'todos' : f; renderChats(); }

// ---------- 8. DESTINOS ----------
function renderDestinos() {
    document.querySelectorAll('.cs-destino-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === state.destinoTab));
    const q = state.destinoQuery.trim().toLowerCase();
    const source = state.destinoTab === 'planillaje' ? state.destinosPlanillaje : state.destinosCava;
    const list = source.filter(d => !q || d.destino.toLowerCase().includes(q) || d.municipio.toLowerCase().includes(q));
    const tbody = document.getElementById('cs-destinos-tbody');
    if (!list.length) { tbody.innerHTML = `<tr><td colspan="7" class="cs-empty-cell">Sin resultados.</td></tr>`; return; }
    tbody.innerHTML = list.map(d => `
        <tr>
            <td>${escapeHtml(d.destino)}</td><td>👁 (${d.abrev})</td><td>${escapeHtml(d.direccion)}</td>
            <td>${d.telefono}</td><td>${d.ubicacion}</td><td>${d.depto}</td><td>${d.municipio}</td>
        </tr>`).join('');
}
function setDestinoTab(tab) { state.destinoTab = tab; renderDestinos(); }
function onDestinoSearch(v) { state.destinoQuery = v; renderDestinos(); }
function onSincronizarDestinos(btn) { runWithLoading(btn, 700, () => { flashToast('Destinos sincronizados correctamente.'); flashHighlight(document.querySelector('.cs-table-wrap')); }); }
function onCrearDestino() { flashToast('Formulario de creación de destino (demo) — no hay backend conectado.'); }

// ---------- 9. USUARIOS ----------
function renderUsuarios() {
    const q = state.userQuery.trim().toLowerCase();
    let list = state.usuarios.filter(u => (!q || u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) && (!state.userTypeFilter || u.tipo === state.userTypeFilter));
    const totalPages = Math.max(1, Math.ceil(list.length / state.userPageSize));
    if (state.userPage > totalPages) state.userPage = totalPages;
    const start = (state.userPage - 1) * state.userPageSize;
    const pageItems = list.slice(start, start + state.userPageSize);

    const grid = document.getElementById('cs-usuarios-grid');
    if (!pageItems.length) { grid.innerHTML = `<div class="cs-empty-inline">No se encontraron usuarios.</div>`; }
    else {
        grid.innerHTML = pageItems.map(u => `
        <div class="cs-user-card">
            <div class="cs-user-ava"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg></div>
            <div class="cs-user-info">
                <b>${escapeHtml(u.nombre)}</b>
                <span class="cs-user-role">${u.tipo}</span>
                <span class="cs-user-email">${u.email}</span>
            </div>
            <button class="cs-toggle ${u.activo ? 'on' : ''}" onclick="toggleUsuario('${escapeHtml(u.email)}')"><span></span></button>
        </div>`).join('');
    }
    document.getElementById('cs-usuarios-pag').innerHTML = paginationHtml(state.userPage, totalPages, 'goUserPage');
}
function toggleUsuario(email) {
    const u = state.usuarios.find(x => x.email === email);
    if (u) u.activo = !u.activo;
    renderUsuarios();
}
function onUserSearch(v) { state.userQuery = v; state.userPage = 1; renderUsuarios(); }
function onUserTypeFilter(v) { state.userTypeFilter = v; state.userPage = 1; renderUsuarios(); }
function goUserPage(p) { state.userPage = p; renderUsuarios(); }
function onCrearUsuario() { flashToast('Formulario de creación de usuario (demo) — no hay backend conectado.'); }
function onPermisos() { flashToast('Panel de permisos (demo) — no hay backend conectado.'); }

// ---------- 10. CONFIGURACIÓN ----------
function onConfigCard(nombre) { flashToast(`Abriendo "${nombre}" (demo) — no hay backend conectado.`); }

// ---------- Utilidades compartidas ----------
function paginationHtml(current, total, fnName) {
    if (total <= 1) return '';
    let html = '';
    for (let i = 1; i <= total; i++) {
        html += `<button class="cs-page-btn ${i === current ? 'active' : ''}" onclick="${fnName}(${i})">${i}</button>`;
    }
    return html;
}
function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
// Simula una acción asíncrona (sin backend): muestra spinner en el botón, luego ejecuta el callback.
function runWithLoading(btn, delayMs, callback) {
    if (btn) {
        btn.classList.add('is-loading');
        btn.disabled = true;
    }
    setTimeout(() => {
        if (btn) {
            btn.classList.remove('is-loading');
            btn.disabled = false;
        }
        callback();
    }, delayMs || 650);
}
function flashHighlight(el) {
    if (!el) return;
    el.classList.remove('cs-flash-highlight');
    void el.offsetWidth; // reinicia la animación
    el.classList.add('cs-flash-highlight');
}
let toastTimer = null;
function flashToast(msg) {
    let toast = document.getElementById('cs-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cs-toast';
        toast.className = 'cs-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

// ==========================================
// --- INICIALIZACIÓN ---
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    updateSlideDisplay();
    renderClientes();
    renderConductores();
    renderPorFacturar();
    renderReportesCartera();
    renderInventarioCava();
    renderSalidasCava();
    renderChats();
    renderDestinos();
    renderUsuarios();
    moveViewSelectorPill();
});
