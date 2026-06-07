"use client";

import { useEffect, useMemo } from "react";

import { UiFeedback } from "@/components/ui/UiFeedback";
import { InventoryTable } from "@/features/inventory/components/InventoryTable";
import { ServicesWithoutStock } from "@/features/inventory/components/ServicesWithoutStock";
import { useInventoryStore } from "@/features/inventory/stores/inventory-store";
import { useMerchantStoreGuard } from "@/features/stores/hooks/use-merchant-store-guard";
import { useMerchantSessionStore } from "@/features/stores/stores/merchant-session-store";

export function InventoryManager() {
  const guard = useMerchantStoreGuard();
  const activeStoreId = useMerchantSessionStore((state) => state.activeStoreId);
  const products = useInventoryStore((state) => state.products);
  const isLoading = useInventoryStore((state) => state.isLoading);
  const loadInventory = useInventoryStore((state) => state.loadInventory);
  const updateProductStock = useInventoryStore((state) => state.updateProductStock);

  useEffect(() => {
    if (activeStoreId === null) {
      return;
    }

    void loadInventory(activeStoreId);
  }, [activeStoreId, loadInventory]);

  const physicalProducts = useMemo(
    () => products.filter((product) => product.product_type === "physical"),
    [products],
  );
  const services = useMemo(
    () => products.filter((product) => product.product_type === "service"),
    [products],
  );

  if (!guard.ready) {
    return guard.content;
  }

  const storeId = activeStoreId as number;

  return (
    <div className="space-y-6">
      <UiFeedback successTestId="inventory-success-message" />

      {isLoading ? (
        <p className="text-sm text-zinc-500">Cargando inventario…</p>
      ) : (
        <>
          <InventoryTable
            products={physicalProducts}
            storeId={storeId}
            onStockUpdated={updateProductStock}
          />
          <ServicesWithoutStock services={services} />
        </>
      )}
    </div>
  );
}
