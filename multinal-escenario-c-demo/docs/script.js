/* ==========================================
   LÓGICA DE CONTROL - MULTINAL S.A.S. DEMO
   ========================================== */

// --- BASE DE DATOS TEMPORAL (EN MEMORIA) ---
const state = {
    // Configuración general
    currentSlide: 1,
    totalSlides: 26,
    activeView: 'slides', // 'slides' o 'simulator'
    theme: 'dark', // 'dark' o 'light'
    soundEnabled: true,
    autoplayActive: false,
    autoplayTimer: null,

    // Datos del Simulador de Compras
    requisitions: [
        { id: "OC-1001", insumo: "Químicos de Proceso Base", area: "Producción", valor: 12500000, estado: "Aprobado" },
        { id: "OC-1002", insumo: "Cajas de Cartón Multinal", area: "Logística", valor: 3200000, estado: "Aprobado" }
    ],

    // Datos del Simulador WMS Bodega
    warehouseAllocation: {}, // Ubicaciones ocupadas en cuadrícula
    wmsProducts: {
        'alta': { ref: 'REF-ALTA-998', name: 'Químicos Tipo A (Alta)', zone: 'A', rotacion: 'Alta' },
        'media': { ref: 'REF-MEDI-402', name: 'Pinturas Baldes (Media)', zone: 'B', rotacion: 'Media' },
        'baja': { ref: 'REF-BAJA-115', name: 'Empaques Tipo C (Baja)', zone: 'C', rotacion: 'Baja' }
    },

    // Datos del Simulador Comercial
    inventory: {
        'A': { name: 'Químicos Tipo A', stock: 150, unit: 'gls' },
        'B': { name: 'Pinturas Baldes', stock: 80, unit: 'bls' },
        'C': { name: 'Empaques Tipo C', stock: 450, unit: 'uds' }
    },
    cart: {
        'A': 0,
        'B': 0,
        'C': 0
    },
    orders: [],

    // Datos del Simulador de Facturación y Firma
    invoices: [
        { id: "FAC-8501", cliente: "Distribuciones del Valle", total: 1540000, estadoDian: "Pendiente", firmado: "No", xml: "" },
        { id: "FAC-8502", cliente: "Supermercados La Económica", total: 4320000, estadoDian: "Timbrada", firmado: "No", xml: "TIMBRE_XML_SECURE_8502" }
    ],
    selectedInvoiceId: null,

    // Datos del Simulador de IA Logística
    deliveryPoints: [
        { id: 1, name: "Distribuidor Norte", x: 120, y: 80 },
        { id: 2, name: "Planta Sur", x: 280, y: 320 },
        { id: 3, name: "Punto Venta Centro", x: 80, y: 220 },
        { id: 4, name: "Aliado Comercial Este", x: 320, y: 150 },
        { id: 5, name: "Centro de Acopio Oeste", x: 100, y: 280 }
    ],
    routeOptimized: false,

    // Datos del Simulador de IA Cartera
    cartera: [
        { id: 1, cliente: "Distribuciones del Valle", saldo: 4850000, diasVence: 12, riesgo: "Pendiente" },
        { id: 2, cliente: "Supermercados La Económica", saldo: 12300000, diasVence: 2, riesgo: "Pendiente" },
        { id: 3, cliente: "Tiendas Unidas Bogotá", saldo: 1500000, diasVence: -5, riesgo: "Pendiente" },
        { id: 4, cliente: "Suministros del Eje", saldo: 8900000, diasVence: 45, riesgo: "Pendiente" }
    ],

    // --- Datos del Simulador 7: CRM Ampliado (Omnicanal + Fidelización) ---
    conversations: [
        {
            id: 1, canal: 'whatsapp', cliente: "Distribuciones del Valle", unread: 2,
            puntos: 4200, meta: 6000, nivel: 'Plata',
            historial: [
                { from: 'in', texto: '¡Buenas tardes! ¿Tienen disponible Químicos Tipo A para esta semana?', time: '09:12' },
                { from: 'out', texto: 'Buenas tardes, sí tenemos 150 galones disponibles. ¿Desea que le generemos la cotización?', time: '09:15' },
                { from: 'in', texto: 'Sí por favor, y me gustaría saber mi estado de fidelización.', time: '09:16' }
            ]
        },
        {
            id: 2, canal: 'email', cliente: "Supermercados La Económica", unread: 0,
            puntos: 9800, meta: 10000, nivel: 'Oro',
            historial: [
                { from: 'in', texto: 'Adjunto orden de compra mensual, quedamos atentos a la confirmación de despacho.', time: '08:02' },
                { from: 'out', texto: 'Recibido, el despacho queda programado con la transportadora asignada.', time: '08:20' }
            ]
        },
        {
            id: 3, canal: 'chat', cliente: "Tiendas Unidas Bogotá", unread: 1,
            puntos: 1500, meta: 3000, nivel: 'Bronce',
            historial: [
                { from: 'in', texto: 'Hola, quisiera consultar el estado de mi último pedido de empaques.', time: '11:40' }
            ]
        }
    ],
    selectedConversationId: null,

    // --- Datos del Simulador 8: Gobierno de Datos (Diccionario + Linaje) ---
    dataDictionary: [
        { campo: 'cliente_id', dominio: 'Comercial', tipo: 'Identificador único', sistema: 'PRY-ERP · Comercial' },
        { campo: 'referencia_sku', dominio: 'Inventarios', tipo: 'Alfanumérico', sistema: 'PRY-ERP · Inventarios' },
        { campo: 'orden_compra_id', dominio: 'Compras', tipo: 'Identificador único', sistema: 'PRY-ERP · Compras' },
        { campo: 'cufe_factura', dominio: 'Facturación', tipo: 'Hash criptográfico', sistema: 'PRY-ERP · Facturación' },
        { campo: 'ubicacion_logica', dominio: 'Bodega', tipo: 'Código de posición', sistema: 'PRY-WMS · Ubicaciones' },
        { campo: 'saldo_cartera', dominio: 'Cartera', tipo: 'Decimal (COP)', sistema: 'PRY-ERP · Cartera' },
        { campo: 'puntaje_fidelizacion', dominio: 'CRM', tipo: 'Entero', sistema: 'PRY-CRM-EXT' },
        { campo: 'ruta_optimizada_id', dominio: 'Logística', tipo: 'Identificador único', sistema: 'PRY-AIE-01' }
    ],

    // --- Datos del Simulador 9: ERP Inventarios / Kárdex ---
    karex: {
        'REF-A100': { name: 'Químicos Industriales Tipo A', stock: 150, ubicacion: 'A3', rotacion: 'Alta' },
        'REF-B200': { name: 'Pinturas de Recubrimiento', stock: 80, ubicacion: 'B2', rotacion: 'Media' },
        'REF-C300': { name: 'Empaques Industriales Tipo C', stock: 450, ubicacion: 'C5', rotacion: 'Baja' },
        'REF-D400': { name: 'Solventes Especiales', stock: 36, ubicacion: 'A1', rotacion: 'Alta' }
    },

    // --- Datos del Simulador 10: WMS Despachos completo (Kanban) ---
    wmsStages: ['recepcion', 'ubicacion', 'picking', 'packing', 'despacho'],
    wmsStageLabels: { recepcion: 'Recepción', ubicacion: 'Ubicación', picking: 'Picking', packing: 'Packing', despacho: 'Despacho' },
    wmsOrders: [
        { id: 'WMS-501', cliente: 'Distribuciones del Valle', stage: 'recepcion' },
        { id: 'WMS-502', cliente: 'Supermercados La Económica', stage: 'picking' },
        { id: 'WMS-503', cliente: 'Tiendas Unidas Bogotá', stage: 'despacho' }
    ],
    wmsOrderCounter: 503,

    // --- Datos del Simulador 11: Agente IA Comercial (Predicción de Ventas) ---
    pipeline: [
        { oportunidad: 'Renovación contrato anual', cliente: 'Supermercados La Económica', valor: 24000000, prioridad: 'Alta' },
        { oportunidad: 'Ampliación de línea Solventes', cliente: 'Distribuciones del Valle', valor: 9800000, prioridad: 'Media' },
        { oportunidad: 'Nuevo punto de venta', cliente: 'Tiendas Unidas Bogotá', valor: 5200000, prioridad: 'Media' }
    ],

    // --- Datos del Simulador 12: Agente IA Compras (Negociación Asistida) ---
    proveedores: [
        { id: 1, nombre: 'Químicos del Caribe S.A.', precio: 85000, tendencia: 'up', leadTime: '12 días' },
        { id: 2, nombre: 'Envases Plásticos Andina', precio: 4500, tendencia: 'down', leadTime: '7 días' },
        { id: 3, nombre: 'Suministros Industriales Multinal', precio: 120000, tendencia: 'stable', leadTime: '5 días' }
    ],

    // --- Datos del Simulador 13: Agente IA Inventarios (Reposición Autónoma) ---
    stockMinimo: [
        { ref: 'REF-A100', nombre: 'Químicos Industriales Tipo A', stock: 150, minimo: 60 },
        { ref: 'REF-B200', nombre: 'Pinturas de Recubrimiento', stock: 80, minimo: 90 },
        { ref: 'REF-C300', nombre: 'Empaques Industriales Tipo C', stock: 450, minimo: 200 },
        { ref: 'REF-D400', nombre: 'Solventes Especiales', stock: 36, minimo: 50 }
    ],

    // --- Datos del Simulador 14: Agente IA Fidelización ---
    fidelizacionAI: [
        { id: 1, cliente: 'Distribuciones del Valle', frecuencia: 'Cada 18 días', proximaRecompra: '5 días' },
        { id: 2, cliente: 'Supermercados La Económica', frecuencia: 'Cada 30 días', proximaRecompra: '11 días' },
        { id: 3, cliente: 'Tiendas Unidas Bogotá', frecuencia: 'Cada 45 días', proximaRecompra: '22 días' }
    ],

    // --- Datos del Panel de Movimientos (Torre de Control + Boarding Pass) ---
    movements: [
        {
            id: 'MUL-2201', cliente: 'Distribuciones del Valle',
            origen: { code: 'BOD', name: 'Bodega Central' },
            destino: { code: 'ALM', name: 'Almacén Regional' },
            transportista: 'Transportes Multinal', guia: '77A0-E3C8-8219',
            estado: 'en-ruta', progreso: 62, eta: 'Hoy · 18:40',
            ubicacionActual: 'Vía de Distribución, km 62',
            valor: 8900000,
            productos: [
                { nombre: 'Químicos Industriales Tipo A', cantidad: '40 gls' },
                { nombre: 'Empaques Industriales Tipo C', cantidad: '120 uds' }
            ]
        },
        {
            id: 'MUL-2202', cliente: 'Supermercados La Económica',
            origen: { code: 'BOD', name: 'Bodega Central' },
            destino: { code: 'ALM', name: 'Almacén General' },
            transportista: 'Coordinadora Logística', guia: '5F87-B8CD-9A98',
            estado: 'en-bodega', progreso: 15, eta: 'Mañana · 10:00',
            ubicacionActual: 'Bodega Central · Muelle de cargue 3',
            valor: 12400000,
            productos: [
                { nombre: 'Pinturas de Recubrimiento', cantidad: '80 bls' }
            ]
        },
        {
            id: 'MUL-2203', cliente: 'Tiendas Unidas Bogotá',
            origen: { code: 'BOD', name: 'Bodega Central' },
            destino: { code: 'PV', name: 'Punto de Venta' },
            transportista: 'Flota Propia Multinal', guia: '89FC-A67C-1123',
            estado: 'entregado', progreso: 100, eta: 'Entregado 08:55',
            ubicacionActual: 'Punto de Venta Principal',
            valor: 2600000,
            productos: [
                { nombre: 'Empaques Industriales Tipo C', cantidad: '60 uds' }
            ]
        },
        {
            id: 'MUL-2204', cliente: 'Suministros del Eje',
            origen: { code: 'BOD', name: 'Bodega Central' },
            destino: { code: 'REC', name: 'Zona de Recepción' },
            transportista: 'Coordinadora Logística', guia: '3A21-F09D-7742',
            estado: 'en-ruta', progreso: 34, eta: 'Hoy · 21:10',
            ubicacionActual: 'Zona de Tránsito Intermedio',
            valor: 6300000,
            productos: [
                { nombre: 'Solventes Especiales', cantidad: '30 gls' }
            ]
        },
        {
            id: 'MUL-2205', cliente: 'Distribuciones del Valle',
            origen: { code: 'BOD', name: 'Bodega Central' },
            destino: { code: 'ALM', name: 'Almacén Regional' },
            transportista: 'Transportes Multinal', guia: '9C64-D310-B871',
            estado: 'en-bodega', progreso: 5, eta: 'Mañana · 14:30',
            ubicacionActual: 'Bodega Central · En alistamiento (Picking)',
            valor: 4100000,
            productos: [
                { nombre: 'Empaques Industriales Tipo C', cantidad: '90 uds' }
            ]
        },
        {
            id: 'MUL-2206', cliente: 'Supermercados La Económica',
            origen: { code: 'BOD', name: 'Bodega Central' },
            destino: { code: 'ALM', name: 'Almacén General' },
            transportista: 'Flota Propia Multinal', guia: '61EE-4B7A-C902',
            estado: 'entregado', progreso: 100, eta: 'Entregado ayer 16:20',
            ubicacionActual: 'Almacén General',
            valor: 15800000,
            productos: [
                { nombre: 'Químicos Industriales Tipo A', cantidad: '65 gls' },
                { nombre: 'Pinturas de Recubrimiento', cantidad: '40 bls' }
            ]
        },
        {
            id: 'MUL-2207', cliente: 'Tiendas Unidas Bogotá',
            origen: { code: 'BOD', name: 'Bodega Central' },
            destino: { code: 'PV', name: 'Punto de Venta' },
            transportista: 'Flota Propia Multinal', guia: '5D18-9F62-A034',
            estado: 'en-ruta', progreso: 80, eta: 'Hoy · 13:15',
            ubicacionActual: 'Zona de Tránsito a 2.3 km del punto de entrega',
            valor: 1950000,
            productos: [
                { nombre: 'Solventes Especiales', cantidad: '12 gls' }
            ]
        }
    ],
    selectedMovementId: null
};

