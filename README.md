# Presentaciones - Campuslands (Full Service)

##  Fin del Repositorio (Carpeta `/presentaciones`)
Esta carpeta (que funciona como un repositorio individual en GitHub) almacena todas las presentaciones comerciales y de ventas para **Campuslands** (bajo los servicios "Full Service"). 

Cada presentación se diseña de manera artesanal y a medida utilizando **HTML y CSS puro**. El objetivo principal es generar presentaciones 100% estáticas, portables y con control absoluto sobre el diseño, evadiendo las limitaciones de herramientas tradicionales y dependencias pesadas.

##  Contenido y Estructura
El contenido está estructurado de tal manera que cada presentación actúa como un ecosistema **autocontenido y desplegable por sí solo**.

```text
/presentaciones/
├── _temas-demo/            # Catálogo visual de temas y paletas base por cliente
├── <slug-cliente-1>/       # Carpeta autocontenida para el cliente 1
│   ├── index.html          # Código fuente y estructura de las láminas
│   ├── styles.css          # Estilos, sistema de diseño y paleta del cliente
│   └── assets/             # Recursos locales (imágenes, logos, favicon, tipografías)
└── <slug-cliente-n>/       # Carpeta autocontenida para el cliente n
```

- **Paletas y Diseño Único:** Ninguna presentación es genérica. Todas adaptan su tema visual al branding específico del cliente, utilizando fondos limpios, gradientes corporativos y tipografías locales.
- **Independencia:** Cada carpeta tiene sus propios `assets` y hojas de estilo, asegurando que si se traslada o copia una presentación en particular, esta seguirá funcionando sin depender de directorios externos.

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
Las presentaciones están creadas para entregarse bajo dos modalidades principales:

1. **Despliegue Web en la Nube:** Las presentaciones se suben a **Vercel** como un sitio estático para revisiones en línea rápidas.
   - *URL de ejemplo:* `https://fullservice-presentaciones.vercel.app/<slug-cliente>/index.html`
2. **Exportación a PDF (Entrega Final al Cliente):** Este es el formato de entrega preferido. Una vez aprobado el HTML, se utiliza la opción de exportar a PDF (a menudo mediante Chrome headless) para asegurar que el archivo final quede idéntico al renderizado web, y sea portable y fácil de enviar e imprimir.
