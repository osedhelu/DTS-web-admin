import { MerchantDashboardPanel } from "@/features/merchant-dashboard/components/MerchantDashboardPanel";

export default function MerchantHomePage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">Resumen de tu tienda</h2>
        <p className="text-zinc-600">
          Ventas, pedidos y productos activos del período seleccionado.
        </p>
      </div>

      <MerchantDashboardPanel />
    </section>
  );
}
