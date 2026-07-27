/*
 * Carrito demostrativo.
 * Guarda la selección en el navegador y registra un resumen local.
 * No procesa pagos ni envía información a un servidor.
 */

(function configurarCarrito() {
  "use strict";

  const CLAVE_CARRITO = "tradicion-sabor-carrito";
  const CLAVE_ULTIMO_PEDIDO = "tradicion-sabor-ultimo-pedido";

  function iniciar() {
    const datos = window.DATOS_SITIO;
    const productos = [...(datos?.platillos || []), ...(datos?.bebidas || [])];
    const productosPorId = new Map(productos.map((producto) => [producto.id, producto]));
    const formatearPrecio =
      window.formatearPrecio ||
      ((precio) =>
        new Intl.NumberFormat("es-PE", {
          style: "currency",
          currency: "PEN",
          minimumFractionDigits: 2
        }).format(precio));

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
    const avisoWhatsApp = document.querySelector("#pedido-aviso-whatsapp");
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
      !avisoWhatsApp ||
      !notificacion
    ) {
      return;
    }

    let temporizadorNotificacion;
    let ultimoFoco = null;
    let carrito = leerCarrito().filter((item) => productosPorId.has(item.id) && item.cantidad > 0);

    function leerCarrito() {
      try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO) || "[]");
        return Array.isArray(guardado) ? guardado : [];
      } catch {
        return [];
      }
    }

    function guardarCarrito() {
      try {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
      } catch {
        // La página sigue funcionando aunque el navegador bloquee el almacenamiento.
      }
    }

    function obtenerCantidadTotal() {
      return carrito.reduce((total, item) => total + item.cantidad, 0);
    }

    function obtenerTotal() {
      return carrito.reduce((total, item) => {
        const producto = productosPorId.get(item.id);
        return total + (producto?.precio || 0) * item.cantidad;
      }, 0);
    }

    function crearBotonCantidad(texto, accion, producto) {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.dataset.carritoAccion = accion;
      boton.dataset.productoId = producto.id;
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
      const producto = productosPorId.get(item.id);
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

      const precio = document.createElement("p");
      precio.textContent = formatearPrecio(producto.precio * item.cantidad);

      const cantidad = document.createElement("div");
      cantidad.className = "control-cantidad";

      const restar = crearBotonCantidad("−", "restar", producto);
      const numero = document.createElement("span");
      numero.textContent = item.cantidad;
      numero.setAttribute("aria-label", `${item.cantidad} unidades`);
      const sumar = crearBotonCantidad("+", "sumar", producto);

      const eliminar = document.createElement("button");
      eliminar.className = "carrito-item__eliminar";
      eliminar.type = "button";
      eliminar.dataset.carritoAccion = "eliminar";
      eliminar.dataset.productoId = producto.id;
      eliminar.textContent = "Eliminar";
      eliminar.setAttribute("aria-label", `Eliminar ${producto.nombre} del pedido`);

      cantidad.append(restar, numero, sumar);
      informacion.append(nombre, precio, cantidad, eliminar);
      elemento.append(imagen, informacion);
      return elemento;
    }

    function actualizarVista() {
      const fragmento = document.createDocumentFragment();
      carrito.forEach((item) => fragmento.append(crearItem(item)));
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

    function agregar(productoId) {
      const producto = productosPorId.get(productoId);
      if (!producto || !producto.disponible) {
        return;
      }

      const existente = carrito.find((item) => item.id === productoId);
      if (existente) {
        existente.cantidad += 1;
      } else {
        carrito.push({ id: productoId, cantidad: 1 });
      }

      actualizarVista();
      mostrarNotificacion(`${producto.nombre} se agregó a Mi pedido.`);
      document.dispatchEvent(
        new CustomEvent("carrito:agregado", {
          detail: { productoId, cantidad: existente ? existente.cantidad : 1 }
        })
      );
    }

    function modificarCantidad(productoId, cambio) {
      const item = carrito.find((elemento) => elemento.id === productoId);
      if (!item) {
        return;
      }

      item.cantidad += cambio;
      carrito = carrito.filter((elemento) => elemento.cantidad > 0);
      actualizarVista();
    }

    function eliminar(productoId) {
      carrito = carrito.filter((item) => item.id !== productoId);
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

    function crearCodigoPedido() {
      const fecha = new Date();
      const parteFecha = [
        String(fecha.getFullYear()).slice(-2),
        String(fecha.getMonth() + 1).padStart(2, "0"),
        String(fecha.getDate()).padStart(2, "0")
      ].join("");
      const parteHora = `${String(fecha.getHours()).padStart(2, "0")}${String(
        fecha.getMinutes()
      ).padStart(2, "0")}`;
      return `TS-${parteFecha}-${parteHora}`;
    }

    function crearResumenPedido(codigo, campos) {
      const lineas = [
        `PEDIDO DEMOSTRATIVO ${codigo}`,
        `Cliente: ${campos.nombre}`,
        `Teléfono: ${campos.telefono}`,
        `Modalidad: ${campos.modalidad}`,
        "",
        "PRODUCTOS"
      ];

      carrito.forEach((item) => {
        const producto = productosPorId.get(item.id);
        lineas.push(
          `${item.cantidad} × ${producto.nombre} — ${formatearPrecio(
            producto.precio * item.cantidad
          )}`
        );
      });

      lineas.push("", `TOTAL ESTIMADO: ${formatearPrecio(obtenerTotal())}`);

      if (campos.indicaciones) {
        lineas.push("", `Indicaciones: ${campos.indicaciones}`);
      }

      lineas.push("", "Pedido registrado localmente. Pendiente de confirmación del restaurante.");
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
      const campos = {
        nombre: String(datosFormulario.get("nombre") || "").trim(),
        telefono: String(datosFormulario.get("telefono") || "").trim(),
        modalidad: String(datosFormulario.get("modalidad") || "").trim(),
        indicaciones: String(datosFormulario.get("indicaciones") || "").trim()
      };
      const codigo = crearCodigoPedido();
      const resumen = crearResumenPedido(codigo, campos);
      const pedido = {
        codigo,
        fecha: new Date().toISOString(),
        cliente: campos,
        productos: carrito.map((item) => ({ ...item })),
        total: obtenerTotal(),
        resumen
      };

      try {
        localStorage.setItem(CLAVE_ULTIMO_PEDIDO, JSON.stringify(pedido));
      } catch {
        // El resumen sigue visible aunque el navegador bloquee el almacenamiento.
      }

      pedidoCodigo.textContent = codigo;
      pedidoResumen.textContent = resumen;
      pedidoGenerado.hidden = false;

      const numeroWhatsApp = String(datos.negocio.whatsapp || "").replace(/\D/g, "");
      if (numeroWhatsApp) {
        enlaceWhatsApp.href = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(resumen)}`;
        enlaceWhatsApp.hidden = false;
        avisoWhatsApp.hidden = true;
      } else {
        enlaceWhatsApp.hidden = true;
        avisoWhatsApp.hidden = false;
      }

      pedidoGenerado.scrollIntoView({ behavior: "smooth", block: "nearest" });
      mostrarNotificacion(`Pedido ${codigo} registrado en este dispositivo.`);
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

    document.addEventListener("click", (evento) => {
      const botonAbrir = evento.target.closest("[data-abrir-carrito]");
      const botonCerrar = evento.target.closest("[data-cerrar-carrito]");
      const botonAgregar = evento.target.closest('[data-accion="agregar-carrito"], #modal-agregar');
      const botonCantidad = evento.target.closest("[data-carrito-accion]");

      if (botonAbrir) {
        abrir(botonAbrir);
      }

      if (botonCerrar) {
        cerrar();
      }

      if (botonAgregar) {
        agregar(botonAgregar.dataset.productoId);
      }

      if (botonCantidad) {
        const { productoId, carritoAccion } = botonCantidad.dataset;
        if (carritoAccion === "sumar") {
          modificarCantidad(productoId, 1);
        } else if (carritoAccion === "restar") {
          modificarCantidad(productoId, -1);
        } else if (carritoAccion === "eliminar") {
          eliminar(productoId);
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
      agregar,
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
