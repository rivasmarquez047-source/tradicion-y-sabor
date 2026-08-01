  /*
 * DATOS EDITABLES DEL SITIO
 * Contenido demostrativo para la tesis. Sustituye estos datos cuando
 * el restaurante entregue su carta, historia y datos de contacto reales.
 */

function crearPersonalizacionMenu(opcionesAdicionales = []) {
  return [
    {
      id: "sopa-menu",
      etiqueta: "Sopa del menú",
      etiquetaResumen: "Sopa",
      opciones: [
        { valor: "original", texto: "Sopa incluida — sin cambios" },
        { valor: "sin-sopa", texto: "Sin sopa" },
        {
          valor: "sopa-extra",
          texto: "Agregar sopa extra (+ S/ 5.00)",
          precioAdicional: 5
        }
      ]
    },
    {
      id: "refresco-menu",
      etiqueta: "Refresco del menú",
      etiquetaResumen: "Refresco",
      opciones: [
        { valor: "original", texto: "Refresco incluido — sin cambios" },
        { valor: "sin-refresco", texto: "Sin refresco" },
        {
          valor: "refresco-extra",
          texto: "Agregar refresco extra (+ S/ 4.00)",
          precioAdicional: 4
        }
      ]
    },
    {
      id: "ensalada-extra",
      etiqueta: "Ensalada adicional",
      etiquetaResumen: "Extra",
      opciones: [
        { valor: "original", texto: "Sin ensalada extra" },
        {
          valor: "ensalada-extra",
          texto: "Agregar ensalada extra (+ S/ 4.00)",
          precioAdicional: 4
        }
      ]
    },
    ...opcionesAdicionales
  ];
}