// ==========================================
// --- EFECTOS DE SONIDO SINTETIZADOS (WEB AUDIO API) ---
// ==========================================
let audioCtx = null;

function playSound(type) {
    if (!state.soundEnabled) return;
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        const now = audioCtx.currentTime;

        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'success') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'scan') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(1800, now + 0.15);
            gain.gain.setValueAtTime(0.03, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'beep') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, now);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        }
    } catch (e) {
        console.warn("Audio Context error: ", e);
    }
}

// ==========================================
// --- CONTROLADOR DE VISTA GENERAL (TABS) ---
// ==========================================
function switchView(view) {
    playSound('click');
    state.activeView = view;

    // Toggle active state in DOM buttons
    document.getElementById('btn-view-slides').classList.toggle('active', view === 'slides');
    document.getElementById('btn-view-simulator').classList.toggle('active', view === 'simulator');
    document.getElementById('btn-view-movimientos').classList.toggle('active', view === 'movimientos');

    // Toggle visible viewport sections
    document.getElementById('slides-viewport').classList.toggle('active', view === 'slides');
    document.getElementById('simulator-viewport').classList.toggle('active', view === 'simulator');
    document.getElementById('movimientos-viewport').classList.toggle('active', view === 'movimientos');

    if (view === 'simulator') {
        initSimulatorLayout();
    } else if (view === 'movimientos') {
        initMovementsPanel();
    }

    moveViewSelectorPill();
}

function moveViewSelectorPill() {
    const activeBtn = document.querySelector('.selector-btn.active');
    const pill = document.getElementById('view-selector-pill');
    if (!activeBtn || !pill) return;
    pill.style.left = `${activeBtn.offsetLeft}px`;
    pill.style.width = `${activeBtn.offsetWidth}px`;
}

window.addEventListener('resize', moveViewSelectorPill);
window.addEventListener('load', moveViewSelectorPill);

function toggleTheme() {
    playSound('click');
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        state.theme = 'light';
        // Cambiar icono a sol
        themeIcon.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        state.theme = 'dark';
        // Cambiar icono a luna
        themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
    }
}

function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    const soundIcon = document.getElementById('sound-icon');
    if (state.soundEnabled) {
        soundIcon.innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>`;
        playSound('click');
    } else {
        soundIcon.innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>`;
    }
}

// ==========================================
// --- CONTROLADOR DE PRESENTACIÓN DE SLIDES ---
// ==========================================
function updateSlideDisplay() {
    const slides = document.querySelectorAll('.slide');
    slides.forEach(slide => {
        slide.classList.remove('active');
        if (parseInt(slide.getAttribute('data-slide')) === state.currentSlide) {
            slide.classList.add('active');
        }
    });

    // Display numbers and progress
    document.getElementById('slide-number-display').innerText = `${state.currentSlide} / ${state.totalSlides}`;
    const progressPercent = (state.currentSlide / state.totalSlides) * 100;
    document.getElementById('slide-progress').style.width = `${progressPercent}%`;
}

function navigateSlide(direction) {
    playSound('click');
    state.currentSlide += direction;
    if (state.currentSlide > state.totalSlides) state.currentSlide = 1;
    if (state.currentSlide < 1) state.currentSlide = state.totalSlides;
    updateSlideDisplay();
}

function jumpToSlide(number) {
    if (state.activeView !== 'slides') {
        switchView('slides');
    }
    state.currentSlide = number;
    updateSlideDisplay();
}

