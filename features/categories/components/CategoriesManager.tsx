"use client";

import { useEffect } from "react";

import { UiFeedback } from "@/components/ui/UiFeedback";
import { CategoryTreeList } from "@/features/categories/components/CategoryTreeList";
import { useCategoriesStore } from "@/features/categories/stores/categories-store";
import { useUiStore } from "@/lib/stores/ui-store";
import { useMerchantStoreGuard } from "@/features/stores/hooks/use-merchant-store-guard";
import { useMerchantSessionStore } from "@/features/stores/stores/merchant-session-store";

export function CategoriesManager() {
  const guard = useMerchantStoreGuard();
  const activeStoreId = useMerchantSessionStore((state) => state.activeStoreId);
  const categories = useCategoriesStore((state) => state.categories);
  const isLoading = useCategoriesStore((state) => state.isLoading);
  const loadCategories = useCategoriesStore((state) => state.loadCategories);
  const setSuccess = useUiStore((state) => state.setSuccess);

  useEffect(() => {
    if (activeStoreId === null) {
      return;
    }

    void (async () => {
      await loadCategories(activeStoreId);
      const pendingSuccess = sessionStorage.getItem("category-create-success");
      if (pendingSuccess) {
        sessionStorage.removeItem("category-create-success");
        setSuccess(pendingSuccess);
      }
    })();
  }, [activeStoreId, loadCategories, setSuccess]);

  if (!guard.ready) {
    return guard.content;
  }

  const storeId = activeStoreId as number;

  return (
    <div className="space-y-6">
      <UiFeedback successTestId="categories-success-message" />

      {isLoading ? (
        <p className="text-sm text-zinc-500">Cargando categorías…</p>
      ) : (
        <CategoryTreeList categories={categories} storeId={storeId} />
      )}
    </div>
  );
}
