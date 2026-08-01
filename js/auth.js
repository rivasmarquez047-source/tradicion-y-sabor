(function configurarAccesoInterno() {
  "use strict";

  const CLAVE_SESION = "dmarco_acceso_interno";
  const DURACION_SESION = 2 * 60 * 60 * 1000;
  const HASH_CLAVE = "b0a2685f7a82f67f08aa94f66d49228e991ab9829926b07ce987cffd6792793a";
  const VISTAS_PROTEGIDAS = new Set(["caja.html", "cocina.html", "admin.html"]);
  const DESTINOS = {
    caja: "caja.html",
    cocina: "cocina.html",
    admin: "admin.html"
  };

  function archivoActual() {
    return window.location.pathname.split("/").pop().toLowerCase() || "index.html";
  }

  function leerSesion() {
    try {
      const sesion = JSON.parse(sessionStorage.getItem(CLAVE_SESION) || "null");
      if (!sesion || sesion.autorizado !== true || Number(sesion.expira) <= Date.now()) {
        sessionStorage.removeItem(CLAVE_SESION);
        return null;
      }
      return sesion;
    } catch (error) {
      return null;
    }
  }

  function sesionActiva() {
    return Boolean(leerSesion());
  }

  function iniciarSesion() {
    const sesion = {
      autorizado: true,
      inicio: Date.now(),
      expira: Date.now() + DURACION_SESION
    };
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    return sesion;
  }

  function cerrarSesion() {
    try {
      sessionStorage.removeItem(CLAVE_SESION);
    } catch (error) {
      // Si el navegador bloquea el almacenamiento, el redireccionamiento sigue funcionando.
    }
  }

  function destinoSeguro(destino) {
    return DESTINOS[destino] || DESTINOS.caja;
  }

  async function validarClave(clave) {
    if (!window.crypto?.subtle || typeof TextEncoder === "undefined") {
      throw new Error("Este navegador no permite validar el acceso de forma segura.");
    }

    const datos = new TextEncoder().encode(clave);
    const resumen = await window.crypto.subtle.digest("SHA-256", datos);
    const hash = Array.from(new Uint8Array(resumen))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    return hash === HASH_CLAVE;
  }

  window.DMarcoAuth = {
    cerrarSesion,
    destinoSeguro,
    iniciarSesion,
    sesionActiva,
    validarClave
  };

  const pagina = archivoActual();
  if (VISTAS_PROTEGIDAS.has(pagina) && !sesionActiva()) {
    const destino = pagina.replace(".html", "");
    window.location.replace(`acceso.html?destino=${encodeURIComponent(destino)}`);
    return;
  }

  document.documentElement.classList.remove("acceso-verificando");

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-cerrar-sesion]").forEach((boton) => {
      boton.addEventListener("click", (evento) => {
        evento.preventDefault();
        cerrarSesion();
        window.location.replace("acceso.html?sesion=cerrada");
      });
    });
  });
})();