// Autoplay
function toggleAutoplay() {
    playSound('click');
    const apBtn = document.getElementById('btn-autoplay');
    const apIcon = document.getElementById('autoplay-icon');
    
    if (state.autoplayActive) {
        clearInterval(state.autoplayTimer);
        state.autoplayActive = false;
        apBtn.classList.remove('active');
        apIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`; // Play icon
    } else {
        state.autoplayActive = true;
        apBtn.classList.add('active');
        apIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>`; // Pause icon
        state.autoplayTimer = setInterval(() => {
            navigateSlide(1);
        }, 5000); // Avanza cada 5 segundos
    }
}

// Teclado
document.addEventListener('keydown', (e) => {
    if (state.activeView === 'slides') {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            navigateSlide(1);
        } else if (e.key === 'ArrowLeft') {
            navigateSlide(-1);
        }
    }
});

// ==========================================
// --- CONTROLADORES DE SIMULADORES (DEMO) ---
// ==========================================

function initSimulatorLayout() {
    // Render de historial de compras
    renderComprasTable();
    // Render de cuadrícula de bodega
    initWarehouseGrid();
    // Iniciar terminal comercial
    updateClientDiscountInfo();
    syncInventoryDOM();
    // Render de facturas por cobrar
    renderInvoicesTable();
    // Cargar nodos de IA Logística
    renderRoutingNodes();
    // Iniciar tabla de cartera
    renderCarteraTable();
    // Módulos ampliados
    renderInbox();
    renderDataDictionary();
    renderKarexTable();
    renderWmsKanban();
    renderPipelineTable();
    renderProveedoresTable();
    renderStockMinimoTable();
    renderFidelizacionAiTable();
}

function selectSimModule(moduleName) {
    playSound('click');
    const items = document.querySelectorAll('.sim-module-item');
    items.forEach(item => item.classList.remove('active'));
    
    const activeItem = document.querySelector(`.sim-module-item[data-module="${moduleName}"]`);
    if (activeItem) activeItem.classList.add('active');
    
    const panes = document.querySelectorAll('.sim-content-pane');
    panes.forEach(pane => pane.classList.remove('active'));
    
    const activePane = document.getElementById(`sim-${moduleName}`);
    if (activePane) activePane.classList.add('active');
}

