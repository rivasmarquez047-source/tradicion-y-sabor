/*
 * Personalización opcional antes de agregar un producto al carrito.
 */

(function configurarPersonalizacion() {
  "use strict";

  function iniciar() {
    const modal = document.querySelector("#modal-personalizacion");
    const contenido = modal?.querySelector(".personalizacion__contenido");
    const formulario = document.querySelector("#formulario-personalizacion");
    const imagen = document.querySelector("#personalizacion-imagen");
    const titulo = document.querySelector("#personalizacion-titulo");
    const precioBase = document.querySelector("#personalizacion-precio-base");
    const mensajeAyuda = document.querySelector("#personalizacion-mensaje");
    const opcionesContenedor = document.querySelector("#personalizacion-opciones");
    const cantidadSalida = document.querySelector("#personalizacion-cantidad");
    const totalSalida = document.querySelector("#personalizacion-total");
    const restar = document.querySelector("#personalizacion-restar");
    const sumar = document.querySelector("#personalizacion-sumar");

    if (
      !modal ||
      !contenido ||
      !formulario ||
      !imagen ||
      !titulo ||
      !precioBase ||
      !mensajeAyuda ||
      !opcionesContenedor ||
      !cantidadSalida ||
      !totalSalida ||
      !restar ||
      !sumar
    ) {
      return;
    }

    let productoActual = null;
    let cantidad = 1;
    let ultimoFoco = null;

    function obtenerPrecioUnitario() {
      const extras = [...opcionesContenedor.querySelectorAll("select")].reduce(
        (total, select) => {
          const opcion = select.options[select.selectedIndex];
          return total + Number(opcion?.dataset.precioAdicional || 0);
        },
        0
      );

      return (productoActual?.precio || 0) + extras;
    }

    function actualizarTotal() {
      cantidadSalida.value = String(cantidad);
      cantidadSalida.textContent = String(cantidad);
      totalSalida.textContent = window.formatearPrecio(obtenerPrecioUnitario() * cantidad);
      restar.disabled = cantidad <= 1;
      sumar.disabled = cantidad >= 20;
    }

    function crearSelector(grupo) {
      const etiqueta = document.createElement("label");
      etiqueta.className = "personalizacion__campo";
      etiqueta.textContent = grupo.etiqueta;

      const select = document.createElement("select");
      select.name = grupo.id;
      select.dataset.etiqueta = grupo.etiquetaResumen || grupo.etiqueta;

      grupo.opciones.forEach((opcion) => {
        const elemento = document.createElement("option");
        elemento.value = opcion.valor;
        elemento.textContent = opcion.texto;
        elemento.dataset.precioAdicional = String(opcion.precioAdicional || 0);
        select.append(elemento);
      });

      etiqueta.append(select);
      return etiqueta;
    }

    function sincronizarPreparacion(selectCambiado) {
      const preparacion = opcionesContenedor.querySelector('select[name="preparacion"]');
      if (!preparacion) {
        return;
      }

      if (selectCambiado === preparacion && preparacion.value === "original") {
        opcionesContenedor.querySelectorAll("select").forEach((select) => {
          if (select !== preparacion) {
            select.value = "original";
          }
        });
        return;
      }

      if (selectCambiado !== preparacion) {
        const hayCambios = [...opcionesContenedor.querySelectorAll("select")].some(
          (select) => select !== preparacion && select.value !== "original"
        );
        preparacion.value = hayCambios ? "personalizada" : "original";
      }
    }

    function abrir(producto, activador) {
      productoActual = producto;
      cantidad = 1;
      ultimoFoco = activador;

      imagen.src = producto.imagen;
      imagen.alt = `Presentación de ${producto.nombre}`;
      titulo.textContent = producto.nombre;
      precioBase.textContent = window.formatearPrecio(producto.precio);
      mensajeAyuda.textContent =
        producto.categoria === "menu"
          ? "Conserva lo incluido, retíralo si no lo deseas o agrega una porción extra."
          : "Elige la cantidad que deseas agregar a tu pedido.";

      const grupos = producto.personalizacion || [];
      if (grupos.length > 0) {
        opcionesContenedor.replaceChildren(...grupos.map(crearSelector));
      } else {
        const mensaje = document.createElement("p");
        mensaje.className = "personalizacion__original";
        mensaje.textContent = "Este producto se agregará con su preparación original.";
        opcionesContenedor.replaceChildren(mensaje);
      }

      actualizarTotal();
      modal.hidden = false;
      document.body.classList.add("modal-abierto");
      requestAnimationFrame(() => {
        modal.classList.add("modal--visible");
        contenido.focus();
      });
    }

    function cerrar() {
      modal.classList.remove("modal--visible");
      document.body.classList.remove("modal-abierto");
      window.setTimeout(() => {
        modal.hidden = true;
        imagen.removeAttribute("src");
        formulario.reset();
        productoActual = null;
        ultimoFoco?.focus();
      }, 180);
    }

    function obtenerCambios() {
      const cambios = [...opcionesContenedor.querySelectorAll("select")]
        .filter((select) => select.value !== "original")
        .map((select) => ({
          id: select.name,
          etiqueta: select.dataset.etiqueta,
          valor: select.value,
          texto: select.options[select.selectedIndex].textContent,
          precioAdicional: Number(
            select.options[select.selectedIndex].dataset.precioAdicional || 0
          )
        }));

      const hayCambioEspecifico = cambios.some((cambio) => cambio.id !== "preparacion");
      return hayCambioEspecifico
        ? cambios.filter((cambio) => cambio.id !== "preparacion")
        : cambios;
    }

    document.addEventListener("click", (evento) => {
      const activador = evento.target.closest(
        '[data-accion="personalizar-producto"], #modal-agregar'
      );
      const cierre = evento.target.closest("[data-cerrar-personalizacion]");

      if (activador) {
        const producto = window.obtenerProductoPorId?.(activador.dataset.productoId);
        if (producto?.disponible) {
          if (activador.id === "modal-agregar") {
            document.dispatchEvent(new CustomEvent("modal:cerrar-producto"));
          }
          abrir(producto, activador);
        }
      }

      if (cierre && !modal.hidden) {
        cerrar();
      }
    });

    opcionesContenedor.addEventListener("change", (evento) => {
      if (evento.target.matches("select")) {
        sincronizarPreparacion(evento.target);
        actualizarTotal();
      }
    });

    restar.addEventListener("click", () => {
      cantidad = Math.max(1, cantidad - 1);
      actualizarTotal();
    });

    sumar.addEventListener("click", () => {
      cantidad = Math.min(20, cantidad + 1);
      actualizarTotal();
    });

    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();
      if (!productoActual) {
        return;
      }

      document.dispatchEvent(
        new CustomEvent("personalizacion:confirmada", {
          detail: {
            productoId: productoActual.id,
            cantidad,
            precioUnitario: obtenerPrecioUnitario(),
            personalizaciones: obtenerCambios()
          }
        })
      );
      cerrar();
    });

    document.addEventListener("keydown", (evento) => {
      if (modal.hidden) {
        return;
      }

      if (evento.key === "Escape") {
        cerrar();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar, { once: true });
  } else {
    iniciar();
  }
})();
