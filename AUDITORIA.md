# AUDITORÍA — JHT Ingeniería (Fase 1)

> Fase A del protocolo de auditoría. Análisis realizado sin modificar
> ningún archivo del repositorio. Cada hallazgo cita `archivo:línea` y fue
> verificado leyendo el contenido real (análisis estático con scripts
> propios sobre el repo + recorrido en navegador headless de las 16
> páginas en 5 anchos de viewport, con captura de errores de consola y
> overflow horizontal).

## 1. Resumen ejecutivo

El sitio está en buen estado general: **0 hallazgos P0** (nada roto),
**1 hallazgo P1** (inconsistencia de nombre en la categoría de servicio
"Mantenimiento", repetida en 3 variantes distintas entre página, tarjetas
y formularios) y **4 hallazgos P2** (CSS redundante/no usado y un archivo
huérfano inválido). No hay rutas rotas reales, no hay HTML inválido, no
hay `id` duplicados, no faltan `alt`, no hay clases usadas sin estilo, y
el formulario de cotización (incl. adjuntar archivos) y el resto de la
interactividad se comportan como se documentan. Los 5 problemas más
relevantes:

1. **[P1]** Tres nombres distintos para la categoría "Mantenimiento
   industrial" (`servicios/mantenimiento.html`, `contacto/index.html`).
2. **[P2]** `assets/img/cliente-01.svg`: archivo huérfano (0 referencias)
   y con contenido inválido (no es SVG real).
3. **[P2]** `.service-card { position: relative; }` redeclarado sin
   ningún efecto en `assets/css/styles.css:1024`.
4. **[P2]** 4 variables CSS (`--color-blue-800`, `--color-graphite-500`,
   `--fs-small`, `--shadow-soft`) y 4 clases (`.card`, `.grid--3`,
   `.grid--4`, `.visually-hidden`) definidas y nunca usadas.
5. **[P2]** Comentario de cabecera de `contacto/index.html` desactualizado
   respecto al formulario real (no menciona adjuntar archivos ni
   `COTIZACION_ENDPOINT`).

Ningún hallazgo requiere reestructurar páginas, cambiar diseño, ni tocar
contenido comercial. Todo es corregible sin alterar el resultado visual.

---

## 2. Mapa del repositorio

```
/
├── index.html                          Inicio
├── nosotros/index.html
├── servicios/
│   ├── index.html                      Catálogo
│   ├── estructuras-metalicas.html      Ficha de detalle (×6, mismo patrón)
│   ├── corte-laser.html
│   ├── soldadura.html
│   ├── tanques.html
│   ├── mantenimiento.html
│   └── bombas-valvulas.html
├── proyectos/index.html
├── clientes/index.html
├── valor/index.html
├── faqs/index.html
├── contacto/index.html                 Formulario de cotización
├── reclamaciones/index.html            Formulario deshabilitado (Fase 3)
├── politicas/index.html
├── robots.txt                          Apunta a dominio placeholder
├── sitemap.xml                         16 URLs, dominio placeholder
├── components/
│   ├── header.html                     Fragmento canónico (ver includes.js)
│   ├── footer.html                     Fragmento canónico
│   ├── whatsapp-button.html            Fragmento canónico
│   └── cotizacion-boton.html           Fragmento canónico, anidado en header
└── assets/
    ├── css/styles.css                  1313 líneas, único archivo
    ├── js/
    │   ├── includes.js                 161 líneas — inyección de componentes
    │   ├── menu.js                     105 líneas — nav responsive
    │   └── animations.js               391 líneas — reveal/contadores/filtro/FAQ/formulario
    ├── img/                            23 SVG propios + 1 JPG real (logo cliente)
    ├── video/                          Solo placeholder de texto (video no incluido, documentado)
    └── docs/                           1 PDF placeholder + su LEEME
```

**Conteo por tipo:** 20 HTML · 23 SVG · 3 JS · 3 TXT (placeholders
documentados) · 1 CSS · 1 XML (sitemap) · 1 PDF · 1 JPG.

