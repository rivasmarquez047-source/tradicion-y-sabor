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

## Flujo demostrativo del restaurante

La página pública continúa siendo `index.html`. Para mostrar el selector privado entre
vistas, abre `index.html?demo=1` o presiona `Alt + D`.

- `index.html`: cliente, personalización opcional, carrito, mesa y confirmación.
- `cocina.html`: pedidos pendientes, en preparación, listos y entregados.
- `caja.html`: entrega, cobro simulado, vuelto, cierre de mesa e impresión.
- `admin.html`: precios, disponibilidad, opciones de personalización y reportes.

Las vistas se sincronizan en el mismo navegador mediante `localStorage`. Es una
demostración estática: no incluye servidor, usuarios reales, pagos reales ni base de
datos. Para probar el flujo completo:

1. Registra un pedido desde Cliente.
2. Cambia su estado en Cocina.
3. Marca la entrega y registra el pago en Caja.
4. Revisa los indicadores en Administración.

Para reiniciar únicamente los cambios del catálogo, usa **Restaurar datos originales**
en Administración.

## Publicar cambios en GitHub

```bash
git add .
git commit -m "Agregar personalización y paneles operativos"
git push
```