window.DATOS_SITIO = {
  provisional: true,

  negocio: {
    nombre: "D'MARCO P.MEDRANO",
    eslogan: "Sabores de Ica que reúnen buenos momentos",
    fundacion: "2004",

    whatsapp: "51962823566",
    whatsappVisible: "962 823 566",
    telefono: "962 823 566",
    telefonoEnlace: "+51962823566",
    direccion:
      "Urb. La Palma A-13, al lado del colegio José Toribio Polo, Ica",
    horario: "10:00 a. m. – 3:30 p. m.",
    correo: "Demarco@gmail.com",
    comoLlegar:
      "https://www.google.com/maps/search/?api=1&query=Urb.%20La%20Palma%20A-13%2C%20al%20lado%20del%20colegio%20Jose%20Toribio%20Polo%2C%20Ica%2C%20Peru",
    mapaEmbed:
      "https://www.google.com/maps?q=Urb.%20La%20Palma%20A-13%2C%20al%20lado%20del%20colegio%20Jose%20Toribio%20Polo%2C%20Ica%2C%20Peru&output=embed",
    recargoDelivery: 5,

    redesSociales: {
      facebook: "#",
      instagram: "#"
    },

    mensajeGeneral:
      "Hola, deseo solicitar información sobre D'MARCO P.MEDRANO."
  },

  menus: [
    {
      id: "menu-aji-gallina",
      nombre: "Menú Ají de Gallina",
      categoria: "menu",
      subcategoria: "Menú casero",
      precio: 18,
      imagen: "assets/images/menus/menu-aji-gallina.png",
      descripcion:
        "Ají de gallina cremoso con arroz blanco, papa, huevo y aceituna.",
      incluye: ["Sopa casera del día", "Refresco de la casa"],
      personalizacion: crearPersonalizacionMenu(),
      ingredientes: [
        "Pechuga de pollo",
        "Ají amarillo",
        "Pan",
        "Leche",
        "Queso",
        "Nueces",
        "Arroz blanco",
        "Papa",
        "Huevo y aceituna"
      ],
      alergenos: ["Lácteos", "Huevo", "Gluten", "Frutos secos"],
      disponible: true
    },
    {
      id: "menu-arroz-pollo",
      nombre: "Menú Arroz con Pollo",
      categoria: "menu",
      subcategoria: "Favorito del barrio",
      precio: 18,
      imagen: "assets/images/menus/menu-arroz-pollo.png",
      descripcion:
        "Arroz verde al culantro con presa de pollo dorada, verduras y salsa criolla.",
      incluye: ["Sopa casera del día", "Refresco de la casa"],
      personalizacion: crearPersonalizacionMenu(),
      ingredientes: [
        "Pollo",
        "Arroz",
        "Culantro",
        "Arvejas",
        "Zanahoria",
        "Ají amarillo",
        "Salsa criolla"
      ],
      alergenos: [],
      disponible: true
    },
    {
      id: "menu-adobo-pure",
      nombre: "Menú Adobo con Puré",
      categoria: "menu",
      subcategoria: "Sazón peruana",
      precio: 20,
      imagen: "assets/images/menus/menu-adobo-pure.png",
      descripcion:
        "Cerdo tierno en adobo de ají panca acompañado de puré de papa y salsa criolla.",
      incluye: ["Sopa casera del día", "Refresco de la casa"],
      ingredientes: [
        "Carne de cerdo",
        "Ají panca",
        "Ajo",
        "Cebolla",
        "Vinagre",
        "Papa amarilla",
        "Leche y mantequilla"
      ],
      personalizacion: crearPersonalizacionMenu([
        {
          id: "picante",
          etiqueta: "Nivel de picante",
          opciones: [
            { valor: "original", texto: "Preparación original — sin cambios" },
            { valor: "sin-picante", texto: "Sin picante" },
            { valor: "bajo", texto: "Bajo" },
            { valor: "normal", texto: "Normal" }
          ]
        }
      ]),
      alergenos: ["Lácteos"],
      disponible: true
    },
    {
      id: "menu-escabeche-pollo",
      nombre: "Menú Escabeche de Pollo",
      categoria: "menu",
      subcategoria: "Clásico criollo",
      precio: 18,
      imagen: "assets/images/menus/menu-escabeche-pollo.png",
      descripcion:
        "Pollo en escabeche de cebolla y ají panca con arroz, camote y aceituna.",
      incluye: ["Sopa casera del día", "Refresco de la casa"],
      personalizacion: crearPersonalizacionMenu(),
      ingredientes: [
        "Pollo",
        "Cebolla morada",
        "Ají panca",
        "Vinagre",
        "Arroz blanco",
        "Camote",
        "Aceituna"
      ],
      alergenos: [],
      disponible: true
    },
    {
      id: "menu-chuleta-menestra",
      nombre: "Menú Chuleta con Menestra",
      categoria: "menu",
      subcategoria: "Menú contundente",
      precio: 20,
      imagen: "assets/images/menus/menu-chuleta-menestra.png",
      descripcion:
        "Chuleta de cerdo dorada con lentejas guisadas, arroz blanco y salsa criolla.",
      incluye: ["Sopa casera del día", "Refresco de la casa"],
      personalizacion: crearPersonalizacionMenu(),
      ingredientes: [
        "Chuleta de cerdo",
        "Lentejas",
        "Arroz blanco",
        "Cebolla",
        "Tomate",
        "Ajo",
        "Especias de la casa"
      ],
      alergenos: [],
      disponible: true
    },
    {
      id: "menu-pollo-frito",
      nombre: "Menú Pollo Frito Casero",
      categoria: "menu",
      subcategoria: "Hecho como en casa",
      precio: 18,
      imagen: "assets/images/menus/menu-pollo-frito.png",
      descripcion:
        "Presa de pollo crocante con arroz blanco, papas doradas y ensalada criolla.",
      incluye: ["Sopa casera del día", "Refresco de la casa"],
      personalizacion: crearPersonalizacionMenu(),
      ingredientes: [
        "Pollo",
        "Harina sazonada",
        "Arroz blanco",
        "Papa",
        "Cebolla morada",
        "Tomate",
        "Hierbas frescas"
      ],
      alergenos: ["Gluten"],
      disponible: true
    }
  ],

  adicionales: [
    {
      id: "adicional-sopa",
      nombre: "Sopa adicional",
      categoria: "adicional",
      subcategoria: "Porción extra",
      precio: 5,
      imagen: "assets/images/adicionales/adicional-sopa.png",
      descripcion:
        "Una porción extra de la sopa casera preparada para el menú del día.",
      ingredientes: ["Caldo de pollo", "Fideos", "Papa", "Zanahoria", "Verduras y hierbas"],
      alergenos: ["Gluten"],
      disponible: true
    },
    {
      id: "adicional-ensalada",
      nombre: "Ensalada adicional",
      categoria: "adicional",
      subcategoria: "Porción extra",
      precio: 4,
      imagen: "assets/images/adicionales/adicional-ensalada.png",
      descripcion:
        "Una porción extra de ensalada fresca con cebolla, tomate, limón y hierbas.",
      ingredientes: ["Cebolla morada", "Tomate", "Limón", "Culantro", "Ají suave"],
      alergenos: [],
      disponible: true
    },
    {
      id: "adicional-refresco",
      nombre: "Refresco adicional",
      categoria: "adicional",
      subcategoria: "Vaso extra",
      precio: 4,
      imagen: "assets/images/adicionales/adicional-refresco.png",
      descripcion:
        "Un vaso extra de refresco casero para acompañar el menú.",
      ingredientes: ["Fruta o cereal del día", "Agua", "Azúcar", "Hielo"],
      personalizacion: [
        {
          id: "refresco",
          etiqueta: "Refresco",
          opciones: [
            { valor: "original", texto: "Refresco de la casa — sin cambios" },
            { valor: "chicha", texto: "Chicha morada" },
            { valor: "cebada", texto: "Agua de cebada" },
            { valor: "limonada", texto: "Limonada" }
          ]
        },
        {
          id: "hielo",
          etiqueta: "Hielo",
          opciones: [
            { valor: "original", texto: "Preparación original — sin cambios" },
            { valor: "con-hielo", texto: "Con hielo" },
            { valor: "sin-hielo", texto: "Sin hielo" },
            { valor: "hielo-aparte", texto: "Hielo aparte" }
          ]
        }
      ],
      alergenos: [],
      disponible: true
    },
    {
      id: "gaseosa-inka-kola",
      nombre: "Inca Kola",
      categoria: "adicional",
      tipoAdicional: "bebida",
      subcategoria: "Gaseosa personal",
      precio: 5,
      imagen: "assets/images/bebidas/gaseosa-inka-kola.png",
      descripcion:
        "Botella personal de Inca Kola bien fría, agregada aparte del refresco incluido.",
      ingredientes: ["Gaseosa sabor hierba luisa"],
      alergenos: [],
      disponible: true
    },
    {
      id: "gaseosa-coca-cola",
      nombre: "Coca-Cola",
      categoria: "adicional",
      tipoAdicional: "bebida",
      subcategoria: "Gaseosa personal",
      precio: 5,
      imagen: "assets/images/bebidas/gaseosa-coca-cola.png",
      descripcion:
        "Botella personal de Coca-Cola bien fría, agregada aparte del refresco incluido.",
      ingredientes: ["Gaseosa sabor cola"],
      alergenos: [],
      disponible: true
    },
    {
      id: "gaseosa-fanta",
      nombre: "Fanta",
      categoria: "adicional",
      tipoAdicional: "bebida",
      subcategoria: "Gaseosa personal",
      precio: 5,
      imagen: "assets/images/bebidas/gaseosa-fanta.png",
      descripcion:
        "Botella personal de Fanta sabor naranja, agregada aparte del refresco incluido.",
      ingredientes: ["Gaseosa sabor naranja"],
      alergenos: [],
      disponible: true
    },
    {
      id: "gaseosa-pepsi",
      nombre: "Pepsi",
      categoria: "adicional",
      tipoAdicional: "bebida",
      subcategoria: "Gaseosa personal",
      precio: 5,
      imagen: "assets/images/bebidas/gaseosa-pepsi.png",
      descripcion:
        "Botella personal de Pepsi bien fría, agregada aparte del refresco incluido.",
      ingredientes: ["Gaseosa sabor cola"],
      alergenos: [],
      disponible: true
    }
  ],

  servicios: [
    {
      id: "reservas",
      titulo: "Reservas y celebraciones",
      descripcion: "Organización de mesas para cumpleaños, aniversarios y encuentros familiares.",
      imagen: "assets/images/servicios/servicio-reservas-celebraciones.webp",
      posicionImagen: "center",
      disponible: true
    },
    {
      id: "eventos",
      titulo: "Eventos corporativos",
      descripcion: "Atención coordinada para almuerzos de empresa y reuniones de trabajo.",
      imagen: "assets/images/servicios/servicio-eventos-corporativos.webp",
      posicionImagen: "center",
      disponible: true
    },
    {
      id: "menus-grupos",
      titulo: "Menús para grupos",
      descripcion: "Propuestas de entrada, fondo y bebida adaptadas al número de invitados.",
      imagen: "assets/images/servicios/servicio-menus-grupos.webp",
      posicionImagen: "center",
      disponible: true
    },
    {
      id: "barra-pisco",
      titulo: "Barra de pisco",
      descripcion: "Selección demostrativa de cócteles con pisco para fechas especiales.",
      imagen: "assets/images/servicios/servicio-barra-pisco.webp",
      posicionImagen: "center",
      disponible: true
    },
    {
      id: "pedidos-llevar",
      titulo: "Pedidos para llevar",
      descripcion: "Empaque cuidadoso para disfrutar la carta donde prefieras.",
      imagen: "assets/images/servicios/servicio-pedidos-llevar.webp",
      posicionImagen: "center",
      disponible: true
    },
    {
      id: "delivery",
      titulo: "Delivery coordinado",
      descripcion: "Entrega sujeta a zonas y horarios que el restaurante confirmará.",
      imagen: "assets/images/servicios/servicio-delivery.webp",
      posicionImagen: "center",
      disponible: true
    }
  ]
};
