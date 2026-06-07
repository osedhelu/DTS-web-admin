import { AdminDashboardPanel } from "@/features/admin/components/AdminDashboardPanel";

export default function AdminHomePage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">
          Panel administrador
        </h2>
        <p className="text-zinc-600">
          KPIs y métricas globales de la plataforma DTS.
        </p>
      </div>

      <AdminDashboardPanel />
    </section>
  );
}
