import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { CouponsManager } from "@/features/coupons/components/CouponsManager";

export default function AdminCouponsPage() {
  return (
    <section>
      <AdminPageHeader
        badge="Finanzas"
        title="Cupones"
        description="Crea y edita cupones promocionales de plataforma con descuentos por porcentaje o monto fijo."
      />
      <CouponsManager />
    </section>
  );
}
