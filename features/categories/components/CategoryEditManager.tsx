"use client";

import { useEffect } from "react";

import { CategoryEditForm } from "@/features/categories/components/CategoryEditForm";
import { useCategoriesStore } from "@/features/categories/stores/categories-store";
import { useMerchantStoreGuard } from "@/features/stores/hooks/use-merchant-store-guard";
import { useMerchantSessionStore } from "@/features/stores/stores/merchant-session-store";

interface CategoryEditManagerProps {
  categoryId: number;
}

function findCategory(
  categories: ReturnType<typeof useCategoriesStore.getState>["categories"],
  categoryId: number,
) {
  for (const category of categories) {
    if (category.id === categoryId) {
      return {
        name: category.name,
        parentId: null as number | null,
        parentName: undefined as string | undefined,
      };
    }

    for (const subcategory of category.subcategories) {
      if (subcategory.id === categoryId) {
        return {
          name: subcategory.name,
          parentId: subcategory.parent_id,
          parentName: category.name,
        };
      }
    }
  }

  return null;
}

export function CategoryEditManager({ categoryId }: CategoryEditManagerProps) {
  const guard = useMerchantStoreGuard();
  const activeStoreId = useMerchantSessionStore((state) => state.activeStoreId);
  const categories = useCategoriesStore((state) => state.categories);
  const isLoading = useCategoriesStore((state) => state.isLoading);
  const loadCategories = useCategoriesStore((state) => state.loadCategories);

  useEffect(() => {
    if (activeStoreId !== null) {
      void loadCategories(activeStoreId);
    }
  }, [activeStoreId, loadCategories]);

  if (!guard.ready) {
    return guard.content;
  }

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Cargando categoría…</p>;
  }

  const match = findCategory(categories, categoryId);

  if (!match) {
    return (
      <p className="text-sm text-red-600">
        No se encontró la categoría.{" "}
        <a href="/merchant/categories" className="underline">
          Volver al listado
        </a>
      </p>
    );
  }

  return (
    <CategoryEditForm
      storeId={activeStoreId as number}
      categoryId={categoryId}
      initialName={match.name}
      parentId={match.parentId}
      parentName={match.parentName}
    />
  );
}
