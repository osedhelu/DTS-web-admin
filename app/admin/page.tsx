import { AdminDashboardPanel } from "@/features/admin/components/AdminDashboardPanel";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";

export default function AdminHomePage() {
  return (
    <section>
      <AdminPageHeader
        badge="Dashboard"
        title="Resumen de la plataforma"
        description="Visualiza KPIs globales, accede a las herramientas de moderación y gestiona finanzas y contenido de DTS Delivery."
      />
      <AdminDashboardPanel />
    </section>
  );
}
