import { Suspense } from "react";

import { PromotionsManager } from "@/features/promotions/components/PromotionsManager";

export default function MerchantPromotionsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">Promociones</h2>
        <p className="text-zinc-600">
          Crea descuentos por porcentaje o monto fijo para tu tienda o productos
          específicos.
        </p>
      </div>

      <Suspense fallback={<p className="text-sm text-zinc-500">Cargando promociones…</p>}>
        <PromotionsManager />
      </Suspense>
    </section>
  );
}
