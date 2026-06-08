export interface MerchantNavItem {
  href: string;
  label: string;
  description: string;
}

export interface MerchantNavGroup {
  title: string;
  items: MerchantNavItem[];
}

export const merchantNavGroups: MerchantNavGroup[] = [
  {
    title: "General",
    items: [
      {
        href: "/merchant",
        label: "Dashboard",
        description: "Ventas, pedidos y métricas de tu tienda",
      },
    ],
  },
  {
    title: "Catálogo",
    items: [
      {
        href: "/merchant/products",
        label: "Productos",
        description: "Productos físicos y servicios a domicilio",
      },
      {
        href: "/merchant/categories",
        label: "Categorías",
        description: "Organiza tu menú y variantes",
      },
      {
        href: "/merchant/inventory",
        label: "Inventario",
        description: "Stock y disponibilidad en tiempo real",
      },
    ],
  },
  {
    title: "Operaciones",
    items: [
      {
        href: "/merchant/orders",
        label: "Pedidos",
        description: "Entregas y estado de cada orden",
      },
      {
        href: "/merchant/service-orders",
        label: "Pedidos servicio",
        description: "Servicios programados y a domicilio",
      },
    ],
  },
  {
    title: "Crecimiento",
    items: [
      {
        href: "/merchant/promotions",
        label: "Promociones",
        description: "Descuentos y ofertas de tu tienda",
      },
      {
        href: "/merchant/settings",
        label: "Configuración",
        description: "Datos de la tienda y preferencias",
      },
    ],
  },
];

export const merchantQuickActions = [
  {
    href: "/merchant/products/new",
    title: "Nuevo producto",
    description: "Agrega un producto o servicio a tu catálogo",
    testId: "merchant-action-new-product",
  },
  {
    href: "/merchant/orders",
    title: "Ver pedidos",
    description: "Revisa órdenes pendientes y en curso",
    testId: "merchant-action-orders",
  },
  {
    href: "/merchant/inventory",
    title: "Actualizar inventario",
    description: "Controla stock y disponibilidad",
    testId: "merchant-action-inventory",
  },
  {
    href: "/merchant/promotions",
    title: "Crear promoción",
    description: "Lanza descuentos para atraer más clientes",
    testId: "merchant-action-promotions",
  },
] as const;
