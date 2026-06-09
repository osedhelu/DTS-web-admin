"use client";

import { ProductEditForm } from "@/features/products/components/ProductEditForm";
import { useMerchantStoreGuard } from "@/features/stores/hooks/use-merchant-store-guard";

interface ProductEditManagerProps {
  productId: number;
}

export function ProductEditManager({ productId }: ProductEditManagerProps) {
  const guard = useMerchantStoreGuard();

  if (!guard.ready) {
    return guard.content;
  }

  return (
    <ProductEditForm storeId={guard.activeStoreId} productId={productId} />
  );
}
