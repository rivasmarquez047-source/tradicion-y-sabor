(function iniciarCocina() {
  "use strict";

  const estado = window.ESTADO_APP;
  if (!estado) {
    return;
  }

  const contenedores = {
    recibido: document.querySelector("#pedidos-pendientes"),
    preparando: document.querySelector("#pedidos-preparando"),
    listo: document.querySelector("#pedidos-listos")
  };
  const notificacion = document.querySelector("#notificacion-cocina");
  let temporizador;

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
    }, 2000);
  }

  function hora(fecha) {
    return new Intl.DateTimeFormat("es-PE", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(fecha));
  }

  function tiempoDesde(fecha) {
    const minutos = Math.max(0, Math.floor((Date.now() - new Date(fecha).getTime()) / 60000));
    if (minutos < 1) {
      return "Hace menos de 1 min";
    }
    if (minutos < 60) {
      return `Hace ${minutos} min`;
    }
    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;
    return `Hace ${horas} h ${resto} min`;
  }

  function fechaEstado(pedido, estadoBuscado) {
    const registro = [...(pedido.historial || [])]
      .reverse()
      .find((item) => item.estado === estadoBuscado);
    return registro?.fecha || pedido.fecha;
  }

  function crearProducto(item) {
    const elemento = document.createElement("li");
    const nombre = document.createElement("strong");
    nombre.textContent = `${item.cantidad} × ${item.nombre}`;
    elemento.append(nombre);

    const detalle = document.createElement("span");
    detalle.textContent = item.personalizaciones?.length
      ? item.personalizaciones.map((cambio) => `${cambio.etiqueta}: ${cambio.texto}`).join(" · ")
      : "Preparación original";
    elemento.append(detalle);
    return elemento;
  }

  function crearTarjeta(pedido) {
    const tarjeta = document.createElement("article");
    tarjeta.className = `pedido-cocina pedido-cocina--${pedido.estadoPedido}`;

    const encabezado = document.createElement("div");
    encabezado.className = "pedido-cocina__encabezado";
    const codigo = document.createElement("strong");
    codigo.textContent = pedido.codigo;
    const mesa = document.createElement("span");
    mesa.textContent =
      pedido.tipoPedido === "delivery"
        ? `Delivery${pedido.entrega?.distrito ? ` · ${pedido.entrega.distrito}` : ""}`
        : pedido.paraLlevar
          ? `PARA LLEVAR · Mesa ${pedido.mesa}`
          : `Mesa ${pedido.mesa}`;
    encabezado.append(codigo, mesa);

    const tiempo = document.createElement("p");
    tiempo.className = "pedido-cocina__tiempo";
    const referencia =
      pedido.estadoPedido === "listo"
        ? fechaEstado(pedido, "listo")
        : pedido.fecha;
    tiempo.textContent = `${hora(pedido.fecha)} · ${tiempoDesde(referencia)}`;

    const productos = document.createElement("ul");
    productos.className = "pedido-cocina__productos";
    pedido.productos.forEach((item) => productos.append(crearProducto(item)));
    tarjeta.append(encabezado, tiempo);

    if (pedido.tipoPedido === "delivery") {
      const entrega = document.createElement("p");
      entrega.className = "pedido-cocina__entrega";
      entrega.textContent = [
        pedido.entrega?.nombre,
        pedido.entrega?.celular,
        pedido.entrega?.direccion
      ]
        .filter(Boolean)
        .join(" · ");
      tarjeta.append(entrega);
    }

    tarjeta.append(productos);

    const acciones = document.createElement("div");
    acciones.className = "pedido-cocina__acciones";
    const boton = document.createElement("button");
    boton.className = "boton boton--principal";
    boton.type = "button";
    boton.dataset.pedidoCodigo = pedido.codigo;

    if (pedido.estadoPedido === "recibido") {
      boton.dataset.nuevoEstado = "preparando";
      boton.textContent = "Comenzar preparación";
      acciones.append(boton);
    } else if (pedido.estadoPedido === "preparando") {
      boton.dataset.nuevoEstado = "listo";
      boton.textContent = "Marcar como listo";
      acciones.append(boton);
    } else if (pedido.estadoPedido === "listo") {
      boton.dataset.nuevoEstado = "entregado";
      boton.textContent = "Marcar como entregado";
      acciones.append(boton);
    } else if (pedido.estadoPedido === "entregado") {
      const estadoPago = document.createElement("span");
      estadoPago.className = `estado estado--${pedido.estadoPago}`;
      estadoPago.textContent =
        pedido.estadoPago === "pagado" ? "Pago registrado" : "Pendiente de pago";
      acciones.append(estadoPago);
    }

    tarjeta.append(acciones);
    return tarjeta;
  }

  function renderColumna(contenedor, pedidos) {
    if (pedidos.length === 0) {
      const vacio = document.createElement("p");
      vacio.className = "columna-cocina__vacio";
      vacio.textContent = "No hay pedidos en esta etapa.";
      contenedor.replaceChildren(vacio);
      return;
    }

    const fragmento = document.createDocumentFragment();
    pedidos.forEach((pedido) => fragmento.append(crearTarjeta(pedido)));
    contenedor.replaceChildren(fragmento);
  }

  function render() {
    const pedidos = estado
      .obtenerPedidos()
      .filter(
        (pedido) =>
          pedido.estadoPedido !== "cerrado" && pedido.estadoPago === "pagado"
      );
    const pendientes = pedidos.filter((pedido) => pedido.estadoPedido === "recibido");
    const preparando = pedidos.filter((pedido) => pedido.estadoPedido === "preparando");
    const listos = pedidos.filter((pedido) =>
      ["listo", "entregado"].includes(pedido.estadoPedido)
    );

    renderColumna(contenedores.recibido, pendientes);
    renderColumna(contenedores.preparando, preparando);
    renderColumna(contenedores.listo, listos);
    document.querySelector("#cantidad-pendientes").textContent = pendientes.length;
    document.querySelector("#cantidad-preparando").textContent = preparando.length;
    document.querySelector("#cantidad-listos").textContent = listos.length;
    document.querySelector("#cocina-actualizacion").textContent = `Actualizado ${hora(
      new Date()
    )}`;
  }

  document.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-nuevo-estado]");
    if (!boton) {
      return;
    }

    const nombres = {
      preparando: "Pedido en preparación.",
      listo: "Pedido listo para entregar.",
      entregado: "Pedido entregado; queda pendiente de pago."
    };
    estado.actualizarPedido(boton.dataset.pedidoCodigo, {
      estadoPedido: boton.dataset.nuevoEstado
    });
    mostrarNotificacion(nombres[boton.dataset.nuevoEstado]);
  });

  estado.suscribirse(render);
  window.setInterval(render, 30000);
  render();
})();
