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
        .filter((pedido) => pedido.estadoPedido !== "cerrado")
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
      (pedido) => pedido.estadoPedido === "entregado" && pedido.estadoPago === "pendiente"
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
        `Mesa ${pedido.mesa}`,
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
      estadoPago.append(crearEstado(pedido.estadoPago, pedido.estadoPago));
      const metodo = document.createElement("td");
      metodo.textContent = pedido.metodoPago ? capitalizar(pedido.metodoPago) : "—";
      const acciones = document.createElement("td");
      const boton = document.createElement("button");
      boton.className = "boton-tabla";
      boton.type = "button";
      boton.dataset.verPedido = pedido.codigo;
      boton.textContent = "Ver pedido";
      boton.setAttribute("aria-label", `Ver pedido ${pedido.codigo} de la mesa ${pedido.mesa}`);
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

  function crearRecibo(pedido) {
    const recibo = document.createElement("section");
    recibo.className = "recibo";
    recibo.id = "recibo-imprimible";
    const titulo = document.createElement("h3");
    titulo.textContent = window.DATOS_SITIO.negocio.nombre;
    const meta = document.createElement("p");
    meta.textContent = `${pedido.codigo} · Mesa ${pedido.mesa} · ${new Date(
      pedido.fecha
    ).toLocaleString("es-PE")}`;
    recibo.append(titulo, meta);

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

    const total = document.createElement("p");
    total.innerHTML = `<strong>Total: ${formatearPrecio(pedido.total)}</strong>`;
    const metodo = document.createElement("p");
    metodo.textContent = `Método: ${capitalizar(pedido.metodoPago)}${
      pedido.numeroOperacion ? ` · Operación ${pedido.numeroOperacion}` : ""
    }`;
    const estadoPago = document.createElement("p");
    estadoPago.textContent = "Estado: Pagado";
    recibo.append(total, metodo, estadoPago);
    return recibo;
  }

  function campoPago(etiqueta, nombre, tipo = "text") {
    const label = document.createElement("label");
    label.textContent = etiqueta;
    const input = document.createElement("input");
    input.type = tipo;
    input.name = nombre;
    if (tipo === "number") {
      input.min = "0";
      input.step = "0.10";
    }
    label.append(input);
    return label;
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
    meta.textContent = `Mesa ${pedido.mesa} · ${hora(pedido.fecha)}`;
    const estados = document.createElement("div");
    estados.className = "acciones-operativas";
    estados.append(
      crearEstado(pedido.estadoPedido, pedido.estadoPedido),
      crearEstado(pedido.estadoPago, pedido.estadoPago)
    );

    const productos = document.createElement("div");
    productos.className = "detalle-lista-productos";
    pedido.productos.forEach((item) => productos.append(crearDetalleProducto(item)));

    const total = document.createElement("div");
    total.className = "detalle-total";
    total.innerHTML = `<span>Total del consumo</span><strong>${formatearPrecio(
      pedido.total
    )}</strong>`;

    fragmento.append(meta, estados, productos, total);

    if (pedido.estadoPedido === "listo") {
      const entregar = document.createElement("button");
      entregar.className = "boton boton--principal";
      entregar.type = "button";
      entregar.dataset.marcarEntregado = pedido.codigo;
      entregar.textContent = "Marcar como entregado";
      fragmento.append(entregar);
    }

    if (pedido.estadoPago === "pendiente") {
      const formulario = document.createElement("form");
      formulario.className = "formulario-operativo";
      formulario.id = "formulario-pago";
      formulario.dataset.codigo = pedido.codigo;
      const titulo = document.createElement("h3");
      titulo.textContent = "Registrar pago";
      const aviso = document.createElement("p");
      aviso.textContent =
        pedido.estadoPedido === "entregado"
          ? "Selecciona el método utilizado al finalizar el consumo."
          : "El pago se habilitará cuando el pedido sea entregado.";

      const labelMetodo = document.createElement("label");
      labelMetodo.textContent = "Método de pago";
      const select = document.createElement("select");
      select.name = "metodo";
      select.required = true;
      select.disabled = pedido.estadoPedido !== "entregado";
      [
        ["", "Seleccionar método"],
        ["yape", "Yape"],
        ["plin", "Plin"],
        ["tarjeta", "Tarjeta"],
        ["efectivo", "Efectivo"]
      ].forEach(([valor, texto]) => {
        const opcion = document.createElement("option");
        opcion.value = valor;
        opcion.textContent = texto;
        select.append(opcion);
      });
      labelMetodo.append(select);

      const camposDinamicos = document.createElement("div");
      camposDinamicos.id = "campos-pago";
      camposDinamicos.dataset.total = pedido.total;

      const registrar = document.createElement("button");
      registrar.className = "boton boton--principal";
      registrar.type = "submit";
      registrar.disabled = pedido.estadoPedido !== "entregado";
      registrar.textContent = "Verificar y registrar pago";

      formulario.append(titulo, aviso, labelMetodo, camposDinamicos, registrar);
      fragmento.append(formulario);
    } else {
      const acciones = document.createElement("div");
      acciones.className = "acciones-operativas";

      if (pedido.estadoPedido !== "cerrado") {
        const cerrar = document.createElement("button");
        cerrar.className = "boton boton--principal";
        cerrar.type = "button";
        cerrar.dataset.cerrarMesa = pedido.codigo;
        cerrar.textContent = "Cerrar mesa";
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

  function renderCamposPago(metodo) {
    const contenedor = document.querySelector("#campos-pago");
    if (!contenedor) {
      return;
    }
    const total = Number(contenedor.dataset.total);

    if (metodo === "yape" || metodo === "plin") {
      const operacion = campoPago("Número de operación (opcional)", "numeroOperacion");
      contenedor.replaceChildren(operacion);
    } else if (metodo === "tarjeta") {
      const confirmacion = document.createElement("p");
      confirmacion.className = "pedido-generado";
      confirmacion.textContent =
        "La transacción con tarjeta será confirmada de forma simulada al registrar el pago.";
      contenedor.replaceChildren(confirmacion);
    } else if (metodo === "efectivo") {
      const monto = campoPago("Monto recibido", "montoRecibido", "number");
      monto.querySelector("input").required = true;
      const totalCampo = document.createElement("p");
      totalCampo.textContent = `Total del consumo: ${formatearPrecio(total)}`;
      const vuelto = document.createElement("p");
      vuelto.id = "vuelto-calculado";
      vuelto.textContent = "Vuelto: S/ 0.00";
      contenedor.replaceChildren(monto, totalCampo, vuelto);
    } else {
      contenedor.replaceChildren();
    }
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

  document.addEventListener("change", (evento) => {
    if (evento.target.matches('#formulario-pago select[name="metodo"]')) {
      renderCamposPago(evento.target.value);
    }
  });

  document.addEventListener("input", (evento) => {
    if (evento.target.matches('input[name="montoRecibido"]')) {
      const contenedor = document.querySelector("#campos-pago");
      const vuelto = document.querySelector("#vuelto-calculado");
      const cambio = Number(evento.target.value || 0) - Number(contenedor.dataset.total);
      vuelto.textContent = `Vuelto: ${formatearPrecio(Math.max(0, cambio))}`;
    }
  });

  document.addEventListener("submit", (evento) => {
    if (evento.target.id !== "formulario-pago") {
      return;
    }
    evento.preventDefault();
    const formulario = evento.target;
    if (!formulario.reportValidity()) {
      return;
    }

    const datos = new FormData(formulario);
    const metodo = String(datos.get("metodo") || "");
    const pedido = estado.obtenerPedido(formulario.dataset.codigo);
    const montoRecibido = metodo === "efectivo" ? Number(datos.get("montoRecibido")) : null;

    if (metodo === "efectivo" && montoRecibido < pedido.total) {
      mostrarNotificacion("El monto recibido es menor que el total.");
      return;
    }

    estado.actualizarPedido(pedido.codigo, {
      estadoPago: "pagado",
      metodoPago: metodo,
      numeroOperacion: String(datos.get("numeroOperacion") || ""),
      montoRecibido,
      vuelto: metodo === "efectivo" ? montoRecibido - pedido.total : null
    });
    mostrarNotificacion("Pago verificado y registrado.");
  });

  estado.suscribirse(render);
  render();
})();
