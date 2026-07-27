# Tradición & Sabor

Sitio web estático y adaptable para presentar una propuesta gastronómica inspirada en la cocina
criolla de Ica.

## Funciones incluidas

- Carta dinámica con 6 platillos y 6 bebidas.
- Fotografías originales e individuales para cada producto.
- Carruseles horizontales con controles y desplazamiento táctil.
- Ventana de detalles con ingredientes y alérgenos.
- Carrito con cantidades, total y almacenamiento local.
- Formulario para registrar un pedido demostrativo y copiar su resumen.
- Envío por WhatsApp listo para habilitar cuando se coloque el número real.
- Servicios, historia, contacto, diseño adaptable y animaciones accesibles.

## Información provisional

La carta, los precios, la historia y los datos del negocio son demostrativos. Cuando el
restaurante entregue su información real, se reemplazan principalmente desde `js/data.js`.

Para habilitar WhatsApp, escribe el número con código de país y solo dígitos:

```js
whatsapp: "51999999999"
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

## Publicar cambios en GitHub

```bash
git add .
git commit -m "Actualizar carta, imágenes y carrito"
git push
```