// ----------------------------------------
// --- SIMULADOR 1: ERP COMPRAS ---
// ----------------------------------------
function renderComprasTable() {
    const tbody = document.querySelector('#table-compras tbody');
    tbody.innerHTML = '';
    state.requisitions.forEach(req => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${req.id}</td>
            <td>${req.insumo}</td>
            <td>${req.area}</td>
            <td>$${req.valor.toLocaleString('es-CO')}</td>
            <td><span class="badge-status green">${req.estado}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function submitRequisition(event) {
    event.preventDefault();
    playSound('click');
    
    const insumo = document.getElementById('req-insumo').value;
    const proveedor = document.getElementById('req-proveedor').value;
    const valor = parseFloat(document.getElementById('req-valor').value);
    const area = document.getElementById('req-area').value;
    
    const id = `OC-${1000 + state.requisitions.length + 1}`;
    
    // Resetear las luces del flujo
    document.querySelectorAll('.flow-step').forEach(el => el.className = 'flow-step');
    document.querySelectorAll('.flow-line').forEach(el => el.className = 'flow-line');
    
    // Animación de flujo en base al valor
    document.getElementById('step-radicado').classList.add('active');
    document.getElementById('compras-status-alert').innerText = "Procesando flujo de aprobación jerárquica...";
    document.getElementById('compras-status-alert').className = "sim-alert warning";
    
    setTimeout(() => {
        document.getElementById('step-radicado').className = 'flow-step approved';
        
        if (valor > 5000000) {
            document.getElementById('step-gerente').classList.add('active');
            document.getElementById('step-radicado').nextElementSibling.classList.add('active');
            
            setTimeout(() => {
                document.getElementById('step-gerente').className = 'flow-step approved';
                document.getElementById('step-radicado').nextElementSibling.className = 'flow-line approved';
                
                if (valor > 50000000) {
                    document.getElementById('step-junta').classList.add('active');
                    document.getElementById('step-gerente').nextElementSibling.classList.add('active');
                    
                    setTimeout(() => {
                        document.getElementById('step-junta').className = 'flow-step approved';
                        document.getElementById('step-gerente').nextElementSibling.className = 'flow-line approved';
                        finalizeOrderCreation(id, insumo, area, valor);
                    }, 1500);
                } else {
                    finalizeOrderCreation(id, insumo, area, valor);
                }
            }, 1500);
        } else {
            finalizeOrderCreation(id, insumo, area, valor);
        }
    }, 1000);
}

function finalizeOrderCreation(id, insumo, area, valor) {
    playSound('success');
    state.requisitions.unshift({ id, insumo, area, valor, estado: "Aprobado" });
    renderComprasTable();
    
    document.getElementById('compras-status-alert').innerText = `¡Solicitud ${id} aprobada automáticamente por el motor jerárquico!`;
    document.getElementById('compras-status-alert').className = "sim-alert success";
    document.getElementById('form-requisition').reset();
}

// ----------------------------------------
// --- SIMULADOR 2: WMS BODEGA & UBICACIÓN ---
// ----------------------------------------
function initWarehouseGrid() {
    const grid = document.getElementById('warehouse-grid-container');
    grid.innerHTML = '';
    // Generar cuadrícula 6x6
    for (let r = 1; r <= 6; r++) {
        for (let c = 1; c <= 6; c++) {
            const cell = document.createElement('div');
            const posCode = `${String.fromCharCode(64 + r)}${c}`;
            cell.className = 'grid-cell';
            cell.id = `cell-${posCode}`;
            cell.innerText = posCode;
            
            // Asignar zonas por rotación
            if (r <= 2) {
                cell.classList.add('high-zone'); // Fila A, B: Alta Rotación
            } else if (r <= 4) {
                cell.classList.add('med-zone');  // Fila C, D: Media Rotación
            } else {
                cell.classList.add('low-zone');  // Fila E, F: Baja Rotación
            }
            
            // Si estaba ocupado, marcar
            if (state.warehouseAllocation[posCode]) {
                cell.classList.add('allocated');
                if (r <= 2) cell.classList.add('high-zone');
                else if (r <= 4) cell.classList.add('med-zone');
                else cell.classList.add('low-zone');
            }

            grid.appendChild(cell);
        }
    }
}

function simulateScan(rotationLevel) {
    playSound('scan');
    const prod = state.wmsProducts[rotationLevel];
    
    document.getElementById('scanned-code').innerText = prod.ref;
    
    const matchSpan = document.getElementById('wms-oc-match');
    matchSpan.innerText = "Verificando OC...";
    matchSpan.className = "badge-status yellow";
    
    setTimeout(() => {
        playSound('success');
        matchSpan.innerText = "COTEJO EXITOSO";
        matchSpan.className = "badge-status green";
        
        document.getElementById('wms-rot-level').innerText = `${prod.rotacion} Rotación`;
        
        // Encontrar celda vacía para esa zona
        const suggested = findEmptySlot(prod.zone);
        if (suggested) {
            document.getElementById('wms-suggested-loc').innerText = suggested;
            
            // Asignar en Grid
            state.warehouseAllocation[suggested] = prod.name;
            const targetCell = document.getElementById(`cell-${suggested}`);
            if (targetCell) {
                targetCell.classList.add('allocated');
            }
        } else {
            document.getElementById('wms-suggested-loc').innerText = "Zona llena, reubicando...";
            playSound('beep');
        }
    }, 1200);
}

function findEmptySlot(zone) {
    const letters = (zone === 'A') ? [1, 2] : (zone === 'B') ? [3, 4] : [5, 6];
    for (let r of letters) {
        for (let c = 1; c <= 6; c++) {
            const code = `${String.fromCharCode(64 + r)}${c}`;
            if (!state.warehouseAllocation[code]) {
                return code;
            }
        }
    }
    return null;
}

// ----------------------------------------
// --- SIMULADOR 3: ERP COMERCIAL ---
// ----------------------------------------
function updateClientDiscountInfo() {
    const select = document.getElementById('m-select-client');
    const discount = select.options[select.selectedIndex].getAttribute('data-discount');
    document.getElementById('m-client-discount-label').innerText = `${discount}%`;
    calculateCartTotals();
}

function syncInventoryDOM() {
    document.getElementById('stock-prod-a').innerText = state.inventory['A'].stock;
    document.getElementById('stock-prod-b').innerText = state.inventory['B'].stock;
    document.getElementById('stock-prod-c').innerText = state.inventory['C'].stock;

    document.getElementById('inv-cell-a').innerText = `${state.inventory['A'].stock} gls`;
    document.getElementById('inv-cell-b').innerText = `${state.inventory['B'].stock} bls`;
    document.getElementById('inv-cell-c').innerText = `${state.inventory['C'].stock} uds`;
}

function goToMobileStep(step) {
    playSound('click');
    document.querySelectorAll('.mobile-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`m-step-${step}`).classList.add('active');
}

function addToMobileCart(prodId, price) {
    if (state.inventory[prodId].stock > 0) {
        playSound('click');
        state.cart[prodId]++;
        state.inventory[prodId].stock--;
        syncInventoryDOM();
        
        let totalCount = Object.values(state.cart).reduce((a, b) => a + b, 0);
        document.getElementById('m-cart-count').innerText = totalCount;
        
        calculateCartTotals();
    } else {
        playSound('beep');
        alert(`Sin stock de ${state.inventory[prodId].name}`);
    }
}

function calculateCartTotals() {
    let subtotal = 0;
    const prices = { 'A': 85000, 'B': 120000, 'C': 4500 };
    for (let key in state.cart) {
        subtotal += state.cart[key] * prices[key];
    }
    
    const select = document.getElementById('m-select-client');
    const discountPct = parseFloat(select.options[select.selectedIndex].getAttribute('data-discount')) / 100;
    
    let discountVal = subtotal * discountPct;
    let total = subtotal - discountVal;
    
    document.getElementById('m-subtotal').innerText = `$${subtotal.toLocaleString('es-CO')}`;
    document.getElementById('m-discount').innerText = `-$${discountVal.toLocaleString('es-CO')}`;
    document.getElementById('m-total').innerText = `$${total.toLocaleString('es-CO')}`;
    
    return total;
}

function submitMobileOrder() {
    let totalCount = Object.values(state.cart).reduce((a, b) => a + b, 0);
    if (totalCount === 0) {
        playSound('beep');
        alert("Agregue productos al carrito primero");
        return;
    }
    
    playSound('success');
    const client = document.getElementById('m-select-client').value;
    const total = calculateCartTotals();
    const orderId = `FAC-${8500 + state.invoices.length + 1}`;
    
    // Crear logs de auditoría en bodega
    const logBox = document.getElementById('comercial-audit-logs');
    logBox.innerHTML += `<div class="log-line system">Pedido recibido de ${client}. Reservando stock...</div>`;
    
    setTimeout(() => {
        logBox.innerHTML += `<div class="log-line success">Existencias reservadas en tiempo real.</div>`;
        logBox.innerHTML += `<div class="log-line success">Envío a despacho autorizado. Generando borrador factura.</div>`;
        logBox.scrollTop = logBox.scrollHeight;
        
        // Agregar a la tabla de facturación para el módulo siguiente
        state.invoices.push({
            id: orderId,
            cliente: client,
            total: total,
            estadoDian: "Pendiente",
            firmado: "No",
            xml: ""
        });
        
        renderInvoicesTable();
        
        // Resetear carrito
        state.cart = { 'A': 0, 'B': 0, 'C': 0 };
        document.getElementById('m-cart-count').innerText = 0;
        goToMobileStep('client');
    }, 1500);
}

// ----------------------------------------
// --- SIMULADOR 4: FACTURACIÓN Y FIRMA ---
// ----------------------------------------
function renderInvoicesTable() {
    const tbody = document.querySelector('#table-invoices tbody');
    tbody.innerHTML = '';
    state.invoices.forEach(inv => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.onclick = () => selectInvoice(inv.id);
        
        const stateClass = inv.estadoDian === 'Timbrada' ? 'green' : 'yellow';
        const signatureClass = inv.firmado === 'Sí' ? 'green' : 'red';
        
        tr.innerHTML = `
            <td><strong>${inv.id}</strong></td>
            <td>${inv.cliente}</td>
            <td>$${inv.total.toLocaleString('es-CO')}</td>
            <td><span class="badge-status ${stateClass}">${inv.estadoDian}</span></td>
            <td><span class="badge-status ${signatureClass}">${inv.firmado}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function generateMockInvoice() {
    playSound('click');
    const clients = ["Distribuciones del Valle", "Supermercados La Económica", "Tiendas Unidas Bogotá"];
    const randClient = clients[Math.floor(Math.random() * clients.length)];
    const randTotal = Math.floor(Math.random() * 5000000) + 500000;
    const orderId = `FAC-${8500 + state.invoices.length + 1}`;
    
    state.invoices.push({
        id: orderId,
        cliente: randClient,
        total: randTotal,
        estadoDian: "Pendiente",
        firmado: "No",
        xml: ""
    });
    
    renderInvoicesTable();
}

function selectInvoice(id) {
    playSound('click');
    state.selectedInvoiceId = id;
    const inv = state.invoices.find(i => i.id === id);
    
    const detailsDiv = document.getElementById('invoice-details-content');
    detailsDiv.innerHTML = `
        <div style="background:rgba(20,25,35,0.035); padding:15px; border-radius:6px; margin-bottom:15px; border:1px solid var(--border-color);">
            <p><strong>Factura:</strong> ${inv.id}</p>
            <p><strong>Cliente:</strong> ${inv.cliente}</p>
            <p><strong>Valor Neto:</strong> $${inv.total.toLocaleString('es-CO')} COP</p>
            <p><strong>Estado DIAN:</strong> ${inv.estadoDian}</p>
        </div>
        ${inv.estadoDian === 'Pendiente' ? 
            `<button class="action-btn" onclick="timbrarDian('${inv.id}')">Enviar y Timbrar DIAN (Nativo)</button>` : 
            `<p class="neutral-info">Documento timbrado correctamente. Proporcione la firma de entrega.</p>`
        }
    `;
    
    const consoleDiv = document.getElementById('dian-xml-console');
    if (inv.estadoDian === 'Timbrada') {
        consoleDiv.innerText = `[SUCCESS] XML DIAN GENERATED AND REGISTERED:\n<xml>\n <InvoiceID>${inv.id}</InvoiceID>\n <Customer>${inv.cliente}</Customer>\n <Total>${inv.total}</Total>\n <CUFE>5f87b8cd9a987ef...89fca67c</CUFE>\n</xml>`;
        document.getElementById('sign-pad-group').style.display = inv.firmado === 'No' ? 'block' : 'none';
    } else {
        consoleDiv.innerText = "XML STATUS: Esperando transmisión...";
        document.getElementById('sign-pad-group').style.display = 'none';
    }
}

function timbrarDian(id) {
    playSound('click');
    const inv = state.invoices.find(i => i.id === id);
    const consoleDiv = document.getElementById('dian-xml-console');
    
    let counter = 0;
    const textLog = [
        "Connecting to DIAN staging endpoints...",
        "Generating XML template for invoice...",
        "Encrypting security tokens and values...",
        "Validating document structural rules (DIAN Annex 1.8)...",
        "XML Document Approved by DIAN API Server.",
        `CUFE generated: 77a0e3c882199bcf8923a1a...`
    ];
    
    const interval = setInterval(() => {
        if (counter < textLog.length) {
            consoleDiv.innerText = textLog.slice(0, counter + 1).join("\n");
            consoleDiv.scrollTop = consoleDiv.scrollHeight;
            counter++;
        } else {
            clearInterval(interval);
            playSound('success');
            inv.estadoDian = "Timbrada";
            inv.xml = `TIMBRE_XML_${inv.id}`;
            renderInvoicesTable();
            selectInvoice(id); // Recargar panel
        }
    }, 450);
}

// Lógica de Canvas para firma
const canvas = document.getElementById('sig-canvas');
let drawing = false;
let mousePos = { x: 0, y: 0 };
let lastPos = mousePos;

if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = "#ff6b00";
    ctx.lineWidth = 2.5;

    canvas.addEventListener("mousedown", function (e) {
        drawing = true;
        lastPos = getMousePos(canvas, e);
    });

    canvas.addEventListener("mouseup", function (e) {
        drawing = false;
    });

    canvas.addEventListener("mousemove", function (e) {
        mousePos = getMousePos(canvas, e);
        if (drawing) {
            ctx.beginPath();
            ctx.moveTo(lastPos.x, lastPos.y);
            ctx.lineTo(mousePos.x, mousePos.y);
            ctx.stroke();
            lastPos = mousePos;
        }
    });

    // Touch events for mobile support
    canvas.addEventListener("touchstart", function (e) {
        drawing = true;
        lastPos = getTouchPos(canvas, e);
    });
    canvas.addEventListener("touchend", function (e) {
        drawing = false;
    });
    canvas.addEventListener("touchmove", function (e) {
        if (drawing) {
            let touchPos = getTouchPos(canvas, e);
            ctx.beginPath();
            ctx.moveTo(lastPos.x, lastPos.y);
            ctx.lineTo(touchPos.x, touchPos.y);
            ctx.stroke();
            lastPos = touchPos;
        }
    });
}

function getMousePos(canvasDom, mouseEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
        x: mouseEvent.clientX - rect.left,
        y: mouseEvent.clientY - rect.top
    };
}

function getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
        x: touchEvent.touches[0].clientX - rect.left,
        y: touchEvent.touches[0].clientY - rect.top
    };
}

function clearSignatureCanvas() {
    playSound('click');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function saveSignatureAndComplete() {
    if (!state.selectedInvoiceId) return;
    playSound('success');
    
    const inv = state.invoices.find(i => i.id === state.selectedInvoiceId);
    inv.firmado = "Sí";
    
    renderInvoicesTable();
    clearSignatureCanvas();
    document.getElementById('sign-pad-group').style.display = 'none';
    
    // Hash Alert
    const consoleDiv = document.getElementById('dian-xml-console');
    consoleDiv.innerHTML += `\n\n[SUCCESS] DIGITAL SIGNATURE ATTACHED!\nHash SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\nRemisión indexada con sellado criptográfico legal.`;
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

// ----------------------------------------
// --- SIMULADOR 5: IA LOGÍSTICA ---
// ----------------------------------------
function renderRoutingNodes() {
    const nodesG = document.getElementById('map-delivery-nodes');
    nodesG.innerHTML = '';
    
    state.deliveryPoints.forEach(node => {
        // Círculos
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", node.x);
        circle.setAttribute("cy", node.y);
        circle.setAttribute("r", "6");
        circle.setAttribute("fill", "var(--secondary-color)");
        
        // Texto descriptivo
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", node.x);
        text.setAttribute("y", node.y - 10);
        text.setAttribute("fill", "var(--text-muted)");
        text.setAttribute("font-size", "9");
        text.setAttribute("text-anchor", "middle");
        text.textContent = node.name;
        
        nodesG.appendChild(circle);
        nodesG.appendChild(text);
    });
}

function optimizeRouting() {
    playSound('click');
    const logBox = document.getElementById('routing-audit-logs');
    logBox.innerHTML = `<div class="log-line system">Iniciando enrutamiento inteligente (Agente Logístico IA)...</div>`;
    
    // Animación de cálculo
    setTimeout(() => {
        logBox.innerHTML += `<div class="log-line system">Evaluando matriz de distancias (TSP)...</div>`;
        
        setTimeout(() => {
            playSound('success');
            // Trazar línea de ruta
            const path = document.getElementById('route-path');
            
            // Bodega central: (200, 200)
            const optimalSequence = [
                { x: 200, y: 200 },
                { x: 120, y: 80 },  // Norte
                { x: 320, y: 150 }, // Este
                { x: 280, y: 320 }, // Sur
                { x: 100, y: 280 }, // Oeste
                { x: 80, y: 220 },  // Centro
                { x: 200, y: 200 }  // Regreso
            ];
            
            let dAttr = `M ${optimalSequence[0].x} ${optimalSequence[0].y}`;
            for (let i = 1; i < optimalSequence.length; i++) {
                dAttr += ` L ${optimalSequence[i].x} ${optimalSequence[i].y}`;
            }
            
            path.setAttribute("d", dAttr);
            path.style.strokeDashoffset = '0'; // Activar animación del trazado
            
            logBox.innerHTML += `<div class="log-line success">¡Ruta óptima calculada exitosamente!</div>`;
            logBox.scrollTop = logBox.scrollHeight;
            
            // Actualizar métricas
            document.getElementById('km-original').innerText = "142 km";
            document.getElementById('km-optimizado').innerText = "79 km";
            
            const badge = document.getElementById('fuel-saving');
            badge.innerText = "44.3% Ahorro Combustible";
            badge.style.display = "inline-block";
            
        }, 1200);
    }, 1000);
}

// ----------------------------------------
// --- SIMULADOR 6: IA CARTERA ---
// ----------------------------------------
function renderCarteraTable() {
    const tbody = document.querySelector('#table-cartera-risk tbody');
    tbody.innerHTML = '';
    state.cartera.forEach(client => {
        const tr = document.createElement('tr');
        
        let riskClass = 'yellow';
        if (client.riesgo === 'Riesgo Alto') riskClass = 'red';
        else if (client.riesgo === 'Riesgo Bajo') riskClass = 'green';
        
        tr.innerHTML = `
            <td>${client.cliente}</td>
            <td>$${client.saldo.toLocaleString('es-CO')}</td>
            <td>${client.diasVence} días</td>
            <td><span class="badge-status ${riskClass}">${client.riesgo}</span></td>
            <td>
                <button class="action-btn-small secondary" onclick="manageClientRisk(${client.id})">Gestionar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function runRiskAnalysis() {
    playSound('click');
    
    state.cartera.forEach(c => {
        if (c.diasVence < 0) {
            c.riesgo = "Riesgo Alto";
        } else if (c.diasVence <= 5) {
            c.riesgo = "Riesgo Medio";
        } else {
            c.riesgo = "Riesgo Bajo";
        }
    });
    
    setTimeout(() => {
        playSound('success');
        renderCarteraTable();
    }, 1000);
}

function manageClientRisk(clientId) {
    playSound('click');
    const client = state.cartera.find(c => c.id === clientId);
    
    const detailsDiv = document.getElementById('risk-analysis-detail');
    detailsDiv.innerHTML = `
        <div style="background:rgba(20,25,35,0.035); padding:15px; border-radius:6px; border:1px solid var(--border-color);">
            <h5>Análisis del Cliente: ${client.cliente}</h5>
            <p><strong>Saldo Vencido/Por Vencer:</strong> $${client.saldo.toLocaleString('es-CO')} COP</p>
            <p><strong>Días Expiración:</strong> ${client.diasVence} días</p>
            <p><strong>Calificación IA:</strong> ${client.riesgo}</p>
        </div>
    `;
    
    // Generar email redactado en base al riesgo
    const emailBodyText = getRiskEmailBody(client.cliente, client.saldo, client.diasVence, client.riesgo);
    const emailTextarea = document.getElementById('risk-email-body');
    emailTextarea.value = emailBodyText;
    document.getElementById('risk-email-editor').style.display = 'block';
    autoResizeTextarea(emailTextarea);
}

function autoResizeTextarea(el) {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + 2}px`;
}

function getRiskEmailBody(cliente, saldo, dias, riesgo) {
    if (riesgo === 'Riesgo Alto') {
        return `Asunto: NOTIFICACIÓN DE SALDO VENCIDO - MULTINAL S.A.S.\n\nEstimado cliente del equipo de Cartera Multinal,\n\nLe escribimos para recordarle que su cuenta presenta un saldo vencido de $${saldo.toLocaleString('es-CO')} COP hace ${Math.abs(dias)} días. Agradecemos realizar el pago a la brevedad para evitar suspensiones de cupo.\n\nAtentamente,\nAgente Inteligente de Cartera.`;
    } else if (riesgo === 'Riesgo Medio') {
        return `Asunto: Recordatorio Preventivo de Vencimiento de Factura - MULTINAL S.A.S.\n\nEstimado cliente,\n\nLe informamos de manera preventiva que su saldo de $${saldo.toLocaleString('es-CO')} COP vencerá en ${dias} días. Agradecemos programar su transferencia.\n\nAtentamente,\nAgente Inteligente de Cartera.`;
    } else {
        return `Asunto: Estado de Cuenta al Día - MULTINAL S.A.S.\n\nEstimado cliente,\n\nSu cuenta se encuentra en un estado óptimo y sin alarmas de mora preventiva. Gracias por ser un excelente aliado comercial.\n\nAtentamente,\nAgente de Cartera Multinal.`;
    }
}

function sendCollectionEmail() {
    playSound('success');
    alert("Notificación de cobro enviada exitosamente por el Agente de IA.");
    document.getElementById('risk-email-editor').style.display = 'none';
    document.getElementById('risk-analysis-detail').innerHTML = `<p class="neutral-info">Gestión enviada. Seleccione otro cliente.</p>`;
}

// ----------------------------------------
// --- SIMULADOR 7: CRM AMPLIADO (OMNICANAL + FIDELIZACIÓN) ---
// ----------------------------------------
const channelMeta = {
    whatsapp: { label: 'WhatsApp', icon: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' },
    email: { label: 'Correo', icon: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>' },
    chat: { label: 'Chat Web', icon: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' }
};

function renderInbox() {
    const list = document.getElementById('inbox-list');
    if (!list) return;
    list.innerHTML = '';
    state.conversations.forEach(conv => {
        const div = document.createElement('div');
        div.className = 'inbox-item' + (state.selectedConversationId === conv.id ? ' active' : '');
        const lastMsg = conv.historial[conv.historial.length - 1];
        const meta = channelMeta[conv.canal] || channelMeta.chat;
        div.onclick = () => selectConversation(conv.id);
        div.innerHTML = `
            <span class="inbox-channel-icon" title="${meta.label}">${meta.icon}</span>
            <div class="inbox-meta">
                <span class="i-name">${conv.cliente} <span class="i-channel-tag">${meta.label}</span></span>
                <span class="i-preview">${lastMsg ? lastMsg.texto : ''}</span>
            </div>
            ${conv.unread > 0 ? `<span class="inbox-unread">${conv.unread}</span>` : ''}
        `;
        list.appendChild(div);
    });
}

function selectConversation(id) {
    playSound('click');
    state.selectedConversationId = id;
    const conv = state.conversations.find(c => c.id === id);
    conv.unread = 0;
    renderInbox();

    const thread = document.getElementById('chat-thread');
    thread.innerHTML = conv.historial.map(m => `
        <div class="chat-bubble ${m.from}">${m.texto}<span class="b-time">${m.time}</span></div>
    `).join('');
    thread.scrollTop = thread.scrollHeight;

    const pct = Math.min(100, Math.round((conv.puntos / conv.meta) * 100));
    const tierClass = conv.nivel.toLowerCase() === 'oro' ? 'oro' : (conv.nivel.toLowerCase() === 'plata' ? 'plata' : 'bronce');
    document.getElementById('loyalty-box').innerHTML = `
        <h5>Motor de Fidelización · CRM-EXT</h5>
        <div class="loyalty-tier-row">
            <span class="loyalty-tier-badge ${tierClass}">NIVEL ${conv.nivel.toUpperCase()}</span>
            <span class="neutral-info">${conv.puntos.toLocaleString('es-CO')} / ${conv.meta.toLocaleString('es-CO')} pts</span>
        </div>
        <div class="loyalty-progress-bg"><div class="loyalty-progress-fill" style="width:${pct}%;"></div></div>
        <p class="neutral-info">Volumen transaccional acumulado según el ERP propio. Faltan ${(conv.meta - conv.puntos).toLocaleString('es-CO')} pts para el siguiente nivel.</p>
    `;
}

function sendCrmReply(event) {
    event.preventDefault();
    if (!state.selectedConversationId) {
        playSound('beep');
        alert('Seleccione una conversación de la bandeja primero.');
        return;
    }
    const input = document.getElementById('chat-reply-input');
    const texto = input.value.trim();
    if (!texto) return;

    playSound('click');
    const conv = state.conversations.find(c => c.id === state.selectedConversationId);
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    conv.historial.push({ from: 'out', texto, time });
    input.value = '';
    selectConversation(conv.id);
}

// ----------------------------------------
// --- SIMULADOR 8: GOBIERNO DE DATOS (DICCIONARIO + LINAJE) ---
// ----------------------------------------
function renderDataDictionary(filterText) {
    const tbody = document.querySelector('#table-data-dictionary tbody');
    if (!tbody) return;
    const term = (filterText || '').toLowerCase();
    tbody.innerHTML = '';
    state.dataDictionary
        .filter(row => !term || row.campo.toLowerCase().includes(term) || row.dominio.toLowerCase().includes(term) || row.sistema.toLowerCase().includes(term))
        .forEach(row => {
            const tr = document.createElement('tr');
            tr.onclick = () => traceLineage(row);
            tr.innerHTML = `<td><code>${row.campo}</code></td><td>${row.dominio}</td><td>${row.tipo}</td><td>${row.sistema}</td>`;
            tbody.appendChild(tr);
        });
}

function filterDataDictionary() {
    renderDataDictionary(document.getElementById('dict-search').value);
}

function traceLineage(row) {
    playSound('click');
    const nodes = document.querySelectorAll('#lineage-flow .lineage-node');
    nodes.forEach(n => n.classList.remove('lit'));
    const log = document.getElementById('lineage-log');
    log.innerHTML = `<div class="log-line system">Trazando linaje de "${row.campo}" (${row.dominio})...</div>`;

    const stages = ['origen', 'dat', 'ia', 'bi'];
    stages.forEach((stage, i) => {
        setTimeout(() => {
            const node = document.querySelector(`#lineage-flow .lineage-node[data-stage="${stage}"]`);
            if (node) node.classList.add('lit');
            const stageLabel = { origen: row.sistema, dat: 'Diccionario y reglas de validación de PRY-DAT', ia: 'Consumido por el Ecosistema de Agentes de IA', bi: 'Disponible en dashboards de Business Intelligence' }[stage];
            log.innerHTML += `<div class="log-line success">[${i + 1}/4] ${stageLabel}</div>`;
            log.scrollTop = log.scrollHeight;
            if (i === stages.length - 1) playSound('success');
        }, (i + 1) * 500);
    });
}

