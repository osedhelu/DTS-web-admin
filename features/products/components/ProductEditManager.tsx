"use client";

import { ProductEditForm } from "@/features/products/components/ProductEditForm";
import { useMerchantStoreGuard } from "@/features/stores/hooks/use-merchant-store-guard";
import { useMerchantSessionStore } from "@/features/stores/stores/merchant-session-store";

interface ProductEditManagerProps {
  productId: number;
}

export function ProductEditManager({ productId }: ProductEditManagerProps) {
  const guard = useMerchantStoreGuard();
  const activeStoreId = useMerchantSessionStore((state) => state.activeStoreId);

  if (!guard.ready) {
    return guard.content;
  }

  return (
    <ProductEditForm storeId={activeStoreId as number} productId={productId} />
  );
}
