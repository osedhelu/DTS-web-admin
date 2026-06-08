"use client";

import { useEffect, useState } from "react";

import { UiFeedback } from "@/components/ui/UiFeedback";
import {
  ProductFilters,
  type ProductTypeFilter,
} from "@/features/products/components/ProductFilters";
import { ProductList } from "@/features/products/components/ProductList";
import { useProductsStore } from "@/features/products/stores/products-store";
import { useMerchantStoreGuard } from "@/features/stores/hooks/use-merchant-store-guard";
import { useMerchantSessionStore } from "@/features/stores/stores/merchant-session-store";

export function ProductsManager() {
  const guard = useMerchantStoreGuard();
  const activeStoreId = useMerchantSessionStore((state) => state.activeStoreId);
  const products = useProductsStore((state) => state.products);
  const isLoading = useProductsStore((state) => state.isLoading);
  const loadProducts = useProductsStore((state) => state.loadProducts);
  const deactivateProduct = useProductsStore((state) => state.deactivateProduct);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProductTypeFilter>("all");

  useEffect(() => {
    if (activeStoreId === null) {
      return;
    }

    const timeout = setTimeout(() => {
      void loadProducts(activeStoreId, {
        search,
        type: typeFilter === "all" ? undefined : typeFilter,
      });
    }, 250);

    return () => clearTimeout(timeout);
  }, [activeStoreId, loadProducts, search, typeFilter]);

  if (!guard.ready) {
    return guard.content;
  }

  const storeId = activeStoreId as number;

  async function handleDeactivate(productId: number) {
    await deactivateProduct(storeId, productId);
  }

  return (
    <div className="space-y-6">
      <UiFeedback successTestId="products-success-message" />

      <ProductFilters
        search={search}
        typeFilter={typeFilter}
        onSearchChange={setSearch}
        onTypeFilterChange={setTypeFilter}
      />

      <ProductList
        products={products}
        onDeactivate={handleDeactivate}
        isLoading={isLoading}
      />
    </div>
  );
}