// ----------------------------------------
// --- SIMULADOR 9: ERP INVENTARIOS / KÁRDEX ---
// ----------------------------------------
function renderKarexTable() {
    const tbody = document.querySelector('#table-karex tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const select = document.getElementById('karex-ref');
    if (select) select.innerHTML = '';

    Object.entries(state.karex).forEach(([ref, item]) => {
        const tr = document.createElement('tr');
        const rotClass = item.rotacion === 'Alta' ? 'green' : (item.rotacion === 'Media' ? 'yellow' : 'red');
        tr.innerHTML = `<td><strong>${ref}</strong><br><span class="neutral-info">${item.name}</span></td><td>${item.stock}</td><td>${item.ubicacion}</td><td><span class="badge-status ${rotClass}">${item.rotacion}</span></td>`;
        tbody.appendChild(tr);

        if (select) {
            const opt = document.createElement('option');
            opt.value = ref;
            opt.innerText = `${ref} · ${item.name}`;
            select.appendChild(opt);
        }
    });
}

function submitKarexMovement(event) {
    event.preventDefault();
    playSound('click');
    const ref = document.getElementById('karex-ref').value;
    const tipo = document.getElementById('karex-tipo').value;
    const cantidad = parseInt(document.getElementById('karex-cantidad').value, 10);
    const item = state.karex[ref];
    const log = document.getElementById('karex-log');
    const alertBox = document.getElementById('karex-alert');

    if (tipo === 'salida' && cantidad > item.stock) {
        playSound('beep');
        alertBox.className = 'sim-alert warning';
        alertBox.innerText = `Existencias insuficientes de ${ref}. Disponible: ${item.stock}.`;
        return;
    }

    item.stock += (tipo === 'entrada' ? cantidad : -cantidad);
    renderKarexTable();
    document.getElementById('karex-ref').value = ref;

    playSound('success');
    alertBox.className = 'sim-alert success';
    alertBox.innerText = `Kárdex actualizado: ${tipo === 'entrada' ? '+' : '-'}${cantidad} uds en ${ref}.`;
    log.innerHTML += `<div class="log-line ${tipo === 'entrada' ? 'success' : 'warning'}">${tipo.toUpperCase()} de ${cantidad} uds · ${ref} · Nuevo saldo: ${item.stock}</div>`;
    log.scrollTop = log.scrollHeight;
    event.target.reset();
    document.getElementById('karex-ref').value = ref;
}

// ----------------------------------------
// --- SIMULADOR 10: WMS DESPACHOS COMPLETO (KANBAN) ---
// ----------------------------------------
function renderWmsKanban() {
    const board = document.getElementById('wms-kanban');
    if (!board) return;
    board.innerHTML = '';

    state.wmsStages.forEach(stage => {
        const col = document.createElement('div');
        col.className = 'wms-kanban-col';
        const ordersInStage = state.wmsOrders.filter(o => o.stage === stage);
        col.innerHTML = `<h5>${state.wmsStageLabels[stage]} (${ordersInStage.length})</h5>`;

        ordersInStage.forEach(order => {
            const card = document.createElement('div');
            card.className = 'wms-order-card';
            const isLast = stage === state.wmsStages[state.wmsStages.length - 1];
            card.innerHTML = `
                <strong>${order.id}</strong>
                <span class="neutral-info">${order.cliente}</span>
                ${isLast ? '' : `<button onclick="advanceWmsOrder('${order.id}')">Avanzar Etapa →</button>`}
            `;
            col.appendChild(card);
        });
        board.appendChild(col);
    });
}

function advanceWmsOrder(id) {
    playSound('click');
    const order = state.wmsOrders.find(o => o.id === id);
    const idx = state.wmsStages.indexOf(order.stage);
    const log = document.getElementById('wmsflow-log');

    if (idx < state.wmsStages.length - 1) {
        order.stage = state.wmsStages[idx + 1];
        renderWmsKanban();
        playSound('success');
        log.innerHTML += `<div class="log-line success">${order.id} (${order.cliente}) avanzó a etapa: ${state.wmsStageLabels[order.stage]}.</div>`;
        log.scrollTop = log.scrollHeight;
    }
}

function createWmsOrder() {
    playSound('click');
    const clients = ["Distribuciones del Valle", "Supermercados La Económica", "Tiendas Unidas Bogotá", "Suministros del Eje"];
    state.wmsOrderCounter++;
    const newOrder = { id: `WMS-${state.wmsOrderCounter}`, cliente: clients[Math.floor(Math.random() * clients.length)], stage: 'recepcion' };
    state.wmsOrders.push(newOrder);
    renderWmsKanban();

    const log = document.getElementById('wmsflow-log');
    log.innerHTML += `<div class="log-line system">Nueva orden ${newOrder.id} ingresada en Recepción para ${newOrder.cliente}.</div>`;
    log.scrollTop = log.scrollHeight;
}

// ----------------------------------------
// --- SIMULADOR 11: AGENTE IA COMERCIAL (PREDICCIÓN DE VENTAS) ---
// ----------------------------------------
function renderPipelineTable() {
    const tbody = document.querySelector('#table-pipeline tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    state.pipeline.forEach(op => {
        const tr = document.createElement('tr');
        const prioClass = op.prioridad === 'Alta' ? 'red' : (op.prioridad === 'Media' ? 'yellow' : 'green');
        tr.innerHTML = `<td>${op.oportunidad}</td><td>${op.cliente}</td><td>$${op.valor.toLocaleString('es-CO')}</td><td><span class="badge-status ${prioClass}">${op.prioridad}</span></td>`;
        tbody.appendChild(tr);
    });
}

