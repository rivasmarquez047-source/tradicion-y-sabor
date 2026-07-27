/*
 * Carrito de la vista del cliente.
 * Diferencia variantes del mismo producto y registra pedidos por mesa.
 */

(function configurarCarrito() {
  "use strict";

  const CLAVE_CARRITO = "tradicion-sabor-carrito-v2";
  const CLAVE_ULTIMO_PEDIDO = "tradicion-sabor-ultimo-pedido-v2";

  function iniciar() {
    const panel = document.querySelector("#panel-carrito");
    const capa = document.querySelector(".carrito-capa");
    const lista = document.querySelector("#carrito-lista");
    const mensajeVacio = document.querySelector("#carrito-vacio");
    const totalElemento = document.querySelector("#carrito-total");
    const formulario = document.querySelector("#formulario-pedido");
    const pedidoGenerado = document.querySelector("#pedido-generado");
    const pedidoCodigo = document.querySelector("#pedido-codigo");
    const pedidoResumen = document.querySelector("#pedido-resumen");
    const botonCopiar = document.querySelector("#copiar-pedido");
    const enlaceWhatsApp = document.querySelector("#enviar-pedido-whatsapp");
    const avisoPago = document.querySelector("#pedido-aviso-whatsapp");
    const notificacion = document.querySelector("#notificacion");

    if (
      !panel ||
      !capa ||
      !lista ||
      !mensajeVacio ||
      !totalElemento ||
      !formulario ||
      !pedidoGenerado ||
      !pedidoCodigo ||
      !pedidoResumen ||
      !botonCopiar ||
      !enlaceWhatsApp ||
      !avisoPago ||
      !notificacion
    ) {
      return;
    }

    const formatearPrecio =
      window.formatearPrecio ||
      ((precio) =>
        new Intl.NumberFormat("es-PE", {
          style: "currency",
          currency: "PEN",
          minimumFractionDigits: 2
        }).format(precio));

    let carrito = leerCarrito();
    let temporizadorNotificacion;
    let ultimoFoco = null;

    function obtenerProducto(id) {
      return window.ESTADO_APP?.obtenerProducto(id) || window.obtenerProductoPorId?.(id);
    }

    function leerCarrito() {
      try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO) || "[]");
        return Array.isArray(guardado)
          ? guardado.filter(
              (item) =>
                item &&
                typeof item.clave === "string" &&
                typeof item.id === "string" &&
                Number(item.cantidad) > 0
            )
          : [];
      } catch {
        return [];
      }
    }

    function guardarCarrito() {
      try {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
      } catch {
        // La demostración continúa aunque el navegador bloquee el almacenamiento.
      }
    }

    function crearClave(productoId, personalizaciones) {
      const firma = [...personalizaciones]
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((cambio) => `${cambio.id}:${cambio.valor}`)
        .join("|");
      return `${productoId}::${firma || "original"}`;
    }

    function obtenerCantidadTotal() {
      return carrito.reduce((total, item) => total + Number(item.cantidad), 0);
    }

    function obtenerTotal() {
      return carrito.reduce((total, item) => {
        const producto = obtenerProducto(item.id);
        return total + (producto?.precio || 0) * item.cantidad;
      }, 0);
    }

    function crearListaCambios(personalizaciones) {
      const listaCambios = document.createElement("ul");
      listaCambios.className = "carrito-item__cambios";

      if (!personalizaciones?.length) {
        const original = document.createElement("li");
        original.textContent = "Preparación original";
        listaCambios.append(original);
        return listaCambios;
      }

      personalizaciones.forEach((cambio) => {
        const elemento = document.createElement("li");
        const etiqueta = document.createElement("strong");
        etiqueta.textContent = `${cambio.etiqueta}: `;
        elemento.append(etiqueta, cambio.texto);
        listaCambios.append(elemento);
      });

      return listaCambios;
    }

    function crearBotonCantidad(texto, accion, item, producto) {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.dataset.carritoAccion = accion;
      boton.dataset.carritoClave = item.clave;
      boton.textContent = texto;
      boton.setAttribute(
        "aria-label",
        accion === "sumar"
          ? `Agregar otra unidad de ${producto.nombre}`
          : `Quitar una unidad de ${producto.nombre}`
      );
      return boton;
    }

    function crearItem(item) {
      const producto = obtenerProducto(item.id);
      if (!producto) {
        return null;
      }

      const elemento = document.createElement("li");
      elemento.className = "carrito-item";

      const imagen = document.createElement("img");
      imagen.src = producto.imagen;
      imagen.alt = "";
      imagen.loading = "lazy";
      imagen.width = 96;
      imagen.height = 96;

      const informacion = document.createElement("div");
      informacion.className = "carrito-item__informacion";

      const nombre = document.createElement("h3");
      nombre.textContent = producto.nombre;

      const cambios = crearListaCambios(item.personalizaciones || []);

      const precio = document.createElement("p");
      precio.className = "carrito-item__subtotal";
      precio.textContent = `Subtotal: ${formatearPrecio(producto.precio * item.cantidad)}`;

      const cantidad = document.createElement("div");
      cantidad.className = "control-cantidad";
      const restar = crearBotonCantidad("−", "restar", item, producto);
      const numero = document.createElement("span");
      numero.textContent = item.cantidad;
      numero.setAttribute("aria-label", `Cantidad: ${item.cantidad}`);
      const sumar = crearBotonCantidad("+", "sumar", item, producto);

      const eliminar = document.createElement("button");
      eliminar.className = "carrito-item__eliminar";
      eliminar.type = "button";
      eliminar.dataset.carritoAccion = "eliminar";
      eliminar.dataset.carritoClave = item.clave;
      eliminar.textContent = "Eliminar";
      eliminar.setAttribute("aria-label", `Eliminar ${producto.nombre} del pedido`);

      cantidad.append(restar, numero, sumar);
      informacion.append(nombre, cambios, precio, cantidad, eliminar);
      elemento.append(imagen, informacion);
      return elemento;
    }

    function actualizarVista() {
      const fragmento = document.createDocumentFragment();
      carrito.forEach((item) => {
        const elemento = crearItem(item);
        if (elemento) {
          fragmento.append(elemento);
        }
      });
      lista.replaceChildren(fragmento);

      const cantidad = obtenerCantidadTotal();
      mensajeVacio.hidden = cantidad > 0;
      lista.hidden = cantidad === 0;
      totalElemento.textContent = formatearPrecio(obtenerTotal());

      document.querySelectorAll("[data-carrito-contador]").forEach((contador) => {
        contador.textContent = cantidad;
        contador.setAttribute(
          "aria-label",
          `${cantidad} ${cantidad === 1 ? "producto" : "productos"}`
        );
        contador.classList.remove("contador-carrito--pulso");
        requestAnimationFrame(() => contador.classList.add("contador-carrito--pulso"));
      });

      formulario.querySelector('button[type="submit"]').disabled = cantidad === 0;
      guardarCarrito();
    }

    function mostrarNotificacion(mensaje) {
      window.clearTimeout(temporizadorNotificacion);
      notificacion.textContent = mensaje;
      notificacion.hidden = false;
      requestAnimationFrame(() => notificacion.classList.add("notificacion--visible"));
      temporizadorNotificacion = window.setTimeout(() => {
        notificacion.classList.remove("notificacion--visible");
        window.setTimeout(() => {
          notificacion.hidden = true;
        }, 180);
      }, 2400);
    }

    function agregarVariante({ productoId, cantidad, personalizaciones = [] }) {
      const producto = obtenerProducto(productoId);
      if (!producto?.disponible) {
        mostrarNotificacion("Este producto no está disponible actualmente.");
        return;
      }

      const clave = crearClave(productoId, personalizaciones);
      const existente = carrito.find((item) => item.clave === clave);

      if (existente) {
        existente.cantidad += Number(cantidad) || 1;
      } else {
        carrito.push({
          clave,
          id: productoId,
          cantidad: Number(cantidad) || 1,
          personalizaciones: JSON.parse(JSON.stringify(personalizaciones))
        });
      }

      pedidoGenerado.hidden = true;
      actualizarVista();
      mostrarNotificacion(`${producto.nombre} se agregó a Mi pedido.`);
    }

    function modificarCantidad(clave, cambio) {
      const item = carrito.find((elemento) => elemento.clave === clave);
      if (!item) {
        return;
      }
      item.cantidad += cambio;
      carrito = carrito.filter((elemento) => elemento.cantidad > 0);
      actualizarVista();
    }

    function eliminar(clave) {
      carrito = carrito.filter((item) => item.clave !== clave);
      actualizarVista();
    }

    function abrir(activador) {
      ultimoFoco = activador;
      capa.hidden = false;
      panel.setAttribute("aria-hidden", "false");
      document.body.classList.add("carrito-abierto");
      requestAnimationFrame(() => {
        capa.classList.add("carrito-capa--visible");
        panel.classList.add("panel-carrito--abierto");
        panel.querySelector("[data-cerrar-carrito]")?.focus();
      });
    }

    function cerrar() {
      capa.classList.remove("carrito-capa--visible");
      panel.classList.remove("panel-carrito--abierto");
      panel.setAttribute("aria-hidden", "true");
      document.body.classList.remove("carrito-abierto");
      window.setTimeout(() => {
        capa.hidden = true;
        ultimoFoco?.focus();
      }, 220);
    }

    function crearProductosPedido() {
      return carrito.map((item) => {
        const producto = obtenerProducto(item.id);
        return {
          clave: item.clave,
          productoId: item.id,
          nombre: producto.nombre,
          imagen: producto.imagen,
          precioUnitario: producto.precio,
          cantidad: item.cantidad,
          personalizaciones: JSON.parse(JSON.stringify(item.personalizaciones || [])),
          subtotal: producto.precio * item.cantidad
        };
      });
    }

    function crearResumenPedido(pedido) {
      const lineas = [
        `PEDIDO ${pedido.codigo}`,
        `Mesa: ${pedido.mesa}`,
        `Estado: Pedido recibido`,
        "",
        "PRODUCTOS"
      ];

      pedido.productos.forEach((item) => {
        lineas.push(
          `${item.cantidad} × ${item.nombre} — ${formatearPrecio(item.subtotal)}`
        );
        if (item.personalizaciones.length === 0) {
          lineas.push("  Preparación original");
        } else {
          item.personalizaciones.forEach((cambio) => {
            lineas.push(`  ${cambio.etiqueta}: ${cambio.texto}`);
          });
        }
      });

      lineas.push(
        "",
        `TOTAL ESTIMADO: ${formatearPrecio(pedido.total)}`,
        "Estado inicial: Pedido recibido",
        "El pago se realizará al finalizar el consumo."
      );
      return lineas.join("\n");
    }

    function registrarPedido(evento) {
      evento.preventDefault();

      if (carrito.length === 0) {
        mostrarNotificacion("Agrega al menos un producto antes de registrar el pedido.");
        return;
      }

      if (!formulario.reportValidity()) {
        return;
      }

      const datosFormulario = new FormData(formulario);
      const mesa = String(datosFormulario.get("mesa") || "").trim();
      const pedido = window.ESTADO_APP?.crearPedido({
        mesa,
        productos: crearProductosPedido(),
        total: obtenerTotal()
      });

      if (!pedido) {
        mostrarNotificacion("No se pudo registrar el pedido.");
        return;
      }

      const resumen = crearResumenPedido(pedido);
      try {
        localStorage.setItem(
          CLAVE_ULTIMO_PEDIDO,
          JSON.stringify({ ...pedido, resumen })
        );
      } catch {
        // El resumen permanece visible aunque no pueda guardarse.
      }

      pedidoCodigo.textContent = `${pedido.codigo} · Mesa ${pedido.mesa}`;
      pedidoResumen.textContent = resumen;
      pedidoGenerado.hidden = false;
      enlaceWhatsApp.hidden = true;
      avisoPago.hidden = false;

      carrito = [];
      formulario.reset();
      actualizarVista();
      pedidoGenerado.scrollIntoView({ behavior: "smooth", block: "nearest" });
      mostrarNotificacion(`Pedido ${pedido.codigo} recibido por cocina.`);
    }

    async function copiarResumen() {
      const texto = pedidoResumen.textContent;
      if (!texto) {
        return;
      }

      try {
        await navigator.clipboard.writeText(texto);
      } catch {
        const campoTemporal = document.createElement("textarea");
        campoTemporal.value = texto;
        campoTemporal.style.position = "fixed";
        campoTemporal.style.opacity = "0";
        document.body.append(campoTemporal);
        campoTemporal.select();
        document.execCommand("copy");
        campoTemporal.remove();
      }

      mostrarNotificacion("Resumen copiado.");
    }

    document.addEventListener("personalizacion:confirmada", (evento) => {
      agregarVariante(evento.detail);
    });

    document.addEventListener("click", (evento) => {
      const botonAbrir = evento.target.closest("[data-abrir-carrito]");
      const botonCerrar = evento.target.closest("[data-cerrar-carrito]");
      const botonCantidad = evento.target.closest("[data-carrito-accion]");

      if (botonAbrir) {
        abrir(botonAbrir);
      }
      if (botonCerrar) {
        cerrar();
      }
      if (botonCantidad) {
        const { carritoClave, carritoAccion } = botonCantidad.dataset;
        if (carritoAccion === "sumar") {
          modificarCantidad(carritoClave, 1);
        } else if (carritoAccion === "restar") {
          modificarCantidad(carritoClave, -1);
        } else if (carritoAccion === "eliminar") {
          eliminar(carritoClave);
        }
      }
    });

    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape" && panel.getAttribute("aria-hidden") === "false") {
        cerrar();
      }
    });

    formulario.addEventListener("submit", registrarPedido);
    botonCopiar.addEventListener("click", copiarResumen);
    actualizarVista();

    window.CARRITO_SITIO = {
      abrir,
      agregar: agregarVariante,
      obtenerCantidad: obtenerCantidadTotal,
      obtenerTotal
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar, { once: true });
  } else {
    iniciar();
  }
})();