**Dependencias:** las 16 páginas cargan, en este orden, exactamente:
`assets/css/styles.css` → (contenido propio) → 4 `data-include`
(header, footer, whatsapp-button; cotizacion-boton llega anidado dentro
de header) → `includes.js` → `menu.js` → `animations.js`. Orden
verificado idéntico en las 16 páginas (sin excepciones).

**Archivos huérfanos** (no referenciados desde ningún HTML/CSS):
- `assets/img/cliente-01.svg` — ver hallazgo P2 más abajo. Es el único
  huérfano real del repo.

Todo el resto de `assets/img/*` tiene al menos 1 referencia real
(verificado por conteo automatizado, `logo.svg` y `favicon.svg` tienen
múltiples por aparecer en `components/header.html` + `components/footer.html`
y en cada `<head>` respectivamente).

**Tamaños de recursos binarios** (de mayor a menor):

| Archivo | Tamaño |
|---|---|
| `assets/img/Applus-norcontrol.jpg` | 184 KB |
| resto de SVG (22 archivos) | 78 B – 1.4 KB c/u |
| `assets/docs/brochure-corporativo-jht.pdf` | 968 B (placeholder de 1 página) |

No hay recursos pesados que optimizar en Fase 1 — el único archivo
"real" (no placeholder) es el logo JPG de un cliente, de 184 KB, un peso
razonable para una imagen que ya se sirve con `loading="lazy"`.

---

## 3. Tabla resumen de hallazgos

| ID | Severidad | Área | Archivo | Título |
|---|---|---|---|---|
| H1 | P1 | Contenido/Nomenclatura | `servicios/mantenimiento.html`, `contacto/index.html` | 3 nombres distintos para "Mantenimiento industrial" |
| H2 | P2 | CSS | `assets/css/styles.css:1024` | `.service-card { position: relative; }` redundante |
| H3 | P2 | CSS | `assets/css/styles.css` (`:root`) | 4 variables CSS sin uso |
| H4 | P2 | CSS | `assets/css/styles.css` | 4 clases CSS sin uso (`.card`, `.grid--3`, `.grid--4`, `.visually-hidden`) |
| H5 | P2 | Archivos | `assets/img/cliente-01.svg` | Huérfano + contenido SVG inválido |
| H6 | P2 | Documentación | `contacto/index.html:1-12` | Comentario de cabecera desactualizado |
| O1 | P3 | SEO | `index.html` | Meta description de 166 caracteres (excede ~160) |
| O2 | P3 | SEO | `reclamaciones/index.html` | Meta description muy corta (42 caracteres) |
| O3 | P3 | Recursos | `assets/video/` | Video del hero no incluido (placeholder documentado, fallback probado) |
| O4 | P3 | Recursos | `assets/docs/brochure-corporativo-jht.pdf` | PDF placeholder ya marcado como pendiente |

**P0: 0 · P1: 1 · P2: 4 · P3: 4**

---

## 4. Hallazgos P0 — Crítico

Ninguno. Verificado explícitamente:
- Las 16 páginas tienen `<!DOCTYPE html>`, `lang="es"`, `charset="UTF-8"`
  y `viewport` exactamente una vez cada uno.
- Balance de etiquetas correcto en las 16 páginas + 4 componentes
  (validado con un parser HTML, sin cierres inesperados ni etiquetas sin
  cerrar).
- 0 rutas rotas reales: se resolvió cada `href`/`src` relativo de cada
  archivo contra el disco. Las únicas "rutas rotas" que detecta un
  resolutor ingenuo son los `href`/`src` canónicos dentro de
  `components/*.html` (ej. `href="nosotros/"` escrito como si el
  fragmento viviera en la raíz) — **no son errores**: es el diseño
  documentado del propio `includes.js`, que reescribe esas rutas en
  tiempo de ejecución según la profundidad real de la página que incluye
  el fragmento. Se verificó que el array `CARPETAS_RAIZ` en
  `assets/js/includes.js:68` cubre exactamente las 10 carpetas de primer
  nivel que aparecen en `header.html`, `footer.html` y
  `cotizacion-boton.html` (`assets`, `components`, `nosotros`,
  `servicios`, `proyectos`, `clientes`, `valor`, `faqs`, `politicas`,
  `reclamaciones`, `contacto`) — ninguna carpeta canónica queda fuera de
  esa lista.
