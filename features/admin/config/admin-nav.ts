export interface AdminNavItem {
  href: string;
  label: string;
  description: string;
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    title: "General",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        description: "KPIs y resumen de la plataforma",
      },
    ],
  },
  {
    title: "Finanzas",
    items: [
      {
        href: "/admin/commissions",
        label: "Comisiones",
        description: "Ventas por comercio y reparto",
      },
      {
        href: "/admin/coupons",
        label: "Cupones",
        description: "Descuentos globales de plataforma",
      },
    ],
  },
  {
    title: "Contenido",
    items: [
      {
        href: "/admin/banners",
        label: "Banners",
        description: "Promociones en app cliente",
      },
    ],
  },
  {
    title: "Operaciones",
    items: [
      {
        href: "/admin/merchants",
        label: "Comercios",
        description: "Moderación y verificación",
      },
    ],
  },
];

export const adminQuickActions = [
  {
    href: "/admin/merchants",
    title: "Moderar comercios",
    description: "Verificar cuentas, suspender o reactivar tiendas",
    testId: "admin-action-merchants",
  },
  {
    href: "/admin/commissions",
    title: "Revisar comisiones",
    description: "Ventas por comercio y exportar reportes CSV",
    testId: "admin-action-commissions",
  },
  {
    href: "/admin/coupons",
    title: "Gestionar cupones",
    description: "Crear y editar cupones promocionales",
    testId: "admin-action-coupons",
  },
  {
    href: "/admin/banners",
    title: "Publicar banners",
    description: "Contenido visible en la app de clientes",
    testId: "admin-action-banners",
  },
] as const;
