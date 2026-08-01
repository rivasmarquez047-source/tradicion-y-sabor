/*
 * Estado compartido de la demostración.
 * Cliente, caja, cocina y administración usan las mismas claves de localStorage.
 */

(function crearEstadoCompartido() {
  "use strict";

  const CLAVES = {
    pedidos: "tradicion-sabor-pedidos-v3",
    productos: "tradicion-sabor-productos-v3"
  };

  const ESTADOS_PEDIDO = ["recibido", "preparando", "listo", "entregado", "cerrado"];
  const ESTADOS_PAGO = ["pendiente", "validacion", "pagado"];

  function clonar(valor) {
    return JSON.parse(JSON.stringify(valor));
  }

  function leer(clave, respaldo) {
    try {
      const valor = JSON.parse(localStorage.getItem(clave));
      return valor ?? clonar(respaldo);
    } catch {
      return clonar(respaldo);
    }
  }

  function guardar(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
    document.dispatchEvent(
      new CustomEvent("estado:actualizado", {
        detail: { clave }
      })
    );
  }

  function obtenerProductosBase() {
    const datos = window.DATOS_SITIO || { menus: [], adicionales: [] };
    return [...datos.menus, ...datos.adicionales];
  }

  function obtenerAjustesProductos() {
    return leer(CLAVES.productos, {});
  }

  function obtenerStockInicial(producto) {
    const stockDefinido = Number(producto.stock);
    if (Number.isFinite(stockDefinido) && stockDefinido >= 0) {
      return Math.floor(stockDefinido);
    }
    return producto.categoria === "menu" ? 20 : 30;
  }

  function obtenerCatalogo() {
    const ajustes = obtenerAjustesProductos();

    return obtenerProductosBase().map((producto) => {
      const ajuste = ajustes[producto.id] || {};
      const gruposDesactivados = new Set(ajuste.gruposDesactivados || []);
      const personalizacion = (producto.personalizacion || []).filter(
        (grupo) => !gruposDesactivados.has(grupo.id)
      );
      const stockAjustado = Number(ajuste.stock);
      const stock =
        Number.isFinite(stockAjustado) && stockAjustado >= 0
          ? Math.floor(stockAjustado)
          : obtenerStockInicial(producto);
      const disponibleConfigurado =
        typeof ajuste.disponible === "boolean" ? ajuste.disponible : producto.disponible;

      return {
        ...clonar(producto),
        precio:
          Number.isFinite(Number(ajuste.precio)) && Number(ajuste.precio) >= 0
            ? Number(ajuste.precio)
            : producto.precio,
        stock,
        disponible: disponibleConfigurado && stock > 0,
        personalizacion
      };
    });
  }

  function obtenerProducto(id) {
    return obtenerCatalogo().find((producto) => producto.id === id) || null;
  }

  function actualizarProducto(id, cambios) {
    const ajustes = obtenerAjustesProductos();
    ajustes[id] = {
      ...(ajustes[id] || {}),
      ...cambios
    };
    guardar(CLAVES.productos, ajustes);
    return obtenerProducto(id);
  }

  function restaurarProductos() {
    guardar(CLAVES.productos, {});
  }

  function obtenerPedidos() {
    const pedidos = leer(CLAVES.pedidos, []);
    return Array.isArray(pedidos)
      ? pedidos
          .filter((pedido) => pedido && pedido.codigo)
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      : [];
  }

  function crearCodigoPedido() {
    const ahora = new Date();
    const fecha = `${String(ahora.getFullYear()).slice(-2)}${String(
      ahora.getMonth() + 1
    ).padStart(2, "0")}${String(ahora.getDate()).padStart(2, "0")}`;
    const hora = `${String(ahora.getHours()).padStart(2, "0")}${String(
      ahora.getMinutes()
    ).padStart(2, "0")}`;
    const aleatorio = String(Math.floor(Math.random() * 900) + 100);
    return `TS-${fecha}-${hora}-${aleatorio}`;
  }

  function crearPedido(datosPedido) {
    const pedidos = obtenerPedidos();
    const cantidades = new Map();
    (datosPedido.productos || []).forEach((producto) => {
      const id = producto.productoId || producto.id;
      cantidades.set(id, (cantidades.get(id) || 0) + Number(producto.cantidad || 0));
    });

    const catalogo = obtenerCatalogo();
    const sinStock = [...cantidades.entries()].some(([id, cantidad]) => {
      const producto = catalogo.find((item) => item.id === id);
      return !producto || !producto.disponible || cantidad <= 0 || cantidad > producto.stock;
    });
    if (sinStock || cantidades.size === 0) {
      return null;
    }

    const tipoPedido = datosPedido.tipoPedido === "delivery" ? "delivery" : "local";
    const recargoDelivery =
      tipoPedido === "delivery" ? Number(datosPedido.recargoDelivery) || 0 : 0;
    const total = Number(datosPedido.total) || 0;
    const pedido = {
      codigo: crearCodigoPedido(),
      tipoPedido,
      mesa: tipoPedido === "local" ? String(datosPedido.mesa || "") : "",
      paraLlevar: tipoPedido === "local" && Boolean(datosPedido.paraLlevar),
      entrega:
        tipoPedido === "delivery"
          ? clonar(datosPedido.entrega || {})
          : null,
      fecha: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
      productos: clonar(datosPedido.productos || []),
      subtotal:
        Number.isFinite(Number(datosPedido.subtotal)) && Number(datosPedido.subtotal) >= 0
          ? Number(datosPedido.subtotal)
          : Math.max(0, total - recargoDelivery),
      recargoDelivery,
      total,
      indicaciones: datosPedido.indicaciones || "",
      estadoPedido: "recibido",
      estadoPago:
        datosPedido.estadoPago === "pagado"
          ? "pagado"
          : datosPedido.estadoPago === "validacion"
            ? "validacion"
            : "pendiente",
      pagoAnticipado: Boolean(datosPedido.pagoAnticipado),
      metodoPago: datosPedido.metodoPago || "",
      numeroOperacion: datosPedido.numeroOperacion || "",
      fechaPagoEnviado: datosPedido.fechaPagoEnviado || "",
      comprobante: clonar(
        datosPedido.comprobante || {
          numero: "",
          fecha: datosPedido.fechaPagoEnviado || "",
          tipo: "Comprobante demostrativo de pedido",
          copiaCaja: true
        }
      ),
      montoRecibido: null,
      vuelto: null,
      historial: [
        {
          estado: "recibido",
          fecha: new Date().toISOString()
        }
      ]
    };

    const ajustes = obtenerAjustesProductos();
    cantidades.forEach((cantidad, id) => {
      const producto = catalogo.find((item) => item.id === id);
      ajustes[id] = {
        ...(ajustes[id] || {}),
        stock: Math.max(0, producto.stock - cantidad)
      };
    });

    pedidos.unshift(pedido);
    guardar(CLAVES.productos, ajustes);
    guardar(CLAVES.pedidos, pedidos);
    return clonar(pedido);
  }

  function actualizarPedido(codigo, cambios) {
    const pedidos = obtenerPedidos();
    const indice = pedidos.findIndex((pedido) => pedido.codigo === codigo);

    if (indice < 0) {
      return null;
    }

    const pedidoActual = pedidos[indice];
    const nuevoEstado = cambios.estadoPedido;
    const historial = [...(pedidoActual.historial || [])];

    if (nuevoEstado && nuevoEstado !== pedidoActual.estadoPedido) {
      historial.push({
        estado: nuevoEstado,
        fecha: new Date().toISOString()
      });
    }

    pedidos[indice] = {
      ...pedidoActual,
      ...clonar(cambios),
      historial,
      actualizadoEn: new Date().toISOString()
    };

    guardar(CLAVES.pedidos, pedidos);
    return clonar(pedidos[indice]);
  }

  function obtenerPedido(codigo) {
    return obtenerPedidos().find((pedido) => pedido.codigo === codigo) || null;
  }

  function suscribirse(callback) {
    const alActualizar = () => callback();
    const alCambiarStorage = (evento) => {
      if (Object.values(CLAVES).includes(evento.key)) {
        callback();
      }
    };

    document.addEventListener("estado:actualizado", alActualizar);
    window.addEventListener("storage", alCambiarStorage);

    return () => {
      document.removeEventListener("estado:actualizado", alActualizar);
      window.removeEventListener("storage", alCambiarStorage);
    };
  }

  window.ESTADO_APP = {
    CLAVES,
    ESTADOS_PEDIDO,
    ESTADOS_PAGO,
    obtenerCatalogo,
    obtenerProducto,
    actualizarProducto,
    restaurarProductos,
    obtenerPedidos,
    obtenerPedido,
    crearPedido,
    actualizarPedido,
    suscribirse
  };
})();