- 0 `id` duplicados dentro de un mismo archivo (16 páginas revisadas).
- 0 imágenes sin `alt`.
- 0 clases usadas en HTML que no tengan ninguna regla en el CSS.
- 0 `<label for="">` sin su `input`/`select`/`textarea` correspondiente,
  y viceversa (16 páginas revisadas).
- Las 16 páginas tienen exactamente un `<h1>`.
- `assets/video/planta-jht-loop.mp4`, referenciado en `index.html:36`, no
  existe en el repo — **pero no es un P0**: es un placeholder
  documentado explícitamente en `assets/video/LEEME-VIDEO-PENDIENTE.txt`,
  con manejo de error ya implementado y probado (`animations.js`, función
  de fallback de multimedia): el `<video>` falla intencionalmente, se
  oculta, y queda visible `assets/img/hero-fallback.svg`. Ver hallazgo
  O3.

## 5. Hallazgos P1 — Importante

### H1 — Tres nombres distintos para la misma categoría de servicio ("Mantenimiento")

**Archivos y evidencia:**
- `servicios/mantenimiento.html:12` — `<title>Mantenimiento Industrial — Servicios — JHT Ingeniería</title>`
- `servicios/mantenimiento.html:28` — `<h1>Mantenimiento de equipos mecánicos</h1>`
- `servicios/mantenimiento.html:35` — `<p class="service-crumbs"><a href="./">Servicios</a> / Mantenimiento industrial</p>`
- `index.html:191` y `servicios/index.html:121` — `<h3>Mantenimiento industrial</h3>` (tarjetas de servicio)
- `reclamaciones/index.html:88` — `<option>Mantenimiento industrial</option>`
- `contacto/index.html:78` — `<option>Mantenimiento de equipos</option>`

**Problema:** dentro del propio `servicios/mantenimiento.html`, el
`<title>` y el breadcrumb dicen "Mantenimiento Industrial" / "Mantenimiento
industrial", pero el `<h1>` visible de la misma página dice
"Mantenimiento de equipos mecánicos" — un texto distinto al de su propio
`<title>`. Además, el dropdown "Tipo de proyecto" del formulario de
cotización (`contacto/index.html:78`) usa una tercera variante,
"Mantenimiento de equipos", que no coincide con ninguna de las dos
anteriores.

**Impacto:** un usuario que llega desde la tarjeta "Mantenimiento
industrial" del Inicio ve un `<h1>` con un nombre distinto en la ficha de
detalle; y al cotizar, el dropdown no ofrece un valor idéntico a ninguno
de los usados en el resto del sitio, lo que puede generar confusión y
resta consistencia de marca. Menor impacto SEO: el `<h1>` no coincide con
el `<title>` de su propia página.

**Propuesta:** unificar a un solo nombre canónico — se recomienda
"Mantenimiento industrial" (es el que ya usan 4 de las 6 apariciones: las
2 tarjetas, el breadcrumb y el dropdown de Reclamaciones) — y aplicarlo en
el `<h1>` de `servicios/mantenimiento.html:28` y en el `<option>` de
`contacto/index.html:78`.

**Riesgo:** Bajo. Es un cambio de texto puro (sin tocar estructura,
estilos ni comportamiento); no rompe nada. Se deja para autorización
porque toca contenido comercial (el nombre visible de un servicio) y la
regla 1 exige no tocar contenido comercial sin autorización explícita,
aun tratándose de un error técnico demostrable de consistencia.

---

## 6. Hallazgos P2 — Menor (deuda técnica sin impacto visible)

### H2 — Regla CSS redundante: `.service-card { position: relative; }`

