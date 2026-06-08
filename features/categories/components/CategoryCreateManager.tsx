"use client";

import { useRouter } from "next/navigation";

import { CreateCategoryForm } from "@/features/categories/components/CreateCategoryForm";
import { useCategoriesStore } from "@/features/categories/stores/categories-store";
import type { CategoryTreeNode } from "@/features/categories/types";
import { useMerchantStoreGuard } from "@/features/stores/hooks/use-merchant-store-guard";
import { useMerchantSessionStore } from "@/features/stores/stores/merchant-session-store";

export function CategoryCreateManager() {
  const router = useRouter();
  const guard = useMerchantStoreGuard();
  const activeStoreId = useMerchantSessionStore((state) => state.activeStoreId);
  const addCategory = useCategoriesStore((state) => state.addCategory);

  if (!guard.ready) {
    return guard.content;
  }

  const storeId = activeStoreId as number;

  function handleCreated(category: CategoryTreeNode) {
    addCategory(category);
    sessionStorage.setItem(
      "category-create-success",
      `Categoría "${category.name}" creada correctamente.`,
    );
    router.push("/merchant/categories");
  }

  return <CreateCategoryForm storeId={storeId} onCreated={handleCreated} />;
}
