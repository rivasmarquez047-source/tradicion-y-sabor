/*
 * Atajo hacia el acceso interno.
 * En la vista del cliente se activa con Alt + D.
 */

(function configurarAccesoInterno() {
  "use strict";

  function iniciar() {
    document.addEventListener("keydown", (evento) => {
      if (evento.altKey && evento.key.toLowerCase() === "d") {
        evento.preventDefault();
        window.location.assign("acceso.html");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar, { once: true });
  } else {
    iniciar();
  }
})();
