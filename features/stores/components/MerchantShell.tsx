"use client";

import { AppShell } from "@/components/layout/AppShell";
import { MerchantStoreSelector } from "@/features/stores/components/MerchantStoreSelector";

const merchantNav = [
  { href: "/merchant", label: "Inicio" },
  { href: "/merchant/products", label: "Productos y servicios" },
  { href: "/merchant/inventory", label: "Inventario" },
  { href: "/merchant/categories", label: "Categorías" },
  { href: "/merchant/orders", label: "Pedidos" },
  { href: "/merchant/service-orders", label: "Pedidos servicio" },
  { href: "/merchant/promotions", label: "Promociones" },
  { href: "/merchant/settings", label: "Configuración" },
];

interface MerchantShellProps {
  userEmail?: string;
  children: React.ReactNode;
}

export function MerchantShell({ userEmail, children }: MerchantShellProps) {
  return (
    <AppShell
      title="Panel comercio"
      sidebarTestId="merchant-sidebar"
      navItems={merchantNav}
      userEmail={userEmail}
      headerSlot={
        <div className="border-b border-zinc-200 px-8 py-4">
          <MerchantStoreSelector compact />
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
