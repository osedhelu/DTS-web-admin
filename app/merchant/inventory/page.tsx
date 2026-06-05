import { InventoryManager } from "@/features/inventory/components/InventoryManager";

export default function MerchantInventoryPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">Inventario</h2>
        <p className="text-zinc-600">
          Actualiza el stock de productos físicos. Los servicios no tienen
          inventario.
        </p>
      </div>

      <InventoryManager />
    </section>
  );
}
