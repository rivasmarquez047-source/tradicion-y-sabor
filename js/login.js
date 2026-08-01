(function configurarFormularioAcceso() {
  "use strict";

  function iniciar() {
    const formulario = document.querySelector("#formulario-acceso");
    const clave = document.querySelector("#clave-acceso");
    const alternarClave = document.querySelector("#alternar-clave");
    const mensaje = document.querySelector("#mensaje-acceso");
    const botonIngresar = document.querySelector("#boton-ingresar");

    if (!formulario || !window.DMarcoAuth) {
      return;
    }

    const parametros = new URLSearchParams(window.location.search);
    const destinoSolicitado = parametros.get("destino");
    const destinosPermitidos = ["caja", "cocina", "admin"];
    const selectorDestino = destinosPermitidos.includes(destinoSolicitado)
      ? formulario.querySelector(`input[name="vista"][value="${destinoSolicitado}"]`)
      : null;

    if (selectorDestino) {
      selectorDestino.checked = true;
    }

    if (parametros.get("sesion") === "cerrada") {
      mostrarMensaje("Sesión cerrada correctamente.", "exito");
    } else if (window.DMarcoAuth.sesionActiva()) {
      mostrarMensaje("Ya tienes una sesión activa. Puedes ingresar a otra vista.", "informacion");
    }

    function mostrarMensaje(texto, tipo = "error") {
      mensaje.textContent = texto;
      mensaje.dataset.tipo = tipo;
      mensaje.hidden = false;
    }

    function ocultarMensaje() {
      mensaje.hidden = true;
      mensaje.textContent = "";
      delete mensaje.dataset.tipo;
    }

    alternarClave.addEventListener("click", () => {
      const mostrar = clave.type === "password";
      clave.type = mostrar ? "text" : "password";
      alternarClave.textContent = mostrar ? "Ocultar" : "Mostrar";
      alternarClave.setAttribute("aria-pressed", String(mostrar));
      clave.focus();
    });

    clave.addEventListener("input", ocultarMensaje);

    formulario.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      ocultarMensaje();

      const datos = new FormData(formulario);
      const destino = String(datos.get("vista") || "caja");
      const valorClave = String(datos.get("clave") || "");

      botonIngresar.disabled = true;
      botonIngresar.textContent = "Verificando…";
      formulario.setAttribute("aria-busy", "true");

      try {
        const esCorrecta = await window.DMarcoAuth.validarClave(valorClave);

        if (!esCorrecta) {
          formulario.classList.remove("acceso-formulario--error");
          void formulario.offsetWidth;
          formulario.classList.add("acceso-formulario--error");
          mostrarMensaje("La contraseña no es correcta. Inténtalo nuevamente.");
          clave.value = "";
          clave.focus();
          return;
        }

        window.DMarcoAuth.iniciarSesion();
        mostrarMensaje("Acceso correcto. Abriendo el panel…", "exito");
        window.setTimeout(() => {
          window.location.assign(window.DMarcoAuth.destinoSeguro(destino));
        }, 350);
      } catch (error) {
        mostrarMensaje(error.message || "No fue posible comprobar la contraseña.");
      } finally {
        formulario.removeAttribute("aria-busy");
        botonIngresar.disabled = false;
        botonIngresar.textContent = "Ingresar al panel";
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar, { once: true });
  } else {
    iniciar();
  }
})();
