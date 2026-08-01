/*
 * Carrito de la vista del cliente.
 * Diferencia variantes del mismo producto y registra pedidos por mesa.
 */

(function configurarCarrito() {
  "use strict";

  const CLAVE_CARRITO = "tradicion-sabor-carrito-v4";
  const CLAVE_ULTIMO_PEDIDO = "tradicion-sabor-ultimo-pedido-v4";
  const RECARGO_DELIVERY =
    Number(window.DATOS_SITIO?.negocio?.recargoDelivery) || 5;

  function iniciar() {
    const panel = document.querySelector("#panel-carrito");
    const capa = document.querySelector(".carrito-capa");
    const lista = document.querySelector("#carrito-lista");
    const mensajeVacio = document.querySelector("#carrito-vacio");
    const subtotalElemento = document.querySelector("#carrito-subtotal");
    const filaDelivery = document.querySelector("#carrito-fila-delivery");
    const recargoDeliveryElemento = document.querySelector("#carrito-recargo-delivery");
    const totalElemento = document.querySelector("#carrito-total");
    const formulario = document.querySelector("#formulario-pedido");
    const formularioPago = document.querySelector("#formulario-pago-cliente");
    const camposMesa = document.querySelector("#campos-pedido-mesa");
    const camposDelivery = document.querySelector("#campos-pedido-delivery");
    const mesaSelect = document.querySelector("#pedido-mesa");
    const paraLlevarInput = document.querySelector("#pedido-para-llevar");
    const camposRequeridosDelivery = document.querySelectorAll("[data-delivery-required]");
    const opcionesSoloLocal = document.querySelectorAll("[data-solo-local]");
    const pagoResumenPedido = document.querySelector("#pago-resumen-pedido");
    const metodoPagoSelect = document.querySelector("#metodo-pago");
    const pagoInstrucciones = document.querySelector("#pago-instrucciones");
    const pagoQrDemo = document.querySelector("#pago-qr-demo");
    const pagoMarca = document.querySelector("#pago-marca");
    const pagoMetodoSeleccionado = document.querySelector("#pago-metodo-seleccionado");
    const pagoMonto = document.querySelector("#pago-monto");
    const pagoAlternativo = document.querySelector("#pago-alternativo");
    const pagoAlternativoIcono = document.querySelector("#pago-alternativo-icono");
    const pagoAlternativoTitulo = document.querySelector("#pago-alternativo-titulo");
    const pagoAlternativoTexto = document.querySelector("#pago-alternativo-texto");
    const pagoAlternativoAviso = document.querySelector("#pago-alternativo-aviso");
    const campoNumeroOperacion = document.querySelector("#campo-numero-operacion");
    const numeroOperacionInput = document.querySelector("#numero-operacion");
    const confirmarPagoCheckbox = document.querySelector("#confirmar-pago");
    const confirmarPagoTexto = document.querySelector("#pago-confirmacion-texto");
    const botonConfirmarPago = document.querySelector("#confirmar-pago-cliente");
    const botonModificarPedido = document.querySelector("#modificar-pedido");
    const pedidoGenerado = document.querySelector("#pedido-generado");
    const pedidoCodigo = document.querySelector("#pedido-codigo");
    const pedidoResumen = document.querySelector("#pedido-resumen");
    const botonCopiar = document.querySelector("#copiar-pedido");
    const botonImprimirComprobante = document.querySelector(
      "#imprimir-comprobante-cliente"
    );
    const enlaceWhatsApp = document.querySelector("#enviar-pedido-whatsapp");
    const avisoPago = document.querySelector("#pedido-aviso-whatsapp");
    const notificacion = document.querySelector("#notificacion");

    if (
      !panel ||
      !capa ||
      !lista ||
      !mensajeVacio ||
      !subtotalElemento ||
      !filaDelivery ||
      !recargoDeliveryElemento ||
      !totalElemento ||
      !formulario ||
      !formularioPago ||
      !camposMesa ||
      !camposDelivery ||
      !mesaSelect ||
      !paraLlevarInput ||
      !pagoResumenPedido ||
      !metodoPagoSelect ||
      !pagoInstrucciones ||
      !pagoQrDemo ||
      !pagoMarca ||
      !pagoMetodoSeleccionado ||
      !pagoMonto ||
      !pagoAlternativo ||
      !pagoAlternativoIcono ||
      !pagoAlternativoTitulo ||
      !pagoAlternativoTexto ||
      !pagoAlternativoAviso ||
      !campoNumeroOperacion ||
      !numeroOperacionInput ||
      !confirmarPagoCheckbox ||
      !confirmarPagoTexto ||
      !botonConfirmarPago ||
      !botonModificarPedido ||
      !pedidoGenerado ||
      !pedidoCodigo ||
      !pedidoResumen ||
      !botonCopiar ||
      !botonImprimirComprobante ||
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
    let pedidoEnConfirmacion = null;
    let temporizadorNotificacion;
    let ultimoFoco = null;

    function obtenerProducto(id) {
      return window.ESTADO_APP?.obtenerProducto(id) || window.obtenerProductoPorId?.(id);
    }

    function obtenerPrecioUnitarioItem(item, producto) {
      const precioGuardado = Number(item?.precioUnitario);
      return Number.isFinite(precioGuardado) && precioGuardado >= 0
        ? precioGuardado
        : Number(producto?.precio) || 0;
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

    function obtenerCantidadProducto(productoId) {
      return carrito
        .filter((item) => item.id === productoId)
        .reduce((total, item) => total + Number(item.cantidad), 0);
    }

    function obtenerTipoPedido() {
      return formulario.querySelector('input[name="tipoPedido"]:checked')?.value === "delivery"
        ? "delivery"
        : "local";
    }

    function obtenerSubtotalProductos() {
      return carrito.reduce((total, item) => {
        const producto = obtenerProducto(item.id);
        return total + obtenerPrecioUnitarioItem(item, producto) * item.cantidad;
      }, 0);
    }

    function obtenerRecargoDelivery() {
      return obtenerTipoPedido() === "delivery" && carrito.length > 0
        ? RECARGO_DELIVERY
        : 0;
    }

    function obtenerTotal() {
      return obtenerSubtotalProductos() + obtenerRecargoDelivery();
    }

    function etiquetaMetodoPago(metodo) {
      return (
        {
          yape: "Yape",
          plin: "Plin",
          tarjeta: "Tarjeta",
          efectivo: "Efectivo en caja"
        }[metodo] || "Sin seleccionar"
      );
    }

    function actualizarPago(reiniciarConfirmacion = false) {
      const metodo = metodoPagoSelect.value;
      const esPagoDigital = metodo === "yape" || metodo === "plin";
      const esTarjeta = metodo === "tarjeta";
      const esEfectivo = metodo === "efectivo";
      const pagoSeleccionado = esPagoDigital || esTarjeta || esEfectivo;
      const total = pedidoEnConfirmacion?.total ?? obtenerTotal();

      pagoInstrucciones.hidden = !esPagoDigital;
      pagoAlternativo.hidden = !esTarjeta && !esEfectivo;
      campoNumeroOperacion.hidden = !esPagoDigital;
      numeroOperacionInput.disabled = !esPagoDigital;
      numeroOperacionInput.required = esPagoDigital;
      confirmarPagoCheckbox.disabled = !pagoSeleccionado;
      botonConfirmarPago.disabled = !pagoSeleccionado;
      pagoQrDemo.dataset.metodo = esPagoDigital ? metodo : "";
      pagoMarca.textContent = metodo === "yape" ? "YA" : metodo === "plin" ? "PL" : "QR";
      pagoMetodoSeleccionado.textContent =
        metodo === "yape" ? "Pago con Yape" : metodo === "plin" ? "Pago con Plin" : "";
      pagoMonto.textContent = formatearPrecio(total);

      if (esTarjeta) {
        pagoAlternativoIcono.textContent = "▣";
        pagoAlternativoTitulo.textContent = "Pago con tarjeta";
        pagoAlternativoTexto.textContent = `Importe a pagar: ${formatearPrecio(total)}`;
        pagoAlternativoAviso.textContent =
          "Simulación: una web estática no puede realizar cargos bancarios reales.";
        confirmarPagoTexto.textContent =
          "Confirmo el pago anticipado con tarjeta por el total mostrado.";
        botonConfirmarPago.textContent = "Simular pago y generar comprobante";
      } else if (esEfectivo) {
        pagoAlternativoIcono.textContent = "S/";
        pagoAlternativoTitulo.textContent = "Paga en Caja antes de consumir";
        pagoAlternativoTexto.textContent = `Importe exacto: ${formatearPrecio(total)}`;
        pagoAlternativoAviso.textContent =
          "El pedido pasará a Cocina cuando Caja confirme que recibió el efectivo.";
        confirmarPagoTexto.textContent =
          "Entiendo que debo pagar en Caja antes de que preparen mi pedido.";
        botonConfirmarPago.textContent = "Generar orden de pago en efectivo";
      } else if (esPagoDigital) {
        confirmarPagoTexto.textContent = "Confirmo que envié el monto total mostrado.";
        botonConfirmarPago.textContent = "Enviar pago y generar comprobante";
      } else {
        confirmarPagoTexto.textContent = "Confirma el método para continuar.";
        botonConfirmarPago.textContent = "Confirmar pago anticipado";
      }

      if (!esPagoDigital) {
        numeroOperacionInput.value = "";
      }
      if (!pagoSeleccionado || reiniciarConfirmacion) {
        confirmarPagoCheckbox.checked = false;
      }
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
      precio.textContent = `Subtotal: ${formatearPrecio(
        obtenerPrecioUnitarioItem(item, producto) * item.cantidad
      )}`;

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

    function actualizarTipoPedido() {
      const esDelivery = obtenerTipoPedido() === "delivery";

      camposMesa.hidden = esDelivery;
      camposDelivery.hidden = !esDelivery;
      mesaSelect.disabled = esDelivery;
      mesaSelect.required = !esDelivery;
      paraLlevarInput.disabled = esDelivery;
      if (esDelivery) {
        paraLlevarInput.checked = false;
      }

      camposRequeridosDelivery.forEach((campo) => {
        campo.disabled = !esDelivery;
        campo.required = esDelivery;
      });

      filaDelivery.hidden = !esDelivery || carrito.length === 0;
      subtotalElemento.textContent = formatearPrecio(obtenerSubtotalProductos());
      recargoDeliveryElemento.textContent = formatearPrecio(RECARGO_DELIVERY);
      totalElemento.textContent = formatearPrecio(obtenerTotal());
      actualizarPago();
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
      actualizarTipoPedido();

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
      bloquearEdicionCarrito(Boolean(pedidoEnConfirmacion));
      guardarCarrito();
    }

    function bloquearEdicionCarrito(bloquear) {
      lista.classList.toggle("carrito-lista--bloqueada", bloquear);
      lista.querySelectorAll("[data-carrito-accion]").forEach((boton) => {
        boton.disabled = bloquear;
      });
    }

    function iniciarNuevoPedido() {
      pedidoEnConfirmacion = null;
      formularioPago.reset();
      formularioPago.hidden = true;
      formulario.hidden = false;
      pedidoGenerado.hidden = true;
      actualizarPago();
      bloquearEdicionCarrito(false);
    }

    function volverAModificarPedido(mostrarAviso = true) {
      pedidoEnConfirmacion = null;
      formularioPago.reset();
      formularioPago.hidden = true;
      formulario.hidden = false;
      actualizarPago();
      bloquearEdicionCarrito(false);
      formulario.scrollIntoView({ behavior: "smooth", block: "nearest" });
      if (mostrarAviso) {
        mostrarNotificacion("Puedes modificar el pedido antes de pagarlo.");
      }
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

    function agregarVariante({
      productoId,
      cantidad,
      precioUnitario,
      personalizaciones = []
    }) {
      const producto = obtenerProducto(productoId);
      if (!producto?.disponible) {
        mostrarNotificacion("Este producto no está disponible actualmente.");
        return;
      }

      const cantidadAgregar = Math.max(1, Number(cantidad) || 1);
      if (obtenerCantidadProducto(productoId) + cantidadAgregar > producto.stock) {
        mostrarNotificacion(
          `Solo quedan ${producto.stock} unidades de ${producto.nombre}.`
        );
        return;
      }

      const clave = crearClave(productoId, personalizaciones);
      const existente = carrito.find((item) => item.clave === clave);
      const precioCalculado =
        Number.isFinite(Number(precioUnitario)) && Number(precioUnitario) >= 0
          ? Number(precioUnitario)
          : producto.precio;

      if (existente) {
        existente.cantidad += cantidadAgregar;
        existente.precioUnitario = precioCalculado;
      } else {
        carrito.push({
          clave,
          id: productoId,
          cantidad: cantidadAgregar,
          precioUnitario: precioCalculado,
          personalizaciones: JSON.parse(JSON.stringify(personalizaciones))
        });
      }

      iniciarNuevoPedido();
      actualizarVista();
      mostrarNotificacion(`${producto.nombre} se agregó a Mi pedido.`);
    }

    function modificarCantidad(clave, cambio) {
      if (pedidoEnConfirmacion) {
        return;
      }
      const item = carrito.find((elemento) => elemento.clave === clave);
      if (!item) {
        return;
      }
      const producto = obtenerProducto(item.id);
      if (
        cambio > 0 &&
        producto &&
        obtenerCantidadProducto(item.id) + cambio > producto.stock
      ) {
        mostrarNotificacion(
          `Solo quedan ${producto.stock} unidades de ${producto.nombre}.`
        );
        return;
      }
      item.cantidad += cambio;
      carrito = carrito.filter((elemento) => elemento.cantidad > 0);
      actualizarVista();
    }

    function eliminar(clave) {
      if (pedidoEnConfirmacion) {
        return;
      }
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
        const precioUnitario = obtenerPrecioUnitarioItem(item, producto);
        return {
          clave: item.clave,
          productoId: item.id,
          nombre: producto.nombre,
          imagen: producto.imagen,
          precioUnitario,
          cantidad: item.cantidad,
          personalizaciones: JSON.parse(JSON.stringify(item.personalizaciones || [])),
          subtotal: precioUnitario * item.cantidad
        };
      });
    }

    function crearResumenPedido(pedido) {
      const esDelivery = pedido.tipoPedido === "delivery";
      const esParaLlevar = !esDelivery && pedido.paraLlevar;
      const metodo = etiquetaMetodoPago(pedido.metodoPago);
      const lineas = [
        "COMPROBANTE DE PEDIDO · DEMOSTRACIÓN",
        `Comprobante: ${pedido.comprobante?.numero || "Sin número"}`,
        "Copia del cliente · Caja conserva una copia",
        "",
        `PEDIDO ${pedido.codigo}`,
        `Tipo de pedido: ${
          esDelivery ? "Delivery" : esParaLlevar ? "En el restaurante · Para llevar" : "En el restaurante"
        }`,
        esDelivery
          ? "Entrega: Delivery"
          : esParaLlevar
            ? `Entrega: Para llevar · Pedido realizado desde la mesa ${pedido.mesa}`
            : `Mesa: ${pedido.mesa}`,
        `Estado: Pedido recibido`,
      ];

      if (esDelivery) {
        lineas.push(
          `Cliente: ${pedido.entrega.nombre}`,
          `Celular: ${pedido.entrega.celular}`,
          `Dirección: ${pedido.entrega.direccion}`,
          `Distrito o zona: ${pedido.entrega.distrito}`,
          `Referencia: ${pedido.entrega.referencia}`
        );
        if (pedido.indicaciones) {
          lineas.push(`Indicaciones: ${pedido.indicaciones}`);
        }
      }

      lineas.push("", "PRODUCTOS");

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
        `SUBTOTAL DE PRODUCTOS: ${formatearPrecio(pedido.subtotal)}`,
        ...(esDelivery
          ? [`DELIVERY: ${formatearPrecio(pedido.recargoDelivery)}`]
          : []),
        `TOTAL ESTIMADO: ${formatearPrecio(pedido.total)}`,
        "Estado inicial: Pedido recibido",
        "",
        "PAGO ANTICIPADO",
        `Método: ${metodo}`,
        ...(pedido.numeroOperacion
          ? [
              `${
                pedido.metodoPago === "tarjeta" ? "Referencia demostrativa" : "Número de operación"
              }: ${pedido.numeroOperacion}`
            ]
          : []),
        `Monto: ${formatearPrecio(pedido.total)}`,
        `Estado del pago: ${
          pedido.metodoPago === "efectivo"
            ? "Pendiente de pago y validación en Caja"
            : "Comprobante enviado para validación"
        }`,
        "El pedido pasará a Cocina cuando Caja valide el pago."
      );
      return lineas.join("\n");
    }

    function prepararPago(evento) {
      evento.preventDefault();

      if (carrito.length === 0) {
        mostrarNotificacion("Agrega al menos un producto antes de registrar el pedido.");
        return;
      }

      if (!formulario.reportValidity()) {
        return;
      }

      const datosFormulario = new FormData(formulario);
      const tipoPedido =
        String(datosFormulario.get("tipoPedido") || "") === "delivery"
          ? "delivery"
          : "local";
      const esDelivery = tipoPedido === "delivery";
      const mesa = esDelivery ? "" : String(datosFormulario.get("mesa") || "").trim();
      const paraLlevar = !esDelivery && datosFormulario.get("paraLlevar") === "si";
      const entrega = esDelivery
        ? {
            nombre: String(datosFormulario.get("nombreCliente") || "").trim(),
            celular: String(datosFormulario.get("celular") || "").trim(),
            direccion: String(datosFormulario.get("direccionEntrega") || "").trim(),
            distrito: String(datosFormulario.get("distrito") || "").trim(),
            referencia: String(datosFormulario.get("referencia") || "").trim()
          }
        : null;
      const indicaciones = esDelivery
        ? String(datosFormulario.get("indicaciones") || "").trim()
        : "";
      const subtotal = obtenerSubtotalProductos();
      const recargoDelivery = esDelivery ? RECARGO_DELIVERY : 0;

      pedidoEnConfirmacion = {
        tipoPedido,
        mesa,
        paraLlevar,
        entrega,
        indicaciones,
        productos: crearProductosPedido(),
        subtotal,
        recargoDelivery,
        total: subtotal + recargoDelivery
      };

      formularioPago.reset();
      opcionesSoloLocal.forEach((opcion) => {
        opcion.disabled = esDelivery;
        opcion.hidden = esDelivery;
      });
      document.querySelector("#metodo-pago-placeholder").textContent = esDelivery
        ? "Selecciona Yape o Plin"
        : "Selecciona Yape, Plin, tarjeta o efectivo";
      pagoResumenPedido.textContent = `${
        esDelivery ? "Delivery" : paraLlevar ? `Para llevar · Mesa ${mesa}` : `Mesa ${mesa}`
      } · Total confirmado: ${formatearPrecio(pedidoEnConfirmacion.total)}`;
      formulario.hidden = true;
      formularioPago.hidden = false;
      pedidoGenerado.hidden = true;
      bloquearEdicionCarrito(true);
      actualizarPago();
      formularioPago.scrollIntoView({ behavior: "smooth", block: "nearest" });
      mostrarNotificacion("Pedido confirmado. Ahora selecciona cómo pagar.");
    }

    function generarNumeroComprobante() {
      const ahora = new Date();
      const fecha = `${String(ahora.getFullYear()).slice(-2)}${String(
        ahora.getMonth() + 1
      ).padStart(2, "0")}${String(ahora.getDate()).padStart(2, "0")}`;
      const correlativo = String(Math.floor(Math.random() * 9000) + 1000);
      return `COMP-${fecha}-${correlativo}`;
    }

    function generarReferenciaTarjeta() {
      return `TARJ-DEMO-${String(Date.now()).slice(-8)}`;
    }

    function registrarPago(evento) {
      evento.preventDefault();

      if (!pedidoEnConfirmacion) {
        volverAModificarPedido(false);
        mostrarNotificacion("Confirma nuevamente los datos del pedido.");
        return;
      }

      if (!formularioPago.reportValidity()) {
        return;
      }

      const datosPago = new FormData(formularioPago);
      const metodoPago = String(datosPago.get("metodoPago") || "").trim();
      const metodosPermitidos =
        pedidoEnConfirmacion.tipoPedido === "delivery"
          ? ["yape", "plin"]
          : ["yape", "plin", "tarjeta", "efectivo"];

      if (!metodosPermitidos.includes(metodoPago)) {
        mostrarNotificacion("Selecciona un método de pago disponible.");
        return;
      }

      const esPagoDigital = metodoPago === "yape" || metodoPago === "plin";
      const numeroOperacion = esPagoDigital
        ? String(datosPago.get("numeroOperacion") || "").trim()
        : metodoPago === "tarjeta"
          ? generarReferenciaTarjeta()
          : "";
      const fechaPagoEnviado = new Date().toISOString();
      const pedido = window.ESTADO_APP?.crearPedido({
        ...pedidoEnConfirmacion,
        pagoAnticipado: true,
        estadoPago: "validacion",
        metodoPago,
        numeroOperacion,
        fechaPagoEnviado,
        comprobante: {
          numero: generarNumeroComprobante(),
          fecha: fechaPagoEnviado,
          tipo: "Comprobante demostrativo de pedido",
          copiaCaja: true
        }
      });

      if (!pedido) {
        mostrarNotificacion(
          "No se pudo registrar el pedido porque cambió el stock. Revisa las cantidades."
        );
        volverAModificarPedido(false);
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

      pedidoCodigo.textContent = `${pedido.comprobante.numero} · ${pedido.codigo}`;
      pedidoResumen.textContent = resumen;
      pedidoGenerado.hidden = false;
      enlaceWhatsApp.hidden = true;
      avisoPago.hidden = false;
      avisoPago.textContent =
        pedido.metodoPago === "efectivo"
          ? "Presenta este comprobante y paga en Caja antes de consumir. Caja conserva una copia para validación y reclamos."
          : "Caja conserva otra copia para validar el pago y atender cualquier reclamo.";

      carrito = [];
      pedidoEnConfirmacion = null;
      formulario.reset();
      formularioPago.reset();
      formulario.hidden = true;
      formularioPago.hidden = true;
      actualizarVista();
      pedidoGenerado.scrollIntoView({ behavior: "smooth", block: "nearest" });
      mostrarNotificacion(
        pedido.metodoPago === "efectivo"
          ? `Orden ${pedido.codigo} lista para pagar en Caja.`
          : `Comprobante ${pedido.comprobante.numero} enviado a Caja.`
      );
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

    function imprimirComprobanteCliente() {
      document.body.classList.add("imprimir-comprobante-cliente");
      window.print();
      window.setTimeout(() => {
        document.body.classList.remove("imprimir-comprobante-cliente");
      }, 500);
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

    formulario.addEventListener("change", (evento) => {
      if (evento.target.matches('input[name="tipoPedido"]')) {
        actualizarTipoPedido();
      }
    });

    formularioPago.addEventListener("change", (evento) => {
      if (evento.target.matches("#metodo-pago")) {
        numeroOperacionInput.value = "";
        actualizarPago(true);
      }
    });

    formulario.addEventListener("submit", prepararPago);
    formularioPago.addEventListener("submit", registrarPago);
    botonModificarPedido.addEventListener("click", () => volverAModificarPedido());
    botonCopiar.addEventListener("click", copiarResumen);
    botonImprimirComprobante.addEventListener("click", imprimirComprobanteCliente);
    window.addEventListener("afterprint", () => {
      document.body.classList.remove("imprimir-comprobante-cliente");
    });
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
