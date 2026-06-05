import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { getServerSession } from "@/lib/auth/session";

const merchantNav = [
  { href: "/merchant", label: "Inicio" },
  { href: "/merchant/products", label: "Productos y servicios" },
  { href: "/merchant/inventory", label: "Inventario" },
  { href: "/merchant/categories", label: "Categorías" },
];

export default async function MerchantLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (!session?.role || session.role !== "merchant") {
    redirect("/login");
  }

  return (
    <AppShell
      title="Panel comercio"
      sidebarTestId="merchant-sidebar"
      navItems={merchantNav}
      userEmail={session.email}
    >
      {children}
    </AppShell>
  );
}