function generateSalesForecast() {
    playSound('click');
    const chart = document.getElementById('forecast-chart');
    const months = ['Abr', 'May', 'Jun', 'Jul (P)', 'Ago (P)', 'Sep (P)'];
    const values = [62, 70, 68, 81, 88, 95]; // últimos 3 reales, 3 predichos
    const maxVal = Math.max(...values);

    chart.innerHTML = months.map((m, i) => {
        const isPred = m.includes('P');
        const heightPct = Math.round((values[i] / maxVal) * 100);
        return `
            <div class="forecast-bar-group">
                <div class="forecast-bars">
                    <div class="forecast-bar ${isPred ? 'pred' : 'real'}" style="height:0%;" data-h="${heightPct}"></div>
                </div>
                <span>${m}</span>
            </div>
        `;
    }).join('');

    setTimeout(() => {
        document.querySelectorAll('#forecast-chart .forecast-bar').forEach(bar => {
            bar.style.height = `${bar.getAttribute('data-h')}%`;
        });
        playSound('success');
    }, 100);

    const log = document.getElementById('pipeline-log');
    log.innerHTML = `<div class="log-line system">Modelo predictivo PRY-AIE-02 ejecutado sobre histórico transaccional...</div>
        <div class="log-line success">Proyección de crecimiento del 17.3% para el próximo trimestre.</div>
        <div class="log-line success">Pipeline priorizado según probabilidad de cierre y valor esperado.</div>`;
}