**Archivo:** `assets/css/styles.css:1024-1026`
```css
/* --- Tarjetas de servicio "v2": numeración + tag técnico + bullets + CTA propio --- */
.service-card {
  position: relative; /* referencia para el numeral en la esquina */
}
```
**Problema:** el bloque original de `.service-card`, unas 470 líneas
antes, ya fija exactamente el mismo valor:
`assets/css/styles.css:548-560`
```css
.service-card {
  background: var(--color-graphite-950);
  ...
  position: relative;
  overflow: hidden;
  ...
}
```
**Impacto:** ninguno visual (incluso quitando el bloque de la línea 1024,
`.service-card` sigue teniendo `position: relative` gracias al bloque de
la línea 548). Es ruido que puede confundir a quien lea el código y
piense que la propiedad no estaba antes.

**Propuesta:** eliminar el bloque `.service-card { position: relative; }`
de la línea 1024 (mover el comentario "referencia para el numeral en la
esquina" como comentario inline junto al `position: relative;` ya
existente en la línea 548, si se quiere conservar esa nota).

**Riesgo:** Bajo. Verificado que no cambia el render: la propiedad queda
definida exactamente igual por el bloque de la línea 548.

### H3 — 4 variables CSS declaradas y nunca usadas

**Archivo:** `assets/css/styles.css`, bloque `:root` (sección 1)

| Variable | ¿Usada en `var(...)`? |
|---|---|
| `--color-blue-800` | No (0 usos) |
| `--color-graphite-500` | No (0 usos) |
| `--fs-small` | No (0 usos) |
| `--shadow-soft` | No (0 usos) |

Verificado sobre las 42 variables custom del `:root`; las 38 restantes sí
se usan.

**Impacto:** ninguno (son solo declaraciones muertas, no afectan el
render). Deuda técnica menor: alguien podría intentar usarlas pensando
que están conectadas a algún estilo.

**Propuesta:** eliminarlas del `:root`, o (si se prefiere conservarlas
como reserva de la paleta/escala para uso futuro en Fase 2) dejarlas con
un comentario explícito de "reservada, sin uso actual" para que quede
claro que es intencional.

**Riesgo:** Bajo — no se usan en ningún selector, eliminarlas no cambia
el render.

### H4 — 4 clases CSS declaradas y nunca usadas en HTML/JS

**Archivo:** `assets/css/styles.css`

| Clase | Sección | ¿Usada en algún `class="..."` o `classList`? |
|---|---|---|
| `.card` | 6. Tarjetas y grids (línea ~536) | No |
| `.grid--3` | 6. Tarjetas y grids | No |
| `.grid--4` | 6. Tarjetas y grids | No |
| `.visually-hidden` | 15. Utilidades | No |

**Nota de verificación:** el sitio sí usa profusamente `.service-card`,
`.project-card`, `.policy-card` (con prefijo), pero ninguna página aplica
la clase base `.card` sola; y `.grid--2`, `.grid--2-lead` sí se usan pero
`.grid--3`/`.grid--4` no aparecen en ningún `class=`.

**Impacto:** ninguno visual. Peso muerto en el CSS (unas 15 líneas en
total entre las 4 clases).

**Propuesta:** eliminarlas si se confirma que no hay planes cercanos de
usarlas (ej. un grid de 3 o 4 columnas genérico), o dejarlas si se prevé
reutilizarlas pronto — es una decisión de producto, no técnica, así que
se deja para tu confirmación en vez de borrarlas de una vez.

**Riesgo:** Bajo.

### H5 — Archivo huérfano y con contenido SVG inválido: `assets/img/cliente-01.svg`

**Archivo:** `assets/img/cliente-01.svg` (78 bytes — el resto de
`cliente-02.svg` a `cliente-06.svg` pesan ~1.3 KB cada uno, es decir,
este archivo es anómalamente pequeño en comparación con sus pares).

**Contenido completo del archivo:**
```
<img src="../assets/img/Applus-norcontrol.jpg"
     alt="Applus+ Norcontrol">
```
**Problema doble:**
1. No es SVG válido — es una etiqueta `<img>` HTML guardada con extensión
   `.svg`. Si algo llegara a referenciarlo como imagen (`<img src="cliente-01.svg">`),
   el navegador no renderizaría nada (un `.svg` debe contener markup
   `<svg>...</svg>`).
2. **0 referencias** a `cliente-01.svg` en todo el repo (HTML ni CSS). Es
   un huérfano.

