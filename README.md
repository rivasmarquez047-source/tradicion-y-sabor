# D'MARCO P.MEDRANO

Sitio web estático y adaptable para presentar una propuesta gastronómica inspirada en la cocina
criolla de Ica.

## Funciones incluidas

- Carta dinámica con 6 menús caseros, 3 porciones adicionales y 4 gaseosas.
- Cada menú incluye una sopa y un refresco de la casa.
- El cliente puede pedir el menú sin sopa o sin refresco, o agregar sopa,
  ensalada o refresco extra con el recargo correspondiente.
- Fotografías originales e individuales para cada producto.
- Carruseles horizontales con controles y desplazamiento táctil.
- Ventana de detalles con ingredientes y alérgenos.
- Carrito con cantidades, subtotal, recargo de delivery y almacenamiento local.
- Elección entre consumo en mesa o delivery con datos de contacto, dirección,
  distrito, referencia e indicaciones.
- Recargo demostrativo de delivery configurado en S/ 5.00.
- Flujo en dos pasos: primero se confirma el pedido y después aparece el pago.
- Pago anticipado en mesa mediante Yape, Plin, tarjeta demostrativa o efectivo en Caja.
- Pago de delivery limitado a Yape y Plin, con número de operación.
- Comprobante para el cliente y copia local en Caja para validación y reclamos.
- Validación manual en Caja antes de enviar el pedido a Cocina.
- Acceso interno con contraseña para Caja, Cocina y Administración.
- Bloqueo de las vistas internas cuando no existe una sesión autorizada.
- Formulario para registrar un pedido demostrativo y copiar su resumen.
- Envío por WhatsApp listo para habilitar cuando se coloque el número real.
- Servicios, historia, contacto, diseño adaptable y animaciones accesibles.

## Información provisional

La carta, los precios, la historia y los datos del negocio son demostrativos. Cuando el
restaurante entregue su información real, se reemplazan principalmente desde `js/data.js`.

Para habilitar WhatsApp, escribe el número con código de país y solo dígitos:

```js
whatsapp: "51962823566"
```

## Archivos principales

- `index.html`: estructura y textos de las secciones.
- `js/data.js`: productos, ingredientes, precios, servicios y datos del negocio.
- `js/app.js`: creación de tarjetas, filtros, menú y carruseles.
- `js/modal.js`: ventana de ingredientes.
- `js/cart.js`: carrito y registro local del pedido.
- `css/styles.css`: diseño general.
- `css/responsive.css`: adaptación a tablet y celular.
- `css/animations.css`: movimiento y efectos visuales.

## Flujo demostrativo del restaurante

La página pública continúa siendo `index.html`. Para abrir el acceso interno, presiona
`Alt + D` o visita `acceso.html`.

La contraseña demostrativa inicial es `DMarco2026`. El acceso permanece activo durante
dos horas en la pestaña actual y puede cerrarse desde cualquiera de las vistas internas.

- `index.html`: cliente, personalización opcional, carrito, mesa y confirmación.
- `cocina.html`: pedidos con pago validado, en preparación, listos y entregados.
- `caja.html`: validación manual del pago, entrega, cierre e impresión.
- `admin.html`: precios, disponibilidad, opciones de personalización y reportes.

Las vistas se sincronizan en el mismo navegador mediante `localStorage` y la sesión de
acceso utiliza `sessionStorage`. Es una demostración estática: no incluye servidor,
usuarios reales, pagos reales ni base de datos. Para probar el flujo completo:

1. Confirma los productos y el tipo de pedido desde Cliente.
2. Selecciona el método disponible y genera el comprobante anticipado.
3. Presiona `Alt + D`, ingresa la contraseña y abre Caja.
4. Revisa la copia del comprobante y valida el pago en Caja.
5. Cambia el estado del pedido ya pagado en Cocina.
6. Marca la entrega o cierre desde Caja.
7. Revisa los indicadores en Administración.

El código QR, el titular y los datos de pago son demostrativos. La página no se
conecta con Yape ni Plin. El pago con tarjeta también es una simulación, porque un
cargo bancario real necesita una pasarela de pago y un servicio seguro.

Para reiniciar únicamente los cambios del catálogo, usa **Restaurar datos originales**
en Administración.

## Publicar cambios en GitHub

```bash
git add .
git commit -m "Agregar personalización y paneles operativos"
git push
```