// ----------------------------------------
// --- SIMULADOR 12: AGENTE IA COMPRAS (NEGOCIACIÓN ASISTIDA) ---
// ----------------------------------------
const trendMeta = {
    up: { arrow: '▲', label: 'Al alza', cls: 'trend-up' },
    down: { arrow: '▼', label: 'A la baja', cls: 'trend-down' },
    stable: { arrow: '▬', label: 'Estable', cls: 'trend-stable' }
};

function renderProveedoresTable() {
    const tbody = document.querySelector('#table-proveedores tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    state.proveedores.forEach(p => {
        const t = trendMeta[p.tendencia];
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.nombre}</td>
            <td>$${p.precio.toLocaleString('es-CO')}</td>
            <td><span class="${t.cls}">${t.arrow} ${t.label}</span></td>
            <td>${p.leadTime}</td>
            <td><button class="action-btn-small secondary" onclick="negotiateWithSupplier(${p.id})">Negociar</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function negotiateWithSupplier(id) {
    playSound('click');
    const p = state.proveedores.find(s => s.id === id);
    const t = trendMeta[p.tendencia];
    const detail = document.getElementById('negotiation-detail');

    let suggestion;
    if (p.tendencia === 'up') {
        suggestion = `Precios mundiales del insumo en tendencia alcista. Se recomienda cerrar volumen ahora con un descuento por pronto pago del 3-5% antes del próximo ajuste de precio.`;
    } else if (p.tendencia === 'down') {
        suggestion = `Tendencia a la baja detectada en el portal B2B. Se recomienda posponer la orden 1-2 semanas o negociar un precio fijo indexado a la baja actual.`;
    } else {
        suggestion = `Precio estable. Oportunidad de negociar mejores plazos de pago (30 → 45 días) sin impacto en el costo unitario.`;
    }

    detail.innerHTML = `
        <div style="background:rgba(20,25,35,0.035); padding:15px; border-radius:6px; border:1px solid var(--border-color); margin-bottom:15px;">
            <p><strong>Proveedor:</strong> ${p.nombre}</p>
            <p><strong>Precio de referencia:</strong> $${p.precio.toLocaleString('es-CO')}</p>
            <p><strong>Tendencia mundial:</strong> <span class="${t.cls}">${t.arrow} ${t.label}</span></p>
            <p><strong>Lead Time actual:</strong> ${p.leadTime}</p>
        </div>
        <h5 style="font-size:13px; margin-bottom:8px;">Estrategia sugerida por el Agente IA de Compras</h5>
        <p class="neutral-info">${suggestion}</p>
    `;
    playSound('success');
}

// ----------------------------------------
// --- SIMULADOR 13: AGENTE IA INVENTARIOS (REPOSICIÓN AUTÓNOMA) ---
// ----------------------------------------
function renderStockMinimoTable() {
    const tbody = document.querySelector('#table-stock-minimo tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    state.stockMinimo.forEach(item => {
        const bajoMinimo = item.stock < item.minimo;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.ref}<br><span class="neutral-info">${item.nombre}</span></td>
            <td>${item.stock}</td>
            <td>${item.minimo}</td>
            <td><span class="badge-status ${bajoMinimo ? 'red' : 'green'}">${bajoMinimo ? 'Bajo Mínimo' : 'Normal'}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function runAutoReplenishment() {
    playSound('click');
    const log = document.getElementById('replenish-log');
    log.innerHTML = `<div class="log-line system">Cruzando existencias del WMS con lead times de proveedores...</div>`;

    const bajoMinimo = state.stockMinimo.filter(i => i.stock < i.minimo);

    setTimeout(() => {
        if (bajoMinimo.length === 0) {
            log.innerHTML += `<div class="log-line success">Todas las referencias están sobre su stock mínimo. Sin acción requerida.</div>`;
            playSound('success');
            return;
        }

        bajoMinimo.forEach(item => {
            const faltante = item.minimo - item.stock;
            const id = `OC-${1000 + state.requisitions.length + 1}`;
            state.requisitions.unshift({
                id, insumo: item.nombre, area: 'Reposición Automática IA', valor: faltante * 15000, estado: 'Aprobado'
            });
            log.innerHTML += `<div class="log-line warning">${item.ref} bajo el mínimo (${item.stock}/${item.minimo}). Solicitud ${id} emitida autónomamente por ${faltante} uds.</div>`;
        });
        renderComprasTable();
        log.scrollTop = log.scrollHeight;
        playSound('success');
    }, 1000);
}

// ----------------------------------------
// --- SIMULADOR 14: AGENTE IA FIDELIZACIÓN ---
// ----------------------------------------
function renderFidelizacionAiTable() {
    const tbody = document.querySelector('#table-fidelizacion-ia tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    state.fidelizacionAI.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.cliente}</td>
            <td>${c.frecuencia}</td>
            <td><span class="badge-status yellow">${c.proximaRecompra}</span></td>
            <td><button class="action-btn-small secondary" onclick="designLoyaltyProgram(${c.id})">Diseñar Programa</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function designLoyaltyProgram(id) {
    playSound('click');
    const c = state.fidelizacionAI.find(x => x.id === id);
    const detail = document.getElementById('fidelizacion-detail');

    detail.innerHTML = `
        <div style="background:rgba(20,25,35,0.035); padding:15px; border-radius:6px; border:1px solid var(--border-color); margin-bottom:15px;">
            <p><strong>Cliente:</strong> ${c.cliente}</p>
            <p><strong>Patrón de recompra:</strong> ${c.frecuencia}</p>
            <p><strong>Próxima ventana de recompra:</strong> ${c.proximaRecompra}</p>
        </div>
        <h5 style="font-size:13px; margin-bottom:8px;">Programa Personalizado Generado por IA</h5>
        <p class="neutral-info">Se activa un beneficio de recompra anticipada (5% adicional) disponible durante la ventana de ${c.proximaRecompra}, notificado automáticamente por el canal preferido del cliente en el CRM Ampliado.</p>
    `;
    playSound('success');
}

// ----------------------------------------
// --- PANEL DE MOVIMIENTOS: TORRE DE CONTROL + BOARDING PASS ---
// ----------------------------------------
const movementStatusLabel = { 'en-bodega': 'EN BODEGA', 'en-ruta': 'EN RUTA', 'entregado': 'ENTREGADO' };
let movFilter = 'todos';

function initMovementsPanel() {
    if (!state.selectedMovementId && state.movements.length > 0) {
        state.selectedMovementId = state.movements[0].id;
    }
    renderMovKpis();
    renderMovFilterBar();
    renderMovementsTable();
    if (state.selectedMovementId) {
        renderBoardingPass(state.selectedMovementId);
    }
}

function renderMovKpis() {
    const row = document.getElementById('mov-kpi-row');
    if (!row) return;
    const total = state.movements.length;
    const enBodega = state.movements.filter(m => m.estado === 'en-bodega').length;
    const enRuta = state.movements.filter(m => m.estado === 'en-ruta').length;
    const entregados = state.movements.filter(m => m.estado === 'entregado').length;
    const valorEnTransito = state.movements.filter(m => m.estado !== 'entregado').reduce((sum, m) => sum + m.valor, 0);

    row.innerHTML = `
        <div class="mov-kpi-card">
            <span class="kpi-label">Total Movimientos</span>
            <span class="kpi-value">${total}</span>
            <span class="kpi-sub">Órdenes activas en el sistema</span>
        </div>
        <div class="mov-kpi-card">
            <span class="kpi-label">En Bodega</span>
            <span class="kpi-value">${enBodega}</span>
            <span class="kpi-sub">En alistamiento / por despachar</span>
        </div>
        <div class="mov-kpi-card">
            <span class="kpi-label">En Ruta</span>
            <span class="kpi-value">${enRuta}</span>
            <span class="kpi-sub">Con transportista asignado</span>
        </div>
        <div class="mov-kpi-card">
            <span class="kpi-label">Entregados Hoy</span>
            <span class="kpi-value">${entregados}</span>
            <span class="kpi-sub">Confirmados en destino</span>
        </div>
        <div class="mov-kpi-card">
            <span class="kpi-label">Valor en Tránsito</span>
            <span class="kpi-value">$${(valorEnTransito / 1000000).toFixed(1)}M</span>
            <span class="kpi-sub">${valorEnTransito.toLocaleString('es-CO')} COP</span>
        </div>
    `;
}

function renderMovFilterBar() {
    const bar = document.getElementById('mov-filter-bar');
    if (!bar) return;
    const filters = [
        { key: 'todos', label: 'Todos' },
        { key: 'en-bodega', label: 'En Bodega' },
        { key: 'en-ruta', label: 'En Ruta' },
        { key: 'entregado', label: 'Entregados' }
    ];
    bar.innerHTML = filters.map(f => `
        <button class="mov-filter-btn ${movFilter === f.key ? 'active' : ''}" onclick="setMovFilter('${f.key}')">${f.label}</button>
    `).join('');
}

function setMovFilter(key) {
    playSound('click');
    movFilter = key;
    renderMovFilterBar();
    renderMovementsTable();
}

function renderMovementsTable() {
    const tbody = document.getElementById('movements-tbody');
    if (!tbody) return;
    const search = (document.getElementById('mov-search')?.value || '').toLowerCase();

    const rows = state.movements.filter(mv => {
        const matchesFilter = movFilter === 'todos' || mv.estado === movFilter;
        const matchesSearch = !search || mv.cliente.toLowerCase().includes(search) || mv.id.toLowerCase().includes(search) || mv.guia.toLowerCase().includes(search);
        return matchesFilter && matchesSearch;
    });

    tbody.innerHTML = rows.map(mv => `
        <tr class="${state.selectedMovementId === mv.id ? 'selected-row' : ''}" onclick="selectMovement('${mv.id}')">
            <td><strong>${mv.id}</strong></td>
            <td>${mv.cliente}</td>
            <td><span class="badge-status ${mv.estado === 'en-bodega' ? 'yellow' : mv.estado === 'en-ruta' ? 'blue-status' : 'green'}">${movementStatusLabel[mv.estado]}</span></td>
            <td class="mov-loc-cell">
                <span class="loc-main">${mv.ubicacionActual}</span>
                <span class="loc-sub">Guía: ${mv.guia}</span>
            </td>
            <td class="mov-route-cell">${mv.origen.code} <span class="plane-sep">&gt;</span> ${mv.destino.code}</td>
            <td>${mv.transportista}</td>
            <td>$${mv.valor.toLocaleString('es-CO')}</td>
            <td class="mov-progress-cell">
                <div class="mov-mini-progress-bg"><div class="mov-mini-progress-fill" style="width:${mv.progreso}%;"></div></div>
                <span class="neutral-info">${mv.progreso}%</span>
            </td>
            <td>${mv.eta}</td>
            <td><button class="mov-view-btn" onclick="event.stopPropagation(); selectMovement('${mv.id}');">Ver Pase →</button></td>
        </tr>
    `).join('') || `<tr><td colspan="10" class="neutral-info" style="text-align:center; padding:24px;">Sin movimientos que coincidan con el filtro.</td></tr>`;
}

function selectMovement(id) {
    playSound('click');
    state.selectedMovementId = id;
    renderMovementsTable();
    renderBoardingPass(id);
    document.getElementById('mov-detail-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderBoardingPass(id) {
    const mv = state.movements.find(m => m.id === id);
    const container = document.getElementById('mov-detail-section');
    if (!mv || !container) return;

    container.innerHTML = `
        <div class="boarding-pass">
            <div class="bp-main">
                <div class="bp-airline-row">
                    <span class="bp-brand"><span class="b-dot"></span>Multinal Logistics</span>
                    <span class="bp-class-tag">GUÍA · ${mv.guia}</span>
                </div>
                <div class="bp-route-row">
                    <div class="bp-route-city">
                        <span class="city-code">${mv.origen.code}</span>
                        <span class="city-name">${mv.origen.name}</span>
                    </div>
                    <div class="bp-route-path"><span class="bp-plane-icon">✈</span></div>
                    <div class="bp-route-city">
                        <span class="city-code">${mv.destino.code}</span>
                        <span class="city-name">${mv.destino.name}</span>
                    </div>
                </div>
                <div class="bp-fields-grid">
                    <div class="bp-field"><span class="f-label">Pedido</span><span class="f-value">${mv.id}</span></div>
                    <div class="bp-field"><span class="f-label">Cliente</span><span class="f-value">${mv.cliente}</span></div>
                    <div class="bp-field"><span class="f-label">Transportista</span><span class="f-value">${mv.transportista}</span></div>
                    <div class="bp-field"><span class="f-label">ETA</span><span class="f-value">${mv.eta}</span></div>
                    <div class="bp-field" style="grid-column: 1 / -1;"><span class="f-label">Ubicación Actual</span><span class="f-value">${mv.ubicacionActual}</span></div>
                    <div class="bp-field"><span class="f-label">Valor de Carga</span><span class="f-value">$${mv.valor.toLocaleString('es-CO')}</span></div>
                </div>
                <div class="bp-progress-row">
                    <div class="bp-progress-labels"><span>${mv.origen.code}</span><span>${mv.progreso}%</span><span>${mv.destino.code}</span></div>
                    <div class="bp-progress-bg"><div class="bp-progress-fill" style="width:${mv.progreso}%;"></div></div>
                </div>
                <div class="bp-manifest">
                    <h5>Manifiesto de Carga</h5>
                    ${mv.productos.map(p => `<div class="bp-manifest-item"><span>${p.nombre}</span><span>${p.cantidad}</span></div>`).join('')}
                </div>
            </div>
            <div class="bp-stub">
                <div class="bp-stub-top">
                    <span class="city-pair">${mv.origen.code} <span class="sep">&gt;</span> ${mv.destino.code}</span>
                    <span class="neutral-info">${mv.cliente}</span>
                </div>
                <span class="bp-stub-status ${mv.estado}">${movementStatusLabel[mv.estado]}</span>
                <div>
                    <div class="bp-barcode"></div>
                    <span class="bp-barcode-id">${mv.id}-${mv.guia.replace(/-/g, '')}</span>
                </div>
            </div>
        </div>
    `;
}

function simulateMovementTick() {
    playSound('click');
    state.movements.forEach(mv => {
        if (mv.estado === 'en-bodega') {
            mv.progreso = Math.min(100, mv.progreso + Math.floor(Math.random() * 20) + 10);
            if (mv.progreso >= 40) {
                mv.estado = 'en-ruta';
                mv.progreso = 20;
                mv.ubicacionActual = `Saliendo de ${mv.origen.name}`;
                mv.eta = 'Hoy · ' + `${16 + Math.floor(Math.random() * 4)}:${Math.random() > 0.5 ? '15' : '45'}`;
            }
        } else if (mv.estado === 'en-ruta') {
            mv.progreso = Math.min(100, mv.progreso + Math.floor(Math.random() * 15) + 8);
            if (mv.progreso >= 100) {
                mv.estado = 'entregado';
                mv.ubicacionActual = mv.destino.name;
                mv.eta = 'Entregado ahora';
            } else {
                mv.ubicacionActual = `En tránsito hacia ${mv.destino.name} (${mv.progreso}% del trayecto)`;
            }
        }
    });

    renderMovKpis();
    renderMovFilterBar();
    renderMovementsTable();
    if (state.selectedMovementId) {
        renderBoardingPass(state.selectedMovementId);
    }
    playSound('success');
}

// Inicializar diapositivas
updateSlideDisplay();