**Evidencia de origen:** por el propio contenido (apunta a
`Applus-norcontrol.jpg`) y el historial de PRs de este repo (PR #1,
"Corregir logo de Applus... unificar tamaño de logos"), este archivo es
un resto de una migración: en algún momento `clientes/index.html` usó
`cliente-01.svg` como placeholder del primer logo, y luego se reemplazó
por la referencia directa a `Applus-norcontrol.jpg` (que sí funciona,
confirmado en `clientes/index.html:37`). El archivo viejo quedó en el
repo sin limpiarse.

**Impacto:** ninguno en producción (no se carga). Es basura de
repositorio: ocupa espacio, puede confundir a quien navegue `assets/img/`
pensando que está en uso, y si alguna vez se automatiza un chequeo de
"todo archivo en `img/` debe ser SVG válido" (linter, optimizador de
SVGs), este archivo lo haría fallar.

**Propuesta:** **candidato a eliminación** — `assets/img/cliente-01.svg`.
Evidencia de no uso ya detallada arriba (0 referencias, contenido
inválido, origen identificado). Requiere tu autorización explícita antes
de borrarlo (regla 5).

**Riesgo:** Bajo — no se referencia desde ningún lugar; borrarlo no puede
romper el render de ninguna página.

### H6 — Comentario de cabecera de `contacto/index.html` desactualizado

**Archivo:** `contacto/index.html:1-12`
```html
<!--
  ARCHIVO: contacto/index.html
  QUÉ HACE: Página de contacto / solicitud de cotización: formulario con
  validación nativa (HTML5 required + type="email") y una confirmación
  simulada al enviarlo (ver inicializarFormularioContacto() en
  assets/js/animations.js) — sigue sin backend real, eso es Fase 3; mapa
  de Google Maps embebido + enlace "Ver en Google Maps", datos de
  contacto y horario de atención.
  ...
-->
```
**Problema:** este comentario no menciona el campo "Adjuntar archivos"
(validación de tipo/peso, lista con botón "Quitar", límite de 3
archivos/10 MB) ni la constante `COTIZACION_ENDPOINT` / el envío vía
`fetch()` — ambos ya implementados en el propio archivo (líneas
70-90 aprox.) y en `assets/js/animations.js`. El comentario describe una
versión anterior y más simple del formulario.

**Impacto:** ninguno funcional — es documentación interna, no afecta el
render ni el comportamiento. Pero puede desorientar a quien lea el
archivo primero por este comentario antes que por el código.

**Propuesta:** actualizar el bloque de comentario para reflejar el estado
real del formulario (campo de archivos + `fetch()`/`COTIZACION_ENDPOINT`
condicionado a Fase 3), siguiendo el mismo estilo de documentación que ya
usa el resto del repo.

**Riesgo:** Ninguno — es un cambio de comentario puro, no toca código
ejecutable.

---

## 7. Observaciones P3 (no se corrigen — quedan documentadas)

- **O1 — `index.html`**: meta description de 166 caracteres, por encima
  del límite recomendado (~155-160) antes de que buscadores la trunquen.
  Mejorable, no urgente.
- **O2 — `reclamaciones/index.html`**: meta description de solo 42
  caracteres ("Libro de reclamaciones de JHT Ingeniería."). Funcional,
  pero podría describir mejor la página. Es una página de bajo tráfico
  esperado (formulario aún deshabilitado por diseño), prioridad baja.
- **O3 — Video del hero ausente**: `assets/video/planta-jht-loop.mp4`
  (referenciado en `index.html:36`) no existe; solo hay un placeholder de
  texto explicando que debe agregarse antes de producción. **Ya
  documentado y con fallback probado** — no requiere acción de limpieza,
  solo queda pendiente de que la empresa entregue el video real (fuera
  del alcance de esta auditoría técnica).
- **O4 — Brochure PDF placeholder**: `assets/docs/brochure-corporativo-jht.pdf`
  es un PDF de una sola página generado automáticamente, ya marcado como
  placeholder en `assets/docs/LEEME-BROCHURE-PENDIENTE.txt`. Mismo caso
  que O3: pendiente de contenido real de la empresa, no de limpieza de
  código.
