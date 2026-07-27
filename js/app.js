/*
 * ============================================================
 * RENDERIZADO DEL CONTENIDO
 * ============================================================
 * Este archivo convierte los objetos de js/data.js en elementos
 * visibles. Las tarjetas no se repiten manualmente en index.html.
 */

(function iniciarAplicacion() {
  "use strict";

  const datos = window.DATOS_SITIO;

  if (!datos) {
    console.error("No se encontró DATOS_SITIO. Comprueba que js/data.js cargue antes que js/app.js.");
    return;
  }

  const todosLosProductos = [...datos.platillos, ...datos.bebidas];

  /**
   * Convierte un número al formato monetario de Perú.
   * Ejemplo: 28 se muestra como S/ 28.00.
   */
  function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2
    }).format(precio);
  }

  /**
   * Crea una imagen con carga diferida y respaldo visual.
   */
  function crearImagen({ origen, textoAlternativo, respaldo, clase }) {
    const imagen = document.createElement("img");
    imagen.className = clase;
    imagen.src = origen;
    imagen.alt = textoAlternativo;
    imagen.loading = "lazy";
    imagen.decoding = "async";
    imagen.width = 768;
    imagen.height = 512;

    imagen.addEventListener("error", () => {
      if (imagen.dataset.respaldoAplicado === "true" || origen === respaldo) {
        imagen.remove();
        return;
      }

      imagen.dataset.respaldoAplicado = "true";
      imagen.src = respaldo;
    });

    return imagen;
  }

  /**
   * Construye una tarjeta de platillo o bebida.
   */
  function crearTarjetaProducto(producto, indice = 0) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-producto";
    tarjeta.dataset.categoria = producto.categoria;
    tarjeta.dataset.productoId = producto.id;
    tarjeta.style.setProperty("--indice", indice);

    const imagenContenedor = document.createElement("div");
    imagenContenedor.className = "tarjeta-producto__imagen-contenedor";

    const rutaRespaldo =
      producto.categoria === "bebida"
        ? "assets/images/bebidas/categoria-bebidas.png"
        : "assets/images/platillos/categoria-platillos.png";

    const imagen = crearImagen({
      origen: producto.imagen,
      textoAlternativo: `Presentación demostrativa de ${producto.nombre}`,
      respaldo: rutaRespaldo,
      clase: "tarjeta-producto__imagen"
    });

    const categoria = document.createElement("span");
    categoria.className = "tarjeta-producto__categoria";
    categoria.textContent =
      producto.subcategoria || (producto.categoria === "bebida" ? "Bebida" : "Platillo");

    imagenContenedor.append(imagen, categoria);

    const contenido = document.createElement("div");
    contenido.className = "tarjeta-producto__contenido";

    const encabezado = document.createElement("div");
    encabezado.className = "tarjeta-producto__encabezado";

    const nombre = document.createElement("h4");
    nombre.textContent = producto.nombre;

    const precio = document.createElement("span");
    precio.className = "tarjeta-producto__precio";
    precio.textContent = formatearPrecio(producto.precio);

    encabezado.append(nombre, precio);

    const descripcion = document.createElement("p");
    descripcion.className = "tarjeta-producto__descripcion";
    descripcion.textContent = producto.descripcion;

    const acciones = document.createElement("div");
    acciones.className = "tarjeta-producto__acciones";

    const botonIngredientes = document.createElement("button");
    botonIngredientes.className = "boton boton--secundario boton-ingredientes";
    botonIngredientes.type = "button";
    botonIngredientes.dataset.productoId = producto.id;
    botonIngredientes.textContent = "Ver ingredientes";
    botonIngredientes.setAttribute("aria-label", `Ver ingredientes de ${producto.nombre}`);

    const botonPedido = document.createElement("button");
    botonPedido.className = "boton boton--principal boton-pedir";
    botonPedido.type = "button";
    botonPedido.dataset.productoId = producto.id;
    botonPedido.dataset.accion = "agregar-carrito";
    botonPedido.textContent = producto.disponible ? "Agregar" : "No disponible";
    botonPedido.disabled = !producto.disponible;
    botonPedido.setAttribute("aria-label", `Agregar ${producto.nombre} a mi pedido`);

    acciones.append(botonIngredientes, botonPedido);
    contenido.append(encabezado, descripcion, acciones);
    tarjeta.append(imagenContenedor, contenido);

    return tarjeta;
  }

  /**
   * Construye una tarjeta de servicio.
   */
  function crearTarjetaServicio(servicio, indice = 0) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-servicio";
    tarjeta.dataset.servicioId = servicio.id;
    tarjeta.style.setProperty("--indice", indice);

    const imagen = crearImagen({
      origen: servicio.imagen,
      textoAlternativo: `Imagen demostrativa del servicio ${servicio.titulo}`,
      respaldo: "assets/images/servicios/categoria-servicios.png",
      clase: "tarjeta-servicio__imagen"
    });
    imagen.style.objectPosition = servicio.posicionImagen || "center";

    const contenido = document.createElement("div");
    contenido.className = "tarjeta-servicio__contenido";

    const titulo = document.createElement("h3");
    titulo.textContent = servicio.titulo;

    const descripcion = document.createElement("p");
    descripcion.textContent = servicio.descripcion;

    const boton = document.createElement("button");
    boton.className = "boton boton--secundario boton-servicio";
    boton.type = "button";
    boton.dataset.servicioId = servicio.id;
    boton.dataset.whatsapp = "servicio";
    boton.textContent = servicio.disponible ? "Solicitar información" : "No disponible";
    boton.disabled = !servicio.disponible;
    boton.setAttribute("aria-label", `Solicitar información sobre ${servicio.titulo}`);

    contenido.append(titulo, descripcion, boton);
    tarjeta.append(imagen, contenido);

    return tarjeta;
  }

  /**
   * Inserta una colección de tarjetas sin recargar la página.
   */
  function renderizarColeccion(contenedor, elementos, creadorDeTarjeta) {
    if (!contenedor) {
      return;
    }

    const fragmento = document.createDocumentFragment();
    elementos.forEach((elemento, indice) => fragmento.append(creadorDeTarjeta(elemento, indice)));
    contenedor.replaceChildren(fragmento);
  }

  function configurarFiltros() {
    const filtros = document.querySelectorAll(".filtro");
    const grupos = document.querySelectorAll("[data-grupo]");
    const mensaje = document.querySelector("#mensaje-sin-resultados");

    filtros.forEach((filtro) => {
      filtro.addEventListener("click", () => {
        const categoria = filtro.dataset.filtro;

        filtros.forEach((elemento) => {
          const activo = elemento === filtro;
          elemento.classList.toggle("activo", activo);
          elemento.setAttribute("aria-pressed", String(activo));
        });

        let visibles = 0;
        grupos.forEach((grupo) => {
          const mostrar = categoria === "todos" || grupo.dataset.grupo === categoria;
          grupo.hidden = !mostrar;
          if (mostrar) {
            visibles += grupo.querySelectorAll(".tarjeta-producto").length;
          }
        });

        if (mensaje) {
          mensaje.hidden = visibles > 0;
        }
      });
    });
  }

  function configurarCarruseles() {
    document.querySelectorAll("[data-carrusel]").forEach((boton) => {
      boton.addEventListener("click", () => {
        const carrusel = document.querySelector(boton.dataset.carrusel);
        const direccion = Number(boton.dataset.direccion) || 1;

        if (!carrusel) {
          return;
        }

        carrusel.scrollBy({
          left: direccion * carrusel.clientWidth * 0.88,
          behavior: "smooth"
        });
      });
    });
  }

  function configurarMenuMovil() {
    const boton = document.querySelector("#boton-menu");
    const menu = document.querySelector("#menu-principal");

    if (!boton || !menu) {
      return;
    }

    boton.addEventListener("click", () => {
      const abierto = boton.getAttribute("aria-expanded") === "true";
      boton.setAttribute("aria-expanded", String(!abierto));
      menu.classList.toggle("abierto", !abierto);
    });

    menu.addEventListener("click", (evento) => {
      if (evento.target.closest("a")) {
        boton.setAttribute("aria-expanded", "false");
        menu.classList.remove("abierto");
      }
    });
  }

  /**
   * Sustituye los marcadores del HTML por datos del negocio.
   */
  function aplicarDatosDelNegocio() {
    const negocio = datos.negocio;

    document.querySelectorAll("[data-negocio]").forEach((elemento) => {
      const propiedad = elemento.dataset.negocio;

      if (Object.prototype.hasOwnProperty.call(negocio, propiedad)) {
        elemento.textContent = negocio[propiedad];
      }

      if (propiedad === "correo" && elemento.tagName === "A") {
        elemento.href = `mailto:${negocio.correo}`;
      }

      if (propiedad === "telefono" && elemento.tagName === "A") {
        if (negocio.telefonoEnlace) {
          elemento.href = `tel:${negocio.telefonoEnlace}`;
        } else {
          elemento.removeAttribute("href");
          elemento.setAttribute("aria-disabled", "true");
        }
      }
    });

    document.querySelectorAll("[data-red-social]").forEach((enlace) => {
      const red = enlace.dataset.redSocial;
      const destino = negocio.redesSociales[red];

      if (destino && destino !== "#") {
        enlace.href = destino;
      } else {
        enlace.removeAttribute("href");
        enlace.setAttribute("aria-disabled", "true");
      }
    });

    document.querySelectorAll("[data-negocio-enlace]").forEach((enlace) => {
      const propiedad = enlace.dataset.negocioEnlace;
      const destino = negocio[propiedad];

      if (destino && destino !== "#") {
        enlace.href = destino;
      } else {
        enlace.removeAttribute("href");
        enlace.setAttribute("aria-disabled", "true");
      }
    });

    const anioActual = document.querySelector("#anio-actual");
    if (anioActual) {
      anioActual.textContent = new Date().getFullYear();
    }
  }

  function renderizarSitio() {
    aplicarDatosDelNegocio();
    configurarFiltros();
    configurarCarruseles();
    configurarMenuMovil();

    renderizarColeccion(
      document.querySelector("#lista-platillos"),
      datos.platillos,
      crearTarjetaProducto
    );

    renderizarColeccion(
      document.querySelector("#lista-bebidas"),
      datos.bebidas,
      crearTarjetaProducto
    );

    renderizarColeccion(
      document.querySelector("#lista-servicios"),
      datos.servicios,
      crearTarjetaServicio
    );

    document.dispatchEvent(
      new CustomEvent("contenidoDinamicoListo", {
        detail: {
          platillos: datos.platillos.length,
          bebidas: datos.bebidas.length,
          servicios: datos.servicios.length
        }
      })
    );
  }

  /**
   * Estas utilidades serán reutilizadas por filtros, modal y WhatsApp.
   */
  window.formatearPrecio = formatearPrecio;
  window.obtenerProductoPorId = function obtenerProductoPorId(id) {
    return todosLosProductos.find((producto) => producto.id === id) || null;
  };
  window.obtenerServicioPorId = function obtenerServicioPorId(id) {
    return datos.servicios.find((servicio) => servicio.id === id) || null;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderizarSitio, { once: true });
  } else {
    renderizarSitio();
  }
})();
