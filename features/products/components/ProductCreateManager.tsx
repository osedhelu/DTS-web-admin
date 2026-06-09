"use client";

import { useRouter } from "next/navigation";

import { ProductForm } from "@/features/products/components/ProductForm";
import { useProductsStore } from "@/features/products/stores/products-store";
import { useMerchantStoreGuard } from "@/features/stores/hooks/use-merchant-store-guard";
import type { Product } from "@/features/products/types";

export function ProductCreateManager() {
  const router = useRouter();
  const guard = useMerchantStoreGuard();
  const addProduct = useProductsStore((state) => state.addProduct);
  if (!guard.ready) {
    return guard.content;
  }

  const storeId = guard.activeStoreId;

  function handleCreated(product: Product) {
    addProduct(product);
    const message =
      product.product_type === "service"
        ? `Servicio "${product.name}" creado correctamente.`
        : `Producto "${product.name}" creado correctamente.`;
    sessionStorage.setItem("product-create-success", message);
    router.push(`/merchant/products/${product.id}`);
  }

  return <ProductForm storeId={storeId} onCreated={handleCreated} />;
}
