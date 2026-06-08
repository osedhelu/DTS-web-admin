import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { MerchantsManager } from "@/features/admin-merchants/components/MerchantsManager";

export default function AdminMerchantsPage() {
  return (
    <section>
      <AdminPageHeader
        badge="Operaciones"
        title="Comercios"
        description="Revisa registros, verifica correos electrónicos, suspende tiendas problemáticas o reactiva comercios que cumplan las políticas."
      />
      <MerchantsManager />
    </section>
  );
}
