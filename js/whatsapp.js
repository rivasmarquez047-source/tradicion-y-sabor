/*
 * Enlaces de contacto por WhatsApp.
 * Los pedidos se registran desde Mi pedido; WhatsApp queda para consultas.
 */

(function configurarWhatsApp() {
  "use strict";

  function obtenerDestino(elemento) {
    const datos = window.DATOS_SITIO;
    const numero = String(datos?.negocio?.whatsapp || "").replace(/\D/g, "");
    if (!numero) {
      return "";
    }

    let mensaje = datos.negocio.mensajeGeneral;
    if (elemento.dataset.whatsapp === "servicio") {
      const servicio = window.obtenerServicioPorId?.(elemento.dataset.servicioId);
      mensaje = servicio
        ? `Hola, deseo información sobre el servicio: ${servicio.titulo}.`
        : mensaje;
    }

    return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  }

  function aplicarEnlaces() {
    document.querySelectorAll("[data-whatsapp]").forEach((elemento) => {
      const destino = obtenerDestino(elemento);

      if (!destino) {
        elemento.setAttribute("aria-disabled", "true");
        if (elemento.tagName === "A") {
          elemento.removeAttribute("href");
        } else {
          elemento.disabled = true;
        }
        return;
      }

      elemento.removeAttribute("aria-disabled");
      if (elemento.tagName === "A") {
        elemento.href = destino;
        elemento.target = "_blank";
        elemento.rel = "noopener noreferrer";
        return;
      }

      if (elemento.dataset.whatsappConfigurado === "true") {
        return;
      }

      elemento.dataset.whatsappConfigurado = "true";
      elemento.addEventListener("click", () => {
        window.open(destino, "_blank", "noopener,noreferrer");
      });
    });
  }

  document.addEventListener("contenidoDinamicoListo", aplicarEnlaces);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", aplicarEnlaces, { once: true });
  } else {
    aplicarEnlaces();
  }
})();
