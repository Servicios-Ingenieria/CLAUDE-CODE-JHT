/**
 * ARCHIVO: assets/js/animations.js
 * QUÉ HACE: Concentra toda la interactividad "de presentación" del sitio
 * que no es el menú (eso vive en menu.js):
 *   1. Revelado de secciones al hacer scroll (IntersectionObserver) con
 *      efecto escalonado (stagger) entre hijos de un mismo contenedor.
 *   2. Contadores animados (Nosotros) que cuentan desde 0 hasta su valor
 *      real cuando entran en pantalla.
 *   3. Filtro de la galería de proyectos por sector.
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
