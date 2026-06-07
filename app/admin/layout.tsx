import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { getServerSession } from "@/lib/auth/session";

const adminNav = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/commissions", label: "Comisiones" },
  { href: "/admin/coupons", label: "Cupones" },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (!session?.role || session.role !== "super_admin") {
    redirect("/login");
  }

  return (
    <AppShell
      title="Panel administrador"
      sidebarTestId="admin-sidebar"
      navItems={adminNav}
      userEmail={session.email}
    >
      {children}
    </AppShell>
  );
}
