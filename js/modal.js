/*
 * Ventana de detalle de producto.
 * Muestra fotografía, descripción, ingredientes y alérgenos.
 */

(function configurarModalProducto() {
  "use strict";

  let ultimoFoco = null;

  function iniciar() {
    const modal = document.querySelector("#modal-producto");
    const contenido = modal?.querySelector(".modal__contenido");
    const imagen = document.querySelector("#modal-imagen");
    const categoria = document.querySelector("#modal-categoria");
    const titulo = document.querySelector("#modal-titulo");
    const precio = document.querySelector("#modal-precio");
    const descripcion = document.querySelector("#modal-descripcion");
    const ingredientes = document.querySelector("#modal-ingredientes");
    const alergenos = document.querySelector("#modal-alergenos");
    const alergenosTexto = document.querySelector("#modal-alergenos-texto");
    const botonAgregar = document.querySelector("#modal-agregar");

    if (
      !modal ||
      !contenido ||
      !imagen ||
      !categoria ||
      !titulo ||
      !precio ||
      !descripcion ||
      !ingredientes ||
      !alergenos ||
      !alergenosTexto ||
      !botonAgregar
    ) {
      return;
    }

    function abrir(producto, activador) {
      ultimoFoco = activador;
      imagen.src = producto.imagen;
      imagen.alt = `Presentación de ${producto.nombre}`;
      categoria.textContent =
        producto.subcategoria || (producto.categoria === "bebida" ? "Bebida" : "Platillo");
      titulo.textContent = producto.nombre;
      precio.textContent = window.formatearPrecio(producto.precio);
      descripcion.textContent = producto.descripcion;
      ingredientes.replaceChildren(
        ...producto.ingredientes.map((ingrediente) => {
          const elemento = document.createElement("li");
          elemento.textContent = ingrediente;
          return elemento;
        })
      );

      const listaAlergenos = producto.alergenos || [];
      alergenos.hidden = listaAlergenos.length === 0;
      alergenosTexto.textContent =
        listaAlergenos.length > 0 ? listaAlergenos.join(" · ") : "Sin alérgenos declarados";

      botonAgregar.dataset.productoId = producto.id;
      botonAgregar.disabled = !producto.disponible;
      botonAgregar.textContent = producto.disponible
        ? "Agregar a mi pedido"
        : "Producto no disponible";

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
        ultimoFoco?.focus();
      }, 180);
    }

    document.addEventListener("click", (evento) => {
      const activador = evento.target.closest(".boton-ingredientes");
      const cierre = evento.target.closest("[data-cerrar-modal]");

      if (activador) {
        const producto = window.obtenerProductoPorId?.(activador.dataset.productoId);
        if (producto) {
          abrir(producto, activador);
        }
      }

      if (cierre && !modal.hidden) {
        cerrar();
      }
    });

    document.addEventListener("keydown", (evento) => {
      if (modal.hidden) {
        return;
      }

      if (evento.key === "Escape") {
        cerrar();
        return;
      }

      if (evento.key === "Tab") {
        const controles = [
          ...contenido.querySelectorAll(
            'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ];

        if (controles.length === 0) {
          evento.preventDefault();
          contenido.focus();
          return;
        }

        const primero = controles[0];
        const ultimo = controles[controles.length - 1];

        if (evento.shiftKey && document.activeElement === primero) {
          evento.preventDefault();
          ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
          evento.preventDefault();
          primero.focus();
        }
      }
    });

    document.addEventListener("carrito:agregado", (evento) => {
      if (!modal.hidden && evento.detail?.productoId === botonAgregar.dataset.productoId) {
        botonAgregar.textContent = "Agregado ✓";
        window.setTimeout(() => {
          botonAgregar.textContent = "Agregar otro";
        }, 1100);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar, { once: true });
  } else {
    iniciar();
  }
})();
