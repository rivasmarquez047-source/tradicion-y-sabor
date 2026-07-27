(function iniciarAdministracion() {
  "use strict";

  const estado = window.ESTADO_APP;
  const datos = window.DATOS_SITIO;
  if (!estado || !datos) {
    return;
  }

  const contenedorProductos = document.querySelector("#productos-admin");
  const panelOpciones = document.querySelector("#admin-opciones");
  const capaOpciones = document.querySelector("#admin-opciones-capa");
  const tituloOpciones = document.querySelector("#admin-opciones-titulo");
  const cuerpoOpciones = document.querySelector("#admin-opciones-cuerpo");
  const notificacion = document.querySelector("#notificacion-admin");
  let filtro = "todos";
  let productoSeleccionado = null;
  let temporizador;

  const formatearPrecio = (precio) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2
    }).format(precio);

  function productoBase(id) {
    return [...datos.platillos, ...datos.bebidas].find((producto) => producto.id === id);
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
    const pagados = pedidos.filter((pedido) => pedido.estadoPago === "pagado");
    const mesas = new Set(pedidos.map((pedido) => pedido.mesa));
    document.querySelector("#admin-total-pedidos").textContent = pedidos.length;
    document.querySelector("#admin-ventas").textContent = formatearPrecio(
      pagados.reduce((total, pedido) => total + pedido.total, 0)
    );
    document.querySelector("#admin-mesas").textContent = mesas.size;
    document.querySelector("#admin-pagados").textContent = pagados.length;
    document.querySelector("#admin-pendientes").textContent = pedidos.filter(
      (pedido) => pedido.estadoPago === "pendiente"
    ).length;
  }

  function crearTarjetaProducto(producto) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "producto-admin";
    tarjeta.dataset.categoria = producto.categoria;

    const imagen = document.createElement("img");
    imagen.src = producto.imagen;
    imagen.alt = "";
    imagen.loading = "lazy";

    const contenido = document.createElement("div");
    contenido.className = "producto-admin__contenido";
    const categoria = document.createElement("span");
    categoria.className = "producto-admin__categoria";
    categoria.textContent = producto.categoria === "platillo" ? "Platillo" : "Bebida";
    const titulo = document.createElement("h3");
    titulo.textContent = producto.nombre;

    const formularioPrecio = document.createElement("form");
    formularioPrecio.className = "producto-admin__precio";
    formularioPrecio.dataset.productoPrecio = producto.id;
    const etiquetaPrecio = document.createElement("label");
    etiquetaPrecio.textContent = "Precio";
    const entradaPrecio = document.createElement("input");
    entradaPrecio.type = "number";
    entradaPrecio.name = "precio";
    entradaPrecio.min = "0";
    entradaPrecio.step = "0.50";
    entradaPrecio.value = producto.precio;
    entradaPrecio.setAttribute("aria-label", `Precio de ${producto.nombre}`);
    const guardar = document.createElement("button");
    guardar.className = "boton-tabla";
    guardar.type = "submit";
    guardar.textContent = "Guardar";
    etiquetaPrecio.append(entradaPrecio);
    formularioPrecio.append(etiquetaPrecio, guardar);

    const disponibilidad = document.createElement("label");
    disponibilidad.className = "interruptor-admin";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = producto.disponible;
    checkbox.dataset.disponibilidadProducto = producto.id;
    checkbox.setAttribute("aria-label", `Disponibilidad de ${producto.nombre}`);
    const textoDisponibilidad = document.createElement("span");
    textoDisponibilidad.textContent = producto.disponible ? "Disponible" : "Agotado";
    disponibilidad.append(checkbox, textoDisponibilidad);

    const base = productoBase(producto.id);
    const opciones = document.createElement("p");
    opciones.className = "producto-admin__opciones";
    opciones.textContent = base.personalizacion?.length
      ? `${producto.personalizacion.length} de ${base.personalizacion.length} grupos de personalización activos`
      : "Sin opciones de personalización";

    const editar = document.createElement("button");
    editar.className = "boton boton--secundario";
    editar.type = "button";
    editar.dataset.editarOpciones = producto.id;
    editar.textContent = "Editar opciones";
    editar.disabled = !base.personalizacion?.length;

    contenido.append(
      categoria,
      titulo,
      formularioPrecio,
      disponibilidad,
      opciones,
      editar
    );
    tarjeta.append(imagen, contenido);
    return tarjeta;
  }

  function renderProductos() {
    const productos = estado
      .obtenerCatalogo()
      .filter((producto) => filtro === "todos" || producto.categoria === filtro);

    const fragmento = document.createDocumentFragment();
    productos.forEach((producto) => fragmento.append(crearTarjetaProducto(producto)));
    contenedorProductos.replaceChildren(fragmento);
  }

  function renderRanking(pedidos) {
    const cantidades = new Map();
    pedidos.forEach((pedido) => {
      pedido.productos.forEach((producto) => {
        cantidades.set(
          producto.nombre,
          (cantidades.get(producto.nombre) || 0) + producto.cantidad
        );
      });
    });

    const ranking = [...cantidades.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    const contenedor = document.querySelector("#ranking-productos");

    if (ranking.length === 0) {
      const vacio = document.createElement("li");
      vacio.textContent = "Todavía no hay productos solicitados.";
      contenedor.replaceChildren(vacio);
      return;
    }

    contenedor.replaceChildren(
      ...ranking.map(([nombre, cantidad], indice) => {
        const item = document.createElement("li");
        const posicion = document.createElement("span");
        posicion.textContent = String(indice + 1);
        const texto = document.createElement("strong");
        texto.textContent = nombre;
        const total = document.createElement("em");
        total.textContent = `${cantidad} unidades`;
        item.append(posicion, texto, total);
        return item;
      })
    );
  }

  function renderMetodos(pedidos) {
    const metodos = ["yape", "plin", "tarjeta", "efectivo"];
    const contenedor = document.querySelector("#reporte-metodos");
    contenedor.replaceChildren(
      ...metodos.map((metodo) => {
        const pedidosMetodo = pedidos.filter(
          (pedido) => pedido.estadoPago === "pagado" && pedido.metodoPago === metodo
        );
        const tarjeta = document.createElement("article");
        const nombre = document.createElement("span");
        nombre.textContent = metodo.charAt(0).toUpperCase() + metodo.slice(1);
        const total = document.createElement("strong");
        total.textContent = formatearPrecio(
          pedidosMetodo.reduce((suma, pedido) => suma + pedido.total, 0)
        );
        const cantidad = document.createElement("small");
        cantidad.textContent = `${pedidosMetodo.length} pagos`;
        tarjeta.append(nombre, total, cantidad);
        return tarjeta;
      })
    );
  }

  function abrirOpciones(id) {
    productoSeleccionado = id;
    const base = productoBase(id);
    const actual = estado.obtenerProducto(id);
    const activos = new Set((actual.personalizacion || []).map((grupo) => grupo.id));
    tituloOpciones.textContent = base.nombre;

    const formulario = document.createElement("form");
    formulario.className = "formulario-operativo";
    formulario.id = "formulario-opciones-producto";
    formulario.dataset.productoId = id;
    const explicacion = document.createElement("p");
    explicacion.textContent =
      "Activa únicamente los grupos de personalización que estarán disponibles para el cliente.";
    formulario.append(explicacion);

    (base.personalizacion || []).forEach((grupo) => {
      const etiqueta = document.createElement("label");
      etiqueta.className = "opcion-admin";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "grupo";
      checkbox.value = grupo.id;
      checkbox.checked = activos.has(grupo.id);
      const texto = document.createElement("span");
      texto.textContent = grupo.etiqueta;
      const valores = document.createElement("small");
      valores.textContent = grupo.opciones
        .filter((opcion) => opcion.valor !== "original")
        .map((opcion) => opcion.texto)
        .join(" · ");
      etiqueta.append(checkbox, texto, valores);
      formulario.append(etiqueta);
    });

    const guardar = document.createElement("button");
    guardar.className = "boton boton--principal";
    guardar.type = "submit";
    guardar.textContent = "Guardar opciones";
    formulario.append(guardar);
    cuerpoOpciones.replaceChildren(formulario);
    capaOpciones.hidden = false;
    panelOpciones.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
      capaOpciones.classList.add("carrito-capa--visible");
      panelOpciones.classList.add("abierto");
    });
  }

  function cerrarOpciones() {
    panelOpciones.classList.remove("abierto");
    capaOpciones.classList.remove("carrito-capa--visible");
    panelOpciones.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      capaOpciones.hidden = true;
      productoSeleccionado = null;
    }, 220);
  }

  function render() {
    const pedidos = estado.obtenerPedidos();
    renderMetricas(pedidos);
    renderProductos();
    renderRanking(pedidos);
    renderMetodos(pedidos);
  }

  document.addEventListener("click", (evento) => {
    const filtroBoton = evento.target.closest("[data-filtro-admin]");
    const editar = evento.target.closest("[data-editar-opciones]");

    if (filtroBoton) {
      filtro = filtroBoton.dataset.filtroAdmin;
      document.querySelectorAll("[data-filtro-admin]").forEach((boton) => {
        boton.classList.toggle("activo", boton === filtroBoton);
      });
      renderProductos();
    }

    if (editar) {
      abrirOpciones(editar.dataset.editarOpciones);
    }

    if (
      evento.target.closest("#cerrar-admin-opciones") ||
      evento.target === capaOpciones
    ) {
      cerrarOpciones();
    }

    if (evento.target.closest("#restaurar-productos")) {
      estado.restaurarProductos();
      mostrarNotificacion("Precios, disponibilidad y opciones restaurados.");
    }
  });

  document.addEventListener("change", (evento) => {
    const checkbox = evento.target.closest("[data-disponibilidad-producto]");
    if (!checkbox) {
      return;
    }
    estado.actualizarProducto(checkbox.dataset.disponibilidadProducto, {
      disponible: checkbox.checked
    });
    mostrarNotificacion(checkbox.checked ? "Producto disponible." : "Producto agotado.");
  });

  document.addEventListener("submit", (evento) => {
    const formularioPrecio = evento.target.closest("[data-producto-precio]");
    if (formularioPrecio) {
      evento.preventDefault();
      const precio = Number(new FormData(formularioPrecio).get("precio"));
      estado.actualizarProducto(formularioPrecio.dataset.productoPrecio, { precio });
      mostrarNotificacion("Precio actualizado.");
      return;
    }

    if (evento.target.id === "formulario-opciones-producto") {
      evento.preventDefault();
      const formulario = evento.target;
      const base = productoBase(formulario.dataset.productoId);
      const activos = new Set(
        [...formulario.querySelectorAll('input[name="grupo"]:checked')].map(
          (entrada) => entrada.value
        )
      );
      const gruposDesactivados = (base.personalizacion || [])
        .map((grupo) => grupo.id)
        .filter((id) => !activos.has(id));
      estado.actualizarProducto(formulario.dataset.productoId, {
        gruposDesactivados
      });
      cerrarOpciones();
      mostrarNotificacion("Opciones de personalización actualizadas.");
    }
  });

  estado.suscribirse(render);
  render();
})();
