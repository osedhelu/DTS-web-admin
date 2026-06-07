"use client";

import { useEffect } from "react";

import { UiFeedback } from "@/components/ui/UiFeedback";
import { ProductForm } from "@/features/products/components/ProductForm";
import { ProductList } from "@/features/products/components/ProductList";
import { useProductsStore } from "@/features/products/stores/products-store";
import { useMerchantStoreGuard } from "@/features/stores/hooks/use-merchant-store-guard";
import { useMerchantSessionStore } from "@/features/stores/stores/merchant-session-store";
import { useUiStore } from "@/lib/stores/ui-store";
import type { Product } from "@/features/products/types";

export function ProductsManager() {
  const guard = useMerchantStoreGuard();
  const activeStoreId = useMerchantSessionStore((state) => state.activeStoreId);
  const products = useProductsStore((state) => state.products);
  const isLoading = useProductsStore((state) => state.isLoading);
  const loadProducts = useProductsStore((state) => state.loadProducts);
  const addProduct = useProductsStore((state) => state.addProduct);
  const deactivateProduct = useProductsStore((state) => state.deactivateProduct);
  const setSuccess = useUiStore((state) => state.setSuccess);

  useEffect(() => {
    if (activeStoreId === null) {
      return;
    }

    void loadProducts(activeStoreId);
  }, [activeStoreId, loadProducts]);

  if (!guard.ready) {
    return guard.content;
  }

  const storeId = activeStoreId as number;

  function handleCreated(product: Product) {
    addProduct(product);
    setSuccess(
      product.product_type === "service"
        ? `Servicio "${product.name}" creado correctamente.`
        : `Producto "${product.name}" creado correctamente.`,
    );
  }

  async function handleDeactivate(productId: number) {
    await deactivateProduct(storeId, productId);
  }

  return (
    <div className="space-y-6">
      <UiFeedback successTestId="products-success-message" />

      <ProductForm storeId={storeId} onCreated={handleCreated} />

      <ProductList
        products={products}
        onDeactivate={handleDeactivate}
        isLoading={isLoading}
      />
    </div>
  );
}
