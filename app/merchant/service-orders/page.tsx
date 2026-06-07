import { ServiceOrdersDashboard } from "@/features/service-orders/components/ServiceOrdersDashboard";

export default function MerchantServiceOrdersPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">
          Pedidos de servicio
        </h2>
        <p className="text-zinc-600">
          Acepta, agenda y completa servicios a domicilio solicitados por tus
          clientes.
        </p>
      </div>

      <ServiceOrdersDashboard />
    </section>
  );
}
