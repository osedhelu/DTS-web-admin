import { redirect } from "next/navigation";

import { AdminShell } from "@/features/admin/components/AdminShell";
import { getServerSession } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (!session?.role || session.role !== "super_admin") {
    redirect("/login");
  }

  return <AdminShell userEmail={session.email}>{children}</AdminShell>;
}
