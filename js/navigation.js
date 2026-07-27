/*
 * Navegación privada para la presentación.
 * En la vista del cliente se activa con ?demo=1 o con Alt + D.
 */

(function configurarNavegacionDemo() {
  "use strict";

  function iniciar() {
    const selector = document.querySelector("#selector-vistas-demo");
    if (!selector) {
      return;
    }

    const parametros = new URLSearchParams(window.location.search);
    selector.hidden = parametros.get("demo") !== "1";

    document.addEventListener("keydown", (evento) => {
      if (evento.altKey && evento.key.toLowerCase() === "d") {
        evento.preventDefault();
        selector.hidden = !selector.hidden;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar, { once: true });
  } else {
    iniciar();
  }
})();
