/**
 * ARCHIVO: assets/js/animations.js
 * QUÉ HACE: Concentra toda la interactividad "de presentación" del sitio
 * que no es el menú (eso vive en menu.js):
 *   1. Revelado de secciones al hacer scroll (IntersectionObserver) con
 *      efecto escalonado (stagger) entre hijos de un mismo contenedor.
 *   2. Contadores animados (Nosotros) que cuentan desde 0 hasta su valor
 *      real cuando entran en pantalla.
 *   3. Filtro de la galería de proyectos por sector.
 *   3-B. Acordeón de preguntas frecuentes (página faqs/).
 *   3-C. Formulario de cotización/contacto: valida los campos con la API
 *        nativa de formularios, valida tipo/peso de los archivos adjuntos
 *        en el propio navegador y muestra un mensaje de confirmación. El
 *        envío usa fetch() contra COTIZACION_ENDPOINT (constante al
 *        inicio de esta sección); mientras esté vacía el envío queda
 *        simulado. El backend real (backend/api/cotizacion.php) ya existe
 *        en el repositorio — falta desplegarlo en un hosting con PHP
 *        (Netlify no ejecuta PHP) y completar esta constante con su URL,
 *        ver backend/README.md.
 *   3-D. Libro de Reclamaciones (reclamaciones/index.html): misma lógica
 *        que 3-C pero contra RECLAMACION_ENDPOINT y sin archivos
 *        adjuntos; backend real en backend/api/reclamaciones.php.
 *   4. Manejo de error de recursos multimedia: si una imagen o el video
 *      del hero no cargan, se aplica un fallback visual en vez de romper
 *      el layout, con aviso claro en consola para depurar.
 *
 * DÓNDE SE COLOCA: se enlaza al final del <body>, después de includes.js
 * y menu.js.
 * CÓMO SE RELACIONA: usa los atributos data-reveal, data-counter y
 * data-filter definidos en el HTML de cada página, y las clases
 * .is-visible / .is-active declaradas en assets/css/styles.css.
 */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     1. REVELADO AL HACER SCROLL
  --------------------------------------------------------------------- */
  function inicializarRevelado() {
    var elementos = document.querySelectorAll('[data-reveal]');
    if (!elementos.length) return;

    if (!('IntersectionObserver' in window)) {
      // Sin soporte: mostrar todo directamente, sin animación.
      elementos.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    // Escalonado: dentro de un mismo contenedor [data-reveal-group], cada
    // elemento hijo recibe un retraso incremental vía variable CSS.
    document.querySelectorAll('[data-reveal-group]').forEach(function (grupo) {
      var hijos = grupo.querySelectorAll('[data-reveal]');
      hijos.forEach(function (hijo, indice) {
        hijo.style.setProperty('--reveal-delay', (indice * 0.12) + 's');
      });
    });

    var observer = new IntersectionObserver(function (entradas, obs) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('is-visible');
          obs.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -60px 0px' });

    elementos.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------------------
     2. CONTADORES ANIMADOS
  --------------------------------------------------------------------- */
  function animarContador(elemento) {
    var destino = parseFloat(elemento.getAttribute('data-counter'));
    var sufijo = elemento.getAttribute('data-counter-suffix') || '';
    var duracion = 1600;
    var inicio = null;

    function paso(timestamp) {
      if (inicio === null) inicio = timestamp;
      var progreso = Math.min((timestamp - inicio) / duracion, 1);
      var valorActual = Math.floor(progreso * destino);
      elemento.textContent = valorActual + sufijo;
      if (progreso < 1) {
        window.requestAnimationFrame(paso);
      } else {
        elemento.textContent = destino + sufijo;
      }
    }
    window.requestAnimationFrame(paso);
  }

  function inicializarContadores() {
    var contadores = document.querySelectorAll('[data-counter]');
    if (!contadores.length) return;

    if (!('IntersectionObserver' in window)) {
      contadores.forEach(animarContador);
      return;
    }

    var observer = new IntersectionObserver(function (entradas, obs) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting && !entrada.target.classList.contains('counted')) {
          entrada.target.classList.add('counted');
          animarContador(entrada.target);
          obs.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.6 });

    contadores.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------------------
     3. FILTRO DE PROYECTOS POR SECTOR
  --------------------------------------------------------------------- */
  function inicializarFiltroProyectos() {
    var barra = document.querySelector('[data-filter-bar]');
    var tarjetas = document.querySelectorAll('[data-sector]');
    if (!barra || !tarjetas.length) return;

    barra.addEventListener('click', function (evento) {
      var boton = evento.target.closest('.filter-btn');
      if (!boton) return;

      var sector = boton.getAttribute('data-filter');

      barra.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.toggle('is-active', b === boton);
      });

      tarjetas.forEach(function (tarjeta) {
        var coincide = sector === 'todos' || tarjeta.getAttribute('data-sector') === sector;
        tarjeta.hidden = !coincide;
      });
    });
  }

  /* ---------------------------------------------------------------------
     3-B. ACORDEÓN DE PREGUNTAS FRECUENTES (página faqs/)
     Cada pregunta es un <button class="faq-question"> dentro de un
     .faq-item; al hacer clic se alterna .is-open y se ajusta la altura
     máxima de .faq-answer al alto real de su contenido (en vez de un
     valor fijo en CSS), para que funcione con respuestas de cualquier
     longitud. Solo una pregunta abierta a la vez (comportamiento típico
     de acordeón), para que la lista no crezca descontroladamente.
  --------------------------------------------------------------------- */
  function inicializarAcordeonFaq() {
    var items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(function (item) {
      var boton = item.querySelector('.faq-question');
      var respuesta = item.querySelector('.faq-answer');
      if (!boton || !respuesta) return;

      boton.addEventListener('click', function () {
        var yaAbierto = item.classList.contains('is-open');

        // Cierra cualquier otra pregunta abierta antes de abrir esta.
        items.forEach(function (otro) {
          if (otro !== item) {
            otro.classList.remove('is-open');
            otro.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            otro.querySelector('.faq-answer').style.maxHeight = '';
          }
        });

        if (yaAbierto) {
          item.classList.remove('is-open');
          boton.setAttribute('aria-expanded', 'false');
          respuesta.style.maxHeight = '';
        } else {
          item.classList.add('is-open');
          boton.setAttribute('aria-expanded', 'true');
          respuesta.style.maxHeight = respuesta.scrollHeight + 'px';
        }
      });
    });
  }

  /* ---------------------------------------------------------------------
     CONFIGURACIÓN DE LOS FORMULARIOS CON BACKEND (constantes fácilmente
     ajustables).
     COTIZACION_ENDPOINT / RECLAMACION_ENDPOINT son las ÚNICAS constantes
     que hay que completar para activar el envío real: mientras estén
     vacías, ambos formularios quedan simulados (ver más abajo). El
     backend PHP que las atiende ya existe en backend/api/*.php — falta
     desplegarlo en un hosting con PHP (Netlify no ejecuta PHP; ver
     backend/README.md) y pegar aquí su URL pública, ej.:
       var COTIZACION_ENDPOINT = 'https://tu-dominio/backend/api/cotizacion.php';
       var RECLAMACION_ENDPOINT = 'https://tu-dominio/backend/api/reclamaciones.php';
  --------------------------------------------------------------------- */
  var COTIZACION_ENDPOINT = '';
  var COTIZACION_MAX_ARCHIVOS = 3;
  var COTIZACION_MAX_PESO_MB = 10;
  var COTIZACION_EXTENSIONES_PERMITIDAS = ['.pdf', '.dxf', '.dwg', '.step', '.stp', '.igs', '.iges'];
  var RECLAMACION_ENDPOINT = '';

  /* ---------------------------------------------------------------------
     3-C. FORMULARIO DE COTIZACIÓN/CONTACTO
     Se dirige específicamente a #form-cotizacion (contacto/index.html) y
     no a cualquier <form>, porque el Libro de Reclamaciones también usa
     un formulario en la misma página del sitio y ese SÍ debe seguir
     completamente deshabilitado (su envío real es tema de Fase 3 aparte,
     no pedido en esta mejora incremental).
     Incluye la validación en el navegador del campo "Adjuntar archivos"
     (tipo y peso, sin subir nada todavía) y el envío del formulario vía
     fetch() contra COTIZACION_ENDPOINT (ver configuración arriba); si
     está vacío, el envío se simula igual que en fases anteriores.
  --------------------------------------------------------------------- */
  function inicializarFormularioContacto() {
    var formulario = document.getElementById('form-cotizacion');
    if (!formulario) return;

    var mensajeExito = formulario.querySelector('.form-success');
    var campoArchivos = formulario.querySelector('#con-archivos');
    var listaArchivos = formulario.querySelector('[data-file-list]');
    var errorArchivos = formulario.querySelector('[data-file-error]');
    var archivosAceptados = [];

    function formatearPeso(bytes) {
      if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
      return Math.max(1, Math.round(bytes / 1024)) + ' KB';
    }

    function obtenerExtension(nombreArchivo) {
      var partes = nombreArchivo.toLowerCase().split('.');
      return partes.length > 1 ? '.' + partes.pop() : '';
    }

    // Reconstruye campoArchivos.files a partir de archivosAceptados, para
    // que el <input type="file"> nativo (y por lo tanto un futuro
    // `new FormData(formulario)` en Fase 3) siempre refleje la lista
    // visual, incluyendo los archivos quitados con el botón "Quitar".
    function sincronizarInputArchivos() {
      var transferencia = new DataTransfer();
      archivosAceptados.forEach(function (archivo) { transferencia.items.add(archivo); });
      campoArchivos.files = transferencia.files;
    }

    function renderizarListaArchivos() {
      listaArchivos.innerHTML = '';
      archivosAceptados.forEach(function (archivo, indice) {
        var item = document.createElement('li');
        item.className = 'form-file-list__item';

        var etiqueta = document.createElement('span');
        etiqueta.textContent = archivo.name + ' (' + formatearPeso(archivo.size) + ')';

        var quitar = document.createElement('button');
        quitar.type = 'button';
        quitar.className = 'form-file-list__remove';
        quitar.textContent = 'Quitar';
        quitar.setAttribute('aria-label', 'Quitar archivo ' + archivo.name);
        quitar.addEventListener('click', function () {
          archivosAceptados.splice(indice, 1);
          sincronizarInputArchivos();
          renderizarListaArchivos();
        });

        item.appendChild(etiqueta);
        item.appendChild(quitar);
        listaArchivos.appendChild(item);
      });
    }

    // Un archivo que no cumple tipo o peso se rechaza puntualmente (mensaje
    // inline junto al campo) sin bloquear el resto del formulario ni
    // afectar los archivos ya aceptados.
    function manejarSeleccionArchivos() {
      var seleccionados = Array.prototype.slice.call(campoArchivos.files);
      var errores = [];

      seleccionados.forEach(function (archivo) {
        if (archivosAceptados.length >= COTIZACION_MAX_ARCHIVOS) {
          errores.push('"' + archivo.name + '" no se agregó: máximo ' + COTIZACION_MAX_ARCHIVOS + ' archivos por envío.');
          return;
        }
        var extension = obtenerExtension(archivo.name);
        if (COTIZACION_EXTENSIONES_PERMITIDAS.indexOf(extension) === -1) {
          errores.push('"' + archivo.name + '" no tiene un formato permitido.');
          return;
        }
        if (archivo.size > COTIZACION_MAX_PESO_MB * 1024 * 1024) {
          errores.push('"' + archivo.name + '" supera el peso máximo de ' + COTIZACION_MAX_PESO_MB + ' MB.');
          return;
        }
        var yaAgregado = archivosAceptados.some(function (aceptado) {
          return aceptado.name === archivo.name && aceptado.size === archivo.size;
        });
        if (yaAgregado) return;
        archivosAceptados.push(archivo);
      });

      errorArchivos.textContent = errores.join(' ');
      sincronizarInputArchivos();
      renderizarListaArchivos();
    }

    if (campoArchivos && listaArchivos && errorArchivos) {
      campoArchivos.addEventListener('change', manejarSeleccionArchivos);
    }

    function limpiarArchivos() {
      archivosAceptados = [];
      if (campoArchivos) sincronizarInputArchivos();
      if (listaArchivos) renderizarListaArchivos();
      if (errorArchivos) errorArchivos.textContent = '';
    }

    function mostrarConfirmacionYLimpiar() {
      if (mensajeExito) {
        mensajeExito.classList.add('is-visible');
        mensajeExito.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      formulario.reset();
      limpiarArchivos();
    }

    formulario.addEventListener('submit', function (evento) {
      evento.preventDefault(); // el envío se controla siempre desde JS, nunca con un action= fijo

      if (!formulario.checkValidity()) {
        // Deja que el navegador muestre sus propios globos de validación
        // (campo requerido vacío, correo con formato inválido, etc.).
        formulario.reportValidity();
        if (mensajeExito) mensajeExito.classList.remove('is-visible');
        return;
      }

      if (!COTIZACION_ENDPOINT) {
        // Fase 1/2: todavía no hay backend configurado — se simula el envío.
        console.info('[animations.js] Envío simulado del formulario de cotización (COTIZACION_ENDPOINT vacío; se completa en Fase 3).');
        mostrarConfirmacionYLimpiar();
        return;
      }

      // Fase 3: mismo formulario y misma validación — lo único que cambia
      // es COTIZACION_ENDPOINT (primero a un Google Apps Script, luego a
      // un backend PHP + MySQL) y el script del lado del servidor.
      fetch(COTIZACION_ENDPOINT, { method: 'POST', body: new FormData(formulario) })
        .then(function (respuesta) {
          if (!respuesta.ok) throw new Error('Respuesta no OK del servidor: ' + respuesta.status);
          mostrarConfirmacionYLimpiar();
        })
        .catch(function (error) {
          console.error('[animations.js] Error al enviar el formulario de cotización:', error);
          window.alert('No se pudo enviar tu solicitud. Intenta nuevamente o contáctanos por WhatsApp.');
        });
    });
  }

  /* ---------------------------------------------------------------------
     3-D. LIBRO DE RECLAMACIONES (reclamaciones/index.html)
     Misma idea que el formulario de cotización pero más simple: sin
     archivos adjuntos, y "simulado" mientras RECLAMACION_ENDPOINT esté
     vacío (ver configuración arriba).
  --------------------------------------------------------------------- */
  function inicializarFormularioReclamaciones() {
    var formulario = document.getElementById('form-reclamacion');
    if (!formulario) return;

    var mensajeExito = formulario.querySelector('.form-success');

    formulario.addEventListener('submit', function (evento) {
      evento.preventDefault();

      if (!formulario.checkValidity()) {
        formulario.reportValidity();
        if (mensajeExito) mensajeExito.classList.remove('is-visible');
        return;
      }

      function mostrarConfirmacionYLimpiar() {
        if (mensajeExito) {
          mensajeExito.classList.add('is-visible');
          mensajeExito.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        formulario.reset();
      }

      if (!RECLAMACION_ENDPOINT) {
        console.info('[animations.js] Envío simulado del Libro de Reclamaciones (RECLAMACION_ENDPOINT vacío; ver backend/README.md).');
        mostrarConfirmacionYLimpiar();
        return;
      }

      fetch(RECLAMACION_ENDPOINT, { method: 'POST', body: new FormData(formulario) })
        .then(function (respuesta) {
          if (!respuesta.ok) throw new Error('Respuesta no OK del servidor: ' + respuesta.status);
          mostrarConfirmacionYLimpiar();
        })
        .catch(function (error) {
          console.error('[animations.js] Error al enviar el Libro de Reclamaciones:', error);
          window.alert('No se pudo registrar tu reclamo. Intenta nuevamente o contáctanos por WhatsApp.');
        });
    });
  }

  /* ---------------------------------------------------------------------
     4. FALLBACK DE RECURSOS MULTIMEDIA (imágenes y video del hero)
  --------------------------------------------------------------------- */
  function inicializarFallbackMultimedia() {
    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        if (img.classList.contains('js-media-fallback')) return; // evita loop
        console.error('[animations.js] No se pudo cargar la imagen: ' + img.src + '. Se aplica fallback visual.');
        img.classList.add('js-media-fallback');
        img.alt = img.alt ? img.alt + ' (imagen no disponible)' : 'Imagen no disponible';
        img.removeAttribute('src');
      });
    });

    // Video de fondo del hero: si falla (formato no soportado, archivo
    // faltante, etc.), se oculta el <video> y queda visible el <img
    // data-hero-fallback> puesto detrás como respaldo estático.
    var heroVideo = document.querySelector('.hero__media video');
    if (heroVideo) {
      heroVideo.addEventListener('error', function () {
        console.error('[animations.js] El video de fondo del hero falló al cargar. Se muestra la imagen de respaldo.');
        heroVideo.style.display = 'none';
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    inicializarRevelado();
    inicializarContadores();
    inicializarFiltroProyectos();
    inicializarAcordeonFaq();
    inicializarFormularioContacto();
    inicializarFormularioReclamaciones();
    inicializarFallbackMultimedia();
  });

  // Los componentes inyectados por includes.js (ej. tarjetas dentro del
  // footer) no existen en DOMContentLoaded; si alguna vez se agregan
  // elementos con data-reveal dentro de un componente, se re-ejecuta el
  // revelado tras la carga de includes.
  window.addEventListener('includes:loaded', function () {
    inicializarRevelado();
    inicializarFallbackMultimedia();
  });
})();