- Los 6 `console.log/warn/error` presentes en `assets/js/*.js` son
  diagnósticos intencionales atados a manejo real de errores (fallback
  de imágenes rotas, fallo del video del hero, fallo de `fetch()` de
  componentes, envío simulado del formulario) — no son código de debug
  olvidado. No se tocan.
- `--color-blue-800` / `--color-graphite-500` / `--fs-small` /
  `--shadow-soft` (H3) y `.card` / `.grid--3` / `.grid--4` /
  `.visually-hidden` (H4) podrían, alternativamente a eliminarse,
  quedarse como "reserva de sistema de diseño" para Fase 2 si se prevé
  usarlas pronto — decisión de producto, no técnica (ver preguntas
  abiertas).

---

## 8. Archivos duplicados

Ninguno. No hay dos archivos con contenido idéntico o casi idéntico en
todo el repositorio (verificado por tamaño + inspección; los 6 archivos
`servicios/[categoria].html` comparten el mismo *patrón* de estructura,
pero cada uno tiene contenido propio — no son copias).

## 9. Archivos huérfanos — candidatos a eliminación

| Archivo | Evidencia de no uso |
|---|---|
| `assets/img/cliente-01.svg` | 0 referencias en HTML/CSS del repo (ver H5); contenido además inválido como SVG. |

Es el único huérfano real detectado. El resto de `assets/img/*`,
`assets/docs/*` y `assets/video/*` está referenciado desde al menos un
HTML, o es un placeholder de texto (`LEEME-*.txt`) cuyo propósito es
justamente documentar un recurso pendiente — no son basura, son
marcadores intencionales.

## 10. Código duplicado y código muerto

- **CSS redundante (no duplicado exacto de bloque, pero sí de efecto):**
  ver H2 (`.service-card { position: relative; }`).
- **CSS sin uso:** ver H3 (variables) y H4 (clases).
- **JavaScript:** **no se encontró código muerto real.** Un chequeo
  automatizado inicial marcó `manejarSeleccionArchivos`, `paso`,
  `cargarFragmento` e `inicializarMenu` como "nunca invocadas", pero se
  verificó manualmente que las 4 son falsos positivos: se usan como
  *referencia de función* pasada a `addEventListener`,
  `requestAnimationFrame` o `.map()` (ej.
  `campoArchivos.addEventListener('change', manejarSeleccionArchivos)`
  en `assets/js/animations.js`), un patrón que un grep simple de
  `nombreFuncion(` no detecta porque la función no se invoca con
  paréntesis en el sitio de uso. Las 4 funciones están correctamente
  conectadas.
- **HTML:** no se encontraron bloques de marcado duplicados sin uso
  (`<div>`/`<section>` huérfanos, comentados, etc.) en las 16 páginas.

## 11. Enlaces y rutas rotas

**Cero rutas rotas reales.** Ver detalle de la verificación y de los
falsos positivos (rutas canónicas de `components/*.html`, reescritas en
runtime) en la sección 4 (Hallazgos P0).

## 12. Recursos pesados

Ninguno a optimizar en esta fase. El único archivo de tamaño no trivial
es `assets/img/Applus-norcontrol.jpg` (184 KB, logo real de un cliente),
ya servido con `loading="lazy" decoding="async"` desde `clientes/index.html:37`.
Todo el resto son SVG de 78 B a 1.4 KB.

## 13. Plan de limpieza (para Fase B, tras tu autorización)

Los hallazgos son independientes entre sí — no hay dependencias que
obliguen a un orden estricto. Se agrupan en 3 lotes por tipo de cambio,
del más seguro al que más pide tu confirmación de contenido:

**Lote 1 — CSS muerto/redundante (riesgo bajo, cero impacto visual)**
- H2: eliminar el bloque redundante `.service-card { position: relative; }` (`styles.css:1024-1026`).
- H3: eliminar (o marcar como reserva) las 4 variables CSS sin uso.
- H4: eliminar (o marcar como reserva) las 4 clases CSS sin uso — *sujeto
  a que confirmes que no se planea usarlas pronto*.

