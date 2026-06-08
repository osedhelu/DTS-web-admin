import { MerchantDashboardPanel } from "@/features/merchant-dashboard/components/MerchantDashboardPanel";
import { MerchantPageHeader } from "@/features/merchant-dashboard/components/MerchantPageHeader";

export default function MerchantHomePage() {
  return (
    <section>
      <MerchantPageHeader
        badge="Resumen"
        title="Resumen de tu tienda"
        description="Visualiza ventas, pedidos y productos activos. Accede rápido a catálogo, inventario y operaciones del día."
      />
      <MerchantDashboardPanel />
    </section>
  );
}
