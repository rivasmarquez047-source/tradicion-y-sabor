/*
 * DATOS EDITABLES DEL SITIO
 * Contenido demostrativo para la tesis. Sustituye estos datos cuando
 * el restaurante entregue su carta, historia y datos de contacto reales.
 */

window.DATOS_SITIO = {
  provisional: true,

  negocio: {
    nombre: "Tradición & Sabor",
    eslogan: "Sabores de Ica que reúnen buenos momentos",
    fundacion: "2004",

    // Escribe el número real con código de país y solo dígitos.
    whatsapp: "",
    whatsappVisible: "Número por confirmar",
    telefono: "Teléfono por confirmar",
    telefonoEnlace: "",
    direccion: "Dirección del restaurante por confirmar, Ica, Perú",
    horario: "Horario de atención por confirmar",
    correo: "correo@ejemplo.com",
    comoLlegar: "#",

    redesSociales: {
      facebook: "#",
      instagram: "#"
    },

    mensajeGeneral:
      "Hola, deseo solicitar información sobre los productos y servicios del restaurante."
  },

  platillos: [
    {
      id: "carapulcra-sopa-seca",
      nombre: "Carapulcra con sopa seca",
      categoria: "platillo",
      subcategoria: "Tradición iqueña",
      precio: 36,
      imagen: "assets/images/platillos/platillo-1.png",
      descripcion:
        "El clásico mancha pecho de Ica: carapulcra de papa seca acompañada de tallarines sazonados.",
      ingredientes: [
        "Papa seca",
        "Carne de cerdo",
        "Maní tostado",
        "Ají panca",
        "Tallarines",
        "Albahaca y especias"
      ],
      alergenos: ["Maní", "Gluten"],
      disponible: true
    },
    {
      id: "cerdo-pisco-pallares",
      nombre: "Cerdo al pisco con pallares",
      categoria: "platillo",
      subcategoria: "Especial de la casa",
      precio: 38,
      imagen: "assets/images/platillos/platillo-2.png",
      descripcion:
        "Cerdo dorado con reducción de pisco iqueño y un cremoso puré de pallares.",
      ingredientes: [
        "Lomo de cerdo",
        "Pisco quebranta",
        "Pallares",
        "Cebolla morada",
        "Ajo",
        "Hierbas frescas"
      ],
      alergenos: [],
      disponible: true
    },
    {
      id: "picante-pallares",
      nombre: "Picante de pallares con cerdo",
      categoria: "platillo",
      subcategoria: "Cocina criolla",
      precio: 34,
      imagen: "assets/images/platillos/platillo-3.png",
      descripcion:
        "Pallares tiernos guisados con ají panca, trozos de cerdo y arroz blanco.",
      ingredientes: [
        "Pallares iqueños",
        "Carne de cerdo",
        "Ají panca",
        "Cebolla roja",
        "Ajo",
        "Arroz blanco"
      ],
      alergenos: [],
      disponible: true
    },
    {
      id: "chupe-pallares-verdes",
      nombre: "Chupe de pallares verdes",
      categoria: "platillo",
      subcategoria: "Receta de valle",
      precio: 30,
      imagen: "assets/images/platillos/platillo-4.png",
      descripcion:
        "Chupe cremoso de pallares verdes con choclo, queso fresco y huevo.",
      ingredientes: [
        "Pallares verdes",
        "Choclo",
        "Leche",
        "Queso fresco",
        "Huevo",
        "Huacatay"
      ],
      alergenos: ["Lácteos", "Huevo"],
      disponible: true
    },
    {
      id: "tortilla-de-raya",
      nombre: "Tortilla de raya",
      categoria: "platillo",
      subcategoria: "Costa de Ica",
      precio: 32,
      imagen: "assets/images/platillos/platillo-5.png",
      descripcion:
        "Tortilla dorada de raya seca deshilachada, huevo y cebolla, servida con salsa criolla.",
      ingredientes: [
        "Raya seca",
        "Huevos",
        "Cebolla roja",
        "Ají amarillo",
        "Culantro",
        "Salsa criolla"
      ],
      alergenos: ["Pescado", "Huevo"],
      disponible: true
    },
    {
      id: "ensalada-pallares",
      nombre: "Ensalada iqueña de pallares",
      categoria: "platillo",
      subcategoria: "Entrada fresca",
      precio: 24,
      imagen: "assets/images/platillos/platillo-6.png",
      descripcion:
        "Pallares blancos con cebolla morada, tomate, limón y hierbas frescas.",
      ingredientes: [
        "Pallares blancos",
        "Cebolla morada",
        "Tomate",
        "Limón",
        "Perejil",
        "Aceite de oliva"
      ],
      alergenos: [],
      disponible: true
    }
  ],

  bebidas: [
    {
      id: "pisco-sour",
      nombre: "Pisco Sour",
      categoria: "bebida",
      subcategoria: "Cóctel clásico",
      precio: 19,
      imagen: "assets/images/bebidas/pisco-sour.png",
      descripcion:
        "Pisco quebranta, limón, jarabe de goma, clara de huevo y amargo de angostura.",
      ingredientes: [
        "Pisco quebranta",
        "Zumo de limón",
        "Jarabe de goma",
        "Clara de huevo",
        "Amargo de angostura"
      ],
      alergenos: ["Huevo", "Contiene alcohol"],
      disponible: true
    },
    {
      id: "chilcano-pisco",
      nombre: "Chilcano de Pisco",
      categoria: "bebida",
      subcategoria: "Cóctel refrescante",
      precio: 18,
      imagen: "assets/images/bebidas/chilcano-de-pisco.png",
      descripcion:
        "Pisco, ginger ale, limón y hielo en una mezcla ligera y refrescante.",
      ingredientes: ["Pisco quebranta", "Ginger ale", "Limón", "Hielo", "Amargo aromático"],
      alergenos: ["Contiene alcohol"],
      disponible: true
    },
    {
      id: "capitan-iqueno",
      nombre: "Capitán Iqueño",
      categoria: "bebida",
      subcategoria: "Trago corto",
      precio: 21,
      imagen: "assets/images/bebidas/capitan.png",
      descripcion:
        "Trago corto de pisco y vermut rojo, perfumado con piel de naranja.",
      ingredientes: ["Pisco acholado", "Vermut rojo", "Hielo", "Piel de naranja"],
      alergenos: ["Contiene alcohol"],
      disponible: true
    },
    {
      id: "chicha-morada",
      nombre: "Chicha Morada",
      categoria: "bebida",
      subcategoria: "Refresco tradicional",
      precio: 9,
      imagen: "assets/images/bebidas/chicha-morada.png",
      descripcion:
        "Maíz morado cocido con piña y especias, servido bien frío.",
      ingredientes: ["Maíz morado", "Piña", "Canela", "Clavo de olor", "Limón", "Azúcar"],
      alergenos: [],
      disponible: true
    },
    {
      id: "agua-cebada",
      nombre: "Agua de Cebada",
      categoria: "bebida",
      subcategoria: "Refresco tradicional",
      precio: 8,
      imagen: "assets/images/bebidas/agua-de-cebada.png",
      descripcion:
        "Refresco casero de cebada y canela, suave y servido con bastante hielo.",
      ingredientes: ["Cebada", "Canela", "Clavo de olor", "Agua", "Azúcar", "Hielo"],
      alergenos: ["Gluten"],
      disponible: true
    },
    {
      id: "limonada-hierbabuena",
      nombre: "Limonada con Hierbabuena",
      categoria: "bebida",
      subcategoria: "Refresco natural",
      precio: 9,
      imagen: "assets/images/bebidas/limonada-hierbabuena.png",
      descripcion:
        "Limón recién exprimido, hierbabuena y hielo para acompañar la cocina criolla.",
      ingredientes: ["Limón", "Hierbabuena", "Agua", "Azúcar", "Hielo"],
      alergenos: [],
      disponible: true
    }
  ],

  servicios: [
    {
      id: "reservas",
      titulo: "Reservas y celebraciones",
      descripcion: "Organización de mesas para cumpleaños, aniversarios y encuentros familiares.",
      imagen: "assets/images/servicios/categoria-servicios.png",
      posicionImagen: "25% center",
      disponible: true
    },
    {
      id: "eventos",
      titulo: "Eventos corporativos",
      descripcion: "Atención coordinada para almuerzos de empresa y reuniones de trabajo.",
      imagen: "assets/images/servicios/categoria-servicios.png",
      posicionImagen: "center",
      disponible: true
    },
    {
      id: "menus-grupos",
      titulo: "Menús para grupos",
      descripcion: "Propuestas de entrada, fondo y bebida adaptadas al número de invitados.",
      imagen: "assets/images/servicios/categoria-servicios.png",
      posicionImagen: "70% center",
      disponible: true
    },
    {
      id: "barra-pisco",
      titulo: "Barra de pisco",
      descripcion: "Selección demostrativa de cócteles con pisco para fechas especiales.",
      imagen: "assets/images/servicios/categoria-servicios.png",
      posicionImagen: "45% center",
      disponible: true
    },
    {
      id: "pedidos-llevar",
      titulo: "Pedidos para llevar",
      descripcion: "Empaque cuidadoso para disfrutar la carta donde prefieras.",
      imagen: "assets/images/servicios/categoria-servicios.png",
      posicionImagen: "80% center",
      disponible: true
    },
    {
      id: "delivery",
      titulo: "Delivery coordinado",
      descripcion: "Entrega sujeta a zonas y horarios que el restaurante confirmará.",
      imagen: "assets/images/servicios/categoria-servicios.png",
      posicionImagen: "15% center",
      disponible: true
    }
  ]
};