**Lote 2 — Documentación (riesgo nulo, no toca código ejecutable)**
- H6: actualizar el comentario de cabecera de `contacto/index.html`.

**Lote 3 — Contenido comercial (requiere tu confirmación explícita antes de tocar, regla 1)**
- H1: unificar el nombre "Mantenimiento industrial" en las 2 ubicaciones
  que difieren (`servicios/mantenimiento.html:28`, `contacto/index.html:78`).

**Fuera del plan de limpieza (no se tocan sin instrucción explícita
adicional):**
- H5 (`cliente-01.svg`): eliminación de archivo — pendiente de tu
  autorización explícita, como pide la regla 5 para cualquier borrado.
- O1/O2 (meta descriptions): mejorables pero fuera de alcance (regla 2:
  "no rediseñes ni mejores nada por tu cuenta" si no es un error
  técnico demostrable).
- O3/O4 (video/PDF placeholder): no son tareas de limpieza de código,
  dependen de que la empresa entregue los archivos reales.

## 14. Preguntas abiertas — necesito tu confirmación antes de tocar nada

1. **Rama de trabajo para la Fase B**: tu plantilla la dejó en blanco
   (`Rama de trabajo: _______`). ¿Confirmas que debo crear una rama nueva
   desde `claude/cotizacion-form-upload-wms7z1` (la rama actual, con el
   trabajo más reciente) o prefieres que parta de otra rama base (por
   ejemplo `claude/new-session-o1d9as`, que es la que hoy alimenta el
   sitio publicado en GitHub Pages)?
2. **H1 (nombre "Mantenimiento industrial")**: ¿confirmas unificar a
   "Mantenimiento industrial" en las 2 ubicaciones que difieren, o
   prefieres otro texto?
3. **H5 (`cliente-01.svg`)**: ¿autorizas eliminarlo del repositorio?
4. **H3/H4 (variables y clases CSS sin uso)**: ¿las elimino, o las dejo
   como reserva documentada para Fase 2 (con un comentario que aclare que
   están ahí a propósito, sin uso actual)?
5. Nada más bloquea el inicio de la Fase B — el resto de hallazgos (H2,
   H6) no tiene ambigüedad ni requiere una decisión de tu parte más allá
   de la autorización general para empezar a corregir.

---

## Nota sobre `assets/css/styles.css`: ¿dividir o mantener como archivo único?

**Se mantiene como archivo único.** Argumentos:

- 1313 líneas es un tamaño manejable, y el archivo ya está organizado en
  16 secciones numeradas con comentarios de bloque a modo de índice
  (Variables, Reset, Botones, Header/Nav, Hero, Tarjetas/Grids,
  Contadores, Galería, Clientes, Formularios, Ficha técnica, Políticas,
  Footer, WhatsApp, Animaciones, Utilidades, Responsive) — la
  navegabilidad ya está resuelta sin necesidad de separar archivos.
- El proyecto **no tiene build step** (sin bundler, sin Sass/PostCSS): si
  se dividiera, cada una de las 16 páginas necesitaría múltiples
  `<link rel="stylesheet">` en el orden correcto a mano, con el riesgo
  real de que alguien agregue una página nueva y se olvide de un
  archivo, o los enlace en un orden que rompa la cascada.
- Todas las páginas comparten prácticamente el mismo CSS completo (header,
  footer, botones, formularios, etc. se repiten en las 16), así que
  dividir por página no reduciría el CSS que cada una carga — solo
  sumaría peticiones HTTP adicionales sin beneficio real de cacheo (el
  navegador ya cachea el único `styles.css` completo tras la primera
  página visitada).
- No se detectaron secciones candidatas naturales a "vivir aparte" (por
  ejemplo, estilos exclusivos de una sola página que no se reutilizan en
  ninguna otra) que justificaran la división.

Se recomienda revisar esta decisión si el proyecto en algún momento suma
un build step (bundler) que resuelva el orden y la carga de múltiples
archivos automáticamente — hoy no es el caso.

---

**Estado:** Fase A completa. Deteniéndome aquí, según el protocolo, a
esperar tu autorización antes de iniciar la Fase B.
