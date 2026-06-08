"use client";

import { AdminOperationsMapPanel } from "@/features/admin-map/components/AdminOperationsMapPanel";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";

export function AdminMapPageClient() {
  return (
    <section>
      <AdminPageHeader
        badge="Operaciones"
        title="Mapa operativo"
        description="Visualiza todas las tiendas registradas y rastrea en tiempo real los deliveries activos con la última posición GPS del conductor."
      />
      <AdminOperationsMapPanel />
    </section>
  );
}
