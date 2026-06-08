import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { CommissionsPanel } from "@/features/commissions/components/CommissionsPanel";

export default function AdminCommissionsPage() {
  return (
    <section>
      <AdminPageHeader
        badge="Finanzas"
        title="Comisiones"
        description="Consulta ventas por comercio, comisiones de conductores y exporta reportes en CSV para contabilidad."
      />
      <CommissionsPanel />
    </section>
  );
}
