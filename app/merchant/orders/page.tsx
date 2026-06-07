import { OrdersDashboard } from "@/features/orders/components/OrdersDashboard";

export default function MerchantOrdersPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">
          Pedidos entrantes
        </h2>
        <p className="text-zinc-600">
          Revisa y filtra los pedidos de delivery de tu tienda por estado.
        </p>
      </div>

      <OrdersDashboard />
    </section>
  );
}
