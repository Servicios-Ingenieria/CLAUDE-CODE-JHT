/**
 * ARCHIVO: assets/js/includes.js
 * QUÉ HACE: Carga los fragmentos reutilizables (components/header.html,
 * footer.html, whatsapp-button.html, cotizacion-boton.html) dentro de los
 * contenedores <div data-include="..."> que cada página declara, usando
 * fetch(). Así el header/footer/botones existen en un solo archivo fuente
 * y se reutilizan en todas las páginas del sitio (Fase 1: solo maquetado,
 * sin backend).
 *
 * DÓNDE SE COLOCA: se enlaza ANTES que menu.js y animations.js en cada
 * página, porque esos dos scripts operan sobre el header/nav/botón que
 * este archivo inyecta en el DOM.
 *
 * INCLUDES ANIDADOS: un fragmento puede a su vez contener otro
 * data-include (ej. components/header.html incluye adentro a
 * components/cotizacion-boton.html). Por eso la carga se hace en rondas:
 * después de resolver una tanda de contenedores, se vuelve a buscar si
 * aparecieron contenedores nuevos dentro del HTML recién inyectado, hasta
 * que ya no queden pendientes.
 *
 * CÓMO SE RELACIONA: lee la ruta del fragmento desde el atributo
 * data-include del contenedor y se la pasa tal cual a fetch(). Esas rutas
 * son relativas (ej. "components/header.html", sin "/" inicial) y el
 * navegador las resuelve contra la etiqueta <base> del <head> de cada
 * página (ver comentario ahí), así que funcionan igual desde index.html
 * que desde nosotros/index.html, servicios/*.html, etc. Dispara el evento
 * "includes:loaded" en window cuando termina, para que animations.js y
 * menu.js puedan engancharse recién ahí (los elementos inyectados no
 * existen antes de ese evento).
 *
 * NOTA DE DESARROLLO: fetch() de archivos locales requiere servir el sitio
 * con un servidor HTTP (ej. `npx serve`, Live Server, etc.). Abrir los
 * archivos directamente con file:// bloquea la petición por CORS; por eso
 * se controla el error y se muestra un aviso claro en consola en vez de
 * dejar el header/footer vacíos sin explicación.
 */
(function () {
  'use strict';

  var CONTAINERS_SELECTOR = '[data-include]';

  function cargarFragmento(contenedor) {
    var ruta = contenedor.getAttribute('data-include');
    return fetch(ruta)
      .then(function (respuesta) {
        if (!respuesta.ok) {
          throw new Error('HTTP ' + respuesta.status + ' al pedir ' + ruta);
        }
        return respuesta.text();
      })
      .then(function (html) {
        contenedor.innerHTML = html;
        contenedor.setAttribute('data-include-status', 'ok');
      })
      .catch(function (error) {
        // Fallback controlado: no rompemos el layout, solo dejamos el
        // contenedor vacío marcado y avisamos en consola con el motivo
        // más probable (falta servir el sitio por HTTP).
        contenedor.setAttribute('data-include-status', 'error');
        console.error(
          '[includes.js] No se pudo cargar el componente "' + ruta + '". ' +
          'Verifica que el sitio se esté sirviendo por HTTP (no file://) ' +
          'y que la ruta exista. Detalle:', error
        );
      });
  }

  function contenedoresPendientes() {
    return Array.prototype.slice.call(
      document.querySelectorAll(CONTAINERS_SELECTOR + ':not([data-include-status])')
    );
  }

  function cargarRonda() {
    var pendientes = contenedoresPendientes();
    if (pendientes.length === 0) {
      return Promise.resolve();
    }
    return Promise.all(pendientes.map(cargarFragmento)).then(cargarRonda);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (contenedoresPendientes().length === 0) {
      return;
    }

    cargarRonda().then(function () {
      // Año de copyright del footer: un <script> inyectado vía innerHTML
      // no se ejecuta solo, así que este detalle se resuelve aquí en vez
      // de dentro de components/footer.html.
      document.querySelectorAll('[data-year]').forEach(function (el) {
        el.textContent = new Date().getFullYear();
      });
      window.dispatchEvent(new CustomEvent('includes:loaded'));
    });
  });
})();
