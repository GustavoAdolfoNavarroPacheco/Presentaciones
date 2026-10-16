# Presentaciones - Campuslands (Full Service)

##  Fin del Repositorio (Carpeta `/presentaciones`)
Esta carpeta (que funciona como un repositorio individual en GitHub) almacena todas las presentaciones comerciales y de ventas para **Campuslands** (bajo los servicios "Full Service"). 

Cada presentación se diseña de manera artesanal y a medida utilizando **HTML y CSS puro**. El objetivo principal es generar presentaciones 100% estáticas, portables y con control absoluto sobre el diseño, evadiendo las limitaciones de herramientas tradicionales y dependencias pesadas.

##  Contenido y Estructura
Cada presentación es una carpeta propia que se despliega como sitio estático. Las fuentes y las imágenes que son idénticas entre presentaciones viven una sola vez en `assets/` de la raíz (ver [Recursos compartidos](#recursos-compartidos-assets)).

```text
/presentaciones/
├── assets/
│   ├── fonts/              # Tipografías compartidas (22 archivos .ttf)
│   ├── shared/             # Imágenes idénticas usadas en más de una presentación
│   ├── logos/              # Logos de clientes usados por el portal
│   ├── portal/             # Portal de presentaciones (decks.js, portal.js)
│   └── favicon.png, logo-campuslands*.png   # Favicon y logos de Campuslands
├── _temas-demo/            # Catálogo visual de temas y paletas base por cliente
├── <slug-cliente-1>/       # Carpeta de la presentación del cliente 1
│   ├── index.html          # Código fuente y estructura de las láminas
│   ├── styles.css          # Estilos, sistema de diseño y paleta del cliente
│   └── assets/             # Recursos propios de esta presentación (no repetidos)
└── <slug-cliente-n>/       # Carpeta de la presentación del cliente n
```

- **Paletas y Diseño Único:** Ninguna presentación es genérica. Todas adaptan su tema visual al branding específico del cliente, utilizando fondos limpios, gradientes corporativos y tipografías compartidas en `assets/fonts/`.
- **Recursos compartidos:** Si un recurso ya existe en `assets/`, la presentación lo referencia desde ahí y no crea una copia dentro de su carpeta.

### Recursos compartidos (`assets/`)

- **Fuentes (`assets/fonts/`):** 22 archivos `.ttf`. Hay dos versiones de `PlayfairDisplay-BlackItalic`: `PlayfairDisplay-BlackItalic.ttf` (la usa la mayoría de presentaciones) y `PlayfairDisplay-BlackItalic-alt.ttf` (la usan `colbeef-flujo-ia` y `colbeef-plan-trabajo`). Se conservan ambas a propósito: no las unifiques sin revisar el render de esas dos presentaciones.
- **Imágenes (`assets/shared/`):** archivos idénticos que antes estaban repetidos en varias presentaciones. Se nombran `<presentación>-<nombre original>` (por ejemplo `giron-logo-cliente.png`) para saber de dónde vienen. Si un logo o favicon ya existe en `assets/`, esa es la ruta a usar.
- **Cómo se referencian:** la ruta es relativa al archivo que la usa. Desde `<slug>/index.html` o `<slug>/styles.css` es `../assets/fonts/...`. Desde `<slug>/docs/` (demos de Multinal y Colbeef) es `../../assets/...`.

  ```css
  @font-face { font-family:'Poppins'; src:url('../assets/fonts/Poppins-Regular.ttf') format('truetype'); font-weight:400; font-style:normal; }
  ```

- **Por qué:** el espacio que usa el proyecto en Vercel depende del peso de cada despliegue. Un archivo repetido en cada presentación se contaba en cada despliegue. Ahora se guarda una sola vez, y el árbol desplegable pesa más de la mitad menos que antes.
- **Nueva presentación:** no copies `assets/fonts/` a la carpeta nueva; referencia la de la raíz. Si una imagen ya existe en `assets/` o `assets/shared/`, reutilízala. Solo lo propio de la presentación va en su `assets/`.
- **Copiar una presentación fuera del repositorio:** ya no es autocontenida. Copia también las fuentes y las imágenes de `assets/` que use (búscalas en su `index.html` y `styles.css`).

##  Cómo Funciona: Instalación y Flujo de Trabajo

### Instalación (Repo General y Carpeta de Presentaciones)
La naturaleza del stack tecnológico (HTML/CSS estático sin frameworks) hace que el proceso de "instalación" sea directo y libre de fricciones:

1. **Clonar el repositorio general:**
   ```bash
   git clone https://github.com/GustavoAdolfoNavarroPacheco/FullService-Agents
   cd FullService-Agents
   ```
2. **Acceder al entorno de presentaciones:**
   ```bash
   cd PresentationsDesigner
   ```
3. **Clonar el repositorio general:**
   ```bash
   git clone https://github.com/GustavoAdolfoNavarroPacheco/presentaciones
   ```
4. **Cero Dependencias:** 
   No es necesario correr comandos como `npm install`. Puedes iniciar de inmediato a trabajar en el código.

### Previsualización y Desarrollo
Para ver los cambios mientras editas o desarrollas una nueva lámina, simplemente:
- Arrastra el archivo `index.html` de cualquier carpeta de cliente a un navegador web como Google Chrome.
- **(Recomendado):** Utiliza una herramienta de servidor local (como *Live Server* en VSCode) para que el navegador se actualice automáticamente con cada cambio guardado.

### Despliegue y Exportación Final
Toda presentación se entrega bajo **dos modalidades obligatorias, ninguna opcional ni reemplaza a la otra**:

1. **Despliegue Web en Vercel:** Las presentaciones se suben a **Vercel** como sitio estático. El link se comparte en el chat al terminar de crear o modificar cualquier presentación (ver regla obligatoria de `CLAUDE.md`).
   - *URL de ejemplo:* `https://fullservicepresentations.vercel.app/<slug-cliente>/index.html`
2. **Exportación a PDF (Entrega Final al Cliente):** Una vez aprobado el HTML, se exporta a PDF (Chrome headless) para asegurar que el archivo final quede idéntico al renderizado web, y sea portable y fácil de enviar e imprimir. Es el archivo que efectivamente recibe el cliente.
