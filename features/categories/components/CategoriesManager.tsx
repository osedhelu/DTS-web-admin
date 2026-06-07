"use client";

import { useEffect } from "react";

import { UiFeedback } from "@/components/ui/UiFeedback";
import { CategoryTreeList } from "@/features/categories/components/CategoryTreeList";
import { CreateCategoryForm } from "@/features/categories/components/CreateCategoryForm";
import { CreateSubcategoryForm } from "@/features/categories/components/CreateSubcategoryForm";
import { useCategoriesStore } from "@/features/categories/stores/categories-store";
import { useMerchantStoreGuard } from "@/features/stores/hooks/use-merchant-store-guard";
import { useMerchantSessionStore } from "@/features/stores/stores/merchant-session-store";

export function CategoriesManager() {
  const guard = useMerchantStoreGuard();
  const activeStoreId = useMerchantSessionStore((state) => state.activeStoreId);
  const categories = useCategoriesStore((state) => state.categories);
  const isLoading = useCategoriesStore((state) => state.isLoading);
  const loadCategories = useCategoriesStore((state) => state.loadCategories);
  const addCategory = useCategoriesStore((state) => state.addCategory);
  const addSubcategory = useCategoriesStore((state) => state.addSubcategory);
  const updateCategory = useCategoriesStore((state) => state.updateCategory);
  const deleteCategory = useCategoriesStore((state) => state.deleteCategory);

  useEffect(() => {
    if (activeStoreId === null) {
      return;
    }

    void loadCategories(activeStoreId);
  }, [activeStoreId, loadCategories]);

  if (!guard.ready) {
    return guard.content;
  }

  const storeId = activeStoreId as number;

  return (
    <div className="space-y-6">
      <UiFeedback successTestId="categories-success-message" />

      <div className="grid gap-4 lg:grid-cols-2">
        <CreateCategoryForm storeId={storeId} onCreated={addCategory} />
        <CreateSubcategoryForm
          storeId={storeId}
          categories={categories}
          onCreated={addSubcategory}
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Cargando categorías…</p>
      ) : (
        <CategoryTreeList
          categories={categories}
          storeId={storeId}
          onUpdate={(categoryId, name, parentId) =>
            updateCategory(storeId, categoryId, name, parentId)
          }
          onDelete={(categoryId, parentId) =>
            deleteCategory(storeId, categoryId, parentId)
          }
        />
      )}
    </div>
  );
}
