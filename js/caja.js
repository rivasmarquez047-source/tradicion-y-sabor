(function iniciarCaja() {
  "use strict";

  const estado = window.ESTADO_APP;
  if (!estado) {
    return;
  }

  const tabla = document.querySelector("#tabla-pedidos");
  const detalle = document.querySelector("#detalle-caja");
  const detalleCapa = document.querySelector("#detalle-caja-capa");
  const detalleTitulo = document.querySelector("#detalle-caja-titulo");
  const detalleCuerpo = document.querySelector("#detalle-caja-cuerpo");
  const notificacion = document.querySelector("#notificacion-caja");
  let pedidoSeleccionado = null;
  let temporizador;

  const formatearPrecio = (precio) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2
    }).format(precio);

  const capitalizar = (texto) =>
    String(texto || "").charAt(0).toUpperCase() + String(texto || "").slice(1);

  const esDelivery = (pedido) => pedido.tipoPedido === "delivery";
  const ubicacionPedido = (pedido) =>
    esDelivery(pedido) ? "Delivery" : `Mesa ${pedido.mesa}`;
  const etiquetaEstadoPago = (estadoPago) =>
    ({
      pendiente: "Pendiente",
      validacion: "Por validar",
      pagado: "Pagado"
    })[estadoPago] || capitalizar(estadoPago);
  const etiquetaMetodoPago = (metodoPago) =>
    ({
      yape: "Yape",
      plin: "Plin",
      tarjeta: "Tarjeta",
      efectivo: "Efectivo en caja"
    })[metodoPago] || "Sin seleccionar";

  function crearEstado(texto, tipo) {
    const elemento = document.createElement("span");
    elemento.className = `estado estado--${tipo}`;
    elemento.textContent = capitalizar(texto);
    return elemento;
  }

  function hora(fecha) {
    return new Intl.DateTimeFormat("es-PE", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(fecha));
  }

  function mostrarNotificacion(mensaje) {
    window.clearTimeout(temporizador);
    notificacion.textContent = mensaje;
    notificacion.hidden = false;
    requestAnimationFrame(() => notificacion.classList.add("notificacion--visible"));
    temporizador = window.setTimeout(() => {
      notificacion.classList.remove("notificacion--visible");
      window.setTimeout(() => {
        notificacion.hidden = true;
      }, 180);
    }, 2200);
  }

  function renderMetricas(pedidos) {
    const mesas = new Set(
      pedidos
        .filter(
          (pedido) =>
            pedido.estadoPedido !== "cerrado" &&
            !esDelivery(pedido) &&
            pedido.mesa
        )
        .map((pedido) => pedido.mesa)
    );
    const pagados = pedidos.filter((pedido) => pedido.estadoPago === "pagado");

    document.querySelector("#metrica-mesas").textContent = mesas.size;
    document.querySelector("#metrica-recibidos").textContent = pedidos.filter(
      (pedido) => pedido.estadoPedido === "recibido"
    ).length;
    document.querySelector("#metrica-listos").textContent = pedidos.filter(
      (pedido) => pedido.estadoPedido === "listo"
    ).length;
    document.querySelector("#metrica-entregados").textContent = pedidos.filter(
      (pedido) => pedido.estadoPago === "validacion"
    ).length;
    document.querySelector("#metrica-pagados").textContent = pagados.length;
    document.querySelector("#metrica-ventas").textContent = formatearPrecio(
      pagados.reduce((total, pedido) => total + pedido.total, 0)
    );
  }

  function renderTabla(pedidos) {
    const cantidad = document.querySelector("#cantidad-pedidos");
    cantidad.textContent = `${pedidos.length} ${pedidos.length === 1 ? "pedido" : "pedidos"}`;

    if (pedidos.length === 0) {
      const fila = document.createElement("tr");
      const celda = document.createElement("td");
      celda.className = "tabla-panel__vacio";
      celda.colSpan = 8;
      celda.textContent = "Todavía no hay pedidos. Registra uno desde la vista del cliente.";
      fila.append(celda);
      tabla.replaceChildren(fila);
      return;
    }

    const fragmento = document.createDocumentFragment();
    pedidos.forEach((pedido) => {
      const fila = document.createElement("tr");
      const valores = [
        pedido.codigo,
        ubicacionPedido(pedido),
        hora(pedido.fecha),
        formatearPrecio(pedido.total)
      ];

      valores.forEach((valor) => {
        const celda = document.createElement("td");
        celda.textContent = valor;
        fila.append(celda);
      });

      const estadoPedido = document.createElement("td");
      estadoPedido.append(crearEstado(pedido.estadoPedido, pedido.estadoPedido));
      const estadoPago = document.createElement("td");
      estadoPago.append(
        crearEstado(etiquetaEstadoPago(pedido.estadoPago), pedido.estadoPago)
      );
      const metodo = document.createElement("td");
      metodo.textContent = pedido.metodoPago
        ? etiquetaMetodoPago(pedido.metodoPago)
        : "—";
      const acciones = document.createElement("td");
      const boton = document.createElement("button");
      boton.className = "boton-tabla";
      boton.type = "button";
      boton.dataset.verPedido = pedido.codigo;
      boton.textContent = "Ver pedido";
      boton.setAttribute(
        "aria-label",
        `Ver pedido ${pedido.codigo} · ${ubicacionPedido(pedido)}`
      );
      acciones.append(boton);
      fila.append(estadoPedido, estadoPago, metodo, acciones);
      fragmento.append(fila);
    });
    tabla.replaceChildren(fragmento);
  }

  function crearDetalleProducto(item) {
    const articulo = document.createElement("article");
    articulo.className = "detalle-producto";
    const titulo = document.createElement("h3");
    titulo.textContent = `${item.cantidad} × ${item.nombre}`;
    const subtotal = document.createElement("p");
    subtotal.textContent = `Subtotal: ${formatearPrecio(item.subtotal)}`;
    const cambios = document.createElement("ul");

    if (!item.personalizaciones?.length) {
      const original = document.createElement("li");
      original.textContent = "Preparación original";
      cambios.append(original);
    } else {
      item.personalizaciones.forEach((cambio) => {
        const elemento = document.createElement("li");
        elemento.textContent = `${cambio.etiqueta}: ${cambio.texto}`;
        cambios.append(elemento);
      });
    }
    articulo.append(titulo, cambios, subtotal);
    return articulo;
  }

  function crearDatosEntrega(pedido) {
    const entrega = pedido.entrega || {};
    const bloque = document.createElement("section");
    bloque.className = "detalle-entrega";
    const titulo = document.createElement("h3");
    titulo.textContent = "Datos de delivery";
    bloque.append(titulo);

    [
      ["Cliente", entrega.nombre],
      ["Celular", entrega.celular],
      ["Dirección", entrega.direccion],
      ["Distrito o zona", entrega.distrito],
      ["Referencia", entrega.referencia],
      ["Indicaciones", pedido.indicaciones]
    ].forEach(([etiqueta, valor]) => {
      if (!valor) {
        return;
      }
      const linea = document.createElement("p");
      const nombre = document.createElement("strong");
      nombre.textContent = `${etiqueta}: `;
      linea.append(nombre, String(valor));
      bloque.append(linea);
    });

    return bloque;
  }

  function crearRecibo(pedido) {
    const recibo = document.createElement("section");
    recibo.className = "recibo";
    recibo.id = "recibo-imprimible";
    const titulo = document.createElement("h3");
    titulo.textContent = window.DATOS_SITIO.negocio.nombre;
    const copia = document.createElement("p");
    copia.textContent = "COMPROBANTE DEMOSTRATIVO · COPIA DE CAJA";
    const numeroComprobante = document.createElement("p");
    numeroComprobante.textContent = `Comprobante: ${
      pedido.comprobante?.numero || "Pedido anterior sin correlativo"
    }`;
    const meta = document.createElement("p");
    meta.textContent = `${pedido.codigo} · ${ubicacionPedido(pedido)} · ${new Date(
      pedido.fecha
    ).toLocaleString("es-PE")}`;
    recibo.append(titulo, copia, numeroComprobante, meta);

    if (esDelivery(pedido)) {
      const entrega = pedido.entrega || {};
      [
        `Cliente: ${entrega.nombre || "—"}`,
        `Celular: ${entrega.celular || "—"}`,
        `Dirección: ${entrega.direccion || "—"}`,
        `Distrito o zona: ${entrega.distrito || "—"}`,
        `Referencia: ${entrega.referencia || "—"}`
      ].forEach((texto) => {
        const linea = document.createElement("p");
        linea.textContent = texto;
        recibo.append(linea);
      });
    }

    pedido.productos.forEach((item) => {
      const linea = document.createElement("p");
      linea.textContent = `${item.cantidad} × ${item.nombre} — ${formatearPrecio(
        item.subtotal
      )}`;
      recibo.append(linea);
      if (!item.personalizaciones.length) {
        const original = document.createElement("p");
        original.textContent = "  Preparación original";
        recibo.append(original);
      } else {
        item.personalizaciones.forEach((cambio) => {
          const personalizacion = document.createElement("p");
          personalizacion.textContent = `  ${cambio.etiqueta}: ${cambio.texto}`;
          recibo.append(personalizacion);
        });
      }
    });

    const subtotal = document.createElement("p");
    subtotal.textContent = `Subtotal de productos: ${formatearPrecio(
      pedido.subtotal ?? pedido.total
    )}`;
    recibo.append(subtotal);

    if (esDelivery(pedido)) {
      const delivery = document.createElement("p");
      delivery.textContent = `Delivery: ${formatearPrecio(pedido.recargoDelivery || 0)}`;
      recibo.append(delivery);
    }

    const total = document.createElement("p");
    total.innerHTML = `<strong>Total: ${formatearPrecio(pedido.total)}</strong>`;
    const metodo = document.createElement("p");
    metodo.textContent = `Método: ${etiquetaMetodoPago(pedido.metodoPago)}${
      pedido.numeroOperacion
        ? ` · ${
            pedido.metodoPago === "tarjeta" ? "Referencia" : "Operación"
          } ${pedido.numeroOperacion}`
        : ""
    }`;
    const estadoPago = document.createElement("p");
    estadoPago.textContent = `Estado: ${etiquetaEstadoPago(pedido.estadoPago)}`;
    recibo.append(total, metodo, estadoPago);
    return recibo;
  }

  function renderDetalle() {
    const pedido = estado.obtenerPedido(pedidoSeleccionado);
    if (!pedido) {
      cerrarDetalle();
      return;
    }

    detalleTitulo.textContent = pedido.codigo;
    const fragmento = document.createDocumentFragment();

    const meta = document.createElement("p");
    meta.textContent = `${ubicacionPedido(pedido)} · ${hora(pedido.fecha)}`;
    const estados = document.createElement("div");
    estados.className = "acciones-operativas";
    estados.append(
      crearEstado(pedido.estadoPedido, pedido.estadoPedido),
      crearEstado(etiquetaEstadoPago(pedido.estadoPago), pedido.estadoPago)
    );

    const productos = document.createElement("div");
    productos.className = "detalle-lista-productos";
    pedido.productos.forEach((item) => productos.append(crearDetalleProducto(item)));

    const total = document.createElement("div");
    total.className = "detalle-total";
    total.innerHTML = `<span>Total del consumo</span><strong>${formatearPrecio(
      pedido.total
    )}</strong>`;

    fragmento.append(meta, estados);
    if (esDelivery(pedido)) {
      fragmento.append(crearDatosEntrega(pedido));
    }
    fragmento.append(productos, total);

    if (pedido.estadoPedido === "listo") {
      const entregar = document.createElement("button");
      entregar.className = "boton boton--principal";
      entregar.type = "button";
      entregar.dataset.marcarEntregado = pedido.codigo;
      entregar.textContent = "Marcar como entregado";
      fragmento.append(entregar);
    }

    if (pedido.estadoPago === "validacion") {
      const validacion = document.createElement("section");
      validacion.className = "validacion-pago";

      const titulo = document.createElement("h3");
      titulo.textContent = "Validar pago anticipado";

      const aviso = document.createElement("p");
      aviso.textContent =
        pedido.metodoPago === "efectivo"
          ? "Confirma que el cliente pagó en Caja antes de aprobar el pedido."
          : pedido.metodoPago === "tarjeta"
            ? "Compara la referencia con el comprobante de la terminal antes de aprobar."
            : "Compara manualmente estos datos con Yape o Plin antes de aprobar.";

      const datos = document.createElement("div");
      datos.className = "validacion-pago__datos";

      const crearDato = (etiqueta, valor) => {
        const fila = document.createElement("p");
        const nombre = document.createElement("span");
        const contenido = document.createElement("strong");
        nombre.textContent = etiqueta;
        contenido.textContent = valor;
        fila.append(nombre, contenido);
        return fila;
      };

      const metodo = crearDato(
        "Método",
        etiquetaMetodoPago(pedido.metodoPago)
      );
      const operacion = crearDato(
        pedido.metodoPago === "tarjeta" ? "Referencia" : "Número de operación",
        pedido.numeroOperacion || "No aplica"
      );
      const monto = crearDato("Monto declarado", formatearPrecio(pedido.total));
      const comprobante = crearDato(
        "Comprobante",
        pedido.comprobante?.numero || "Sin correlativo"
      );

      const aclaracion = document.createElement("small");
      aclaracion.textContent =
        "La web es estática: la validación es manual y el comprobante queda guardado en este navegador.";

      const confirmar = document.createElement("button");
      confirmar.className = "boton boton--principal";
      confirmar.type = "button";
      confirmar.dataset.validarPago = pedido.codigo;
      confirmar.textContent = "Confirmar pago recibido";

      const imprimir = document.createElement("button");
      imprimir.className = "boton boton--secundario";
      imprimir.type = "button";
      imprimir.dataset.imprimirPedido = pedido.codigo;
      imprimir.textContent = "Imprimir copia de Caja";

      const acciones = document.createElement("div");
      acciones.className = "acciones-operativas";
      acciones.append(confirmar, imprimir);

      datos.append(metodo, operacion, monto, comprobante);
      validacion.append(titulo, aviso, datos, aclaracion, acciones);
      fragmento.append(validacion, crearRecibo(pedido));
    } else if (pedido.estadoPago === "pendiente") {
      const sinPago = document.createElement("section");
      sinPago.className = "validacion-pago";
      const titulo = document.createElement("h3");
      titulo.textContent = "Pago no iniciado por el cliente";
      const aviso = document.createElement("p");
      aviso.textContent =
        "Caja no selecciona el método de pago. El cliente debe confirmarlo desde Mi pedido.";
      sinPago.append(titulo, aviso);
      fragmento.append(sinPago);
    } else {
      const acciones = document.createElement("div");
      acciones.className = "acciones-operativas";

      if (pedido.estadoPedido !== "cerrado") {
        const cerrar = document.createElement("button");
        cerrar.className = "boton boton--principal";
        cerrar.type = "button";
        cerrar.dataset.cerrarMesa = pedido.codigo;
        cerrar.textContent = esDelivery(pedido) ? "Cerrar pedido" : "Cerrar mesa";
        acciones.append(cerrar);
      }

      const imprimir = document.createElement("button");
      imprimir.className = "boton boton--secundario";
      imprimir.type = "button";
      imprimir.dataset.imprimirPedido = pedido.codigo;
      imprimir.textContent = "Imprimir comprobante";
      acciones.append(imprimir);
      fragmento.append(acciones, crearRecibo(pedido));
    }

    detalleCuerpo.replaceChildren(fragmento);
  }

  function abrirDetalle(codigo) {
    pedidoSeleccionado = codigo;
    renderDetalle();
    detalleCapa.hidden = false;
    detalle.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
      detalleCapa.classList.add("carrito-capa--visible");
      detalle.classList.add("abierto");
    });
  }

  function cerrarDetalle() {
    detalle.classList.remove("abierto");
    detalleCapa.classList.remove("carrito-capa--visible");
    detalle.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      detalleCapa.hidden = true;
      pedidoSeleccionado = null;
    }, 220);
  }

  function render() {
    const pedidos = estado.obtenerPedidos();
    renderMetricas(pedidos);
    renderTabla(pedidos);
    document.querySelector("#caja-actualizacion").textContent = `Actualizado ${hora(
      new Date()
    )}`;
    if (pedidoSeleccionado) {
      renderDetalle();
    }
  }

  document.addEventListener("click", (evento) => {
    const ver = evento.target.closest("[data-ver-pedido]");
    const entregar = evento.target.closest("[data-marcar-entregado]");
    const validarPago = evento.target.closest("[data-validar-pago]");
    const cerrar = evento.target.closest("[data-cerrar-mesa]");
    const imprimir = evento.target.closest("[data-imprimir-pedido]");

    if (ver) {
      abrirDetalle(ver.dataset.verPedido);
    }
    if (
      evento.target.closest("#cerrar-detalle-caja") ||
      evento.target === detalleCapa
    ) {
      cerrarDetalle();
    }
    if (entregar) {
      estado.actualizarPedido(entregar.dataset.marcarEntregado, {
        estadoPedido: "entregado"
      });
      mostrarNotificacion("Pedido marcado como entregado.");
    }
    if (validarPago) {
      estado.actualizarPedido(validarPago.dataset.validarPago, {
        estadoPago: "pagado",
        fechaPagoValidado: new Date().toISOString()
      });
      mostrarNotificacion("Pago validado. El pedido ya está visible en Cocina.");
    }
    if (cerrar) {
      estado.actualizarPedido(cerrar.dataset.cerrarMesa, {
        estadoPedido: "cerrado"
      });
      mostrarNotificacion("Mesa cerrada correctamente.");
    }
    if (imprimir) {
      window.print();
    }
  });

  estado.suscribirse(render);
  render();
})();
