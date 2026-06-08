"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { CreateSubcategoryForm } from "@/features/categories/components/CreateSubcategoryForm";
import { useCategoriesStore } from "@/features/categories/stores/categories-store";
import type { Subcategory } from "@/features/categories/types";
import { useMerchantStoreGuard } from "@/features/stores/hooks/use-merchant-store-guard";
import { useMerchantSessionStore } from "@/features/stores/stores/merchant-session-store";

interface SubcategoryCreateManagerProps {
  parentId: number;
}

export function SubcategoryCreateManager({ parentId }: SubcategoryCreateManagerProps) {
  const router = useRouter();
  const guard = useMerchantStoreGuard();
  const activeStoreId = useMerchantSessionStore((state) => state.activeStoreId);
  const categories = useCategoriesStore((state) => state.categories);
  const isLoading = useCategoriesStore((state) => state.isLoading);
  const loadCategories = useCategoriesStore((state) => state.loadCategories);
  const addSubcategory = useCategoriesStore((state) => state.addSubcategory);

  useEffect(() => {
    if (activeStoreId !== null) {
      void loadCategories(activeStoreId);
    }
  }, [activeStoreId, loadCategories]);

  if (!guard.ready) {
    return guard.content;
  }

  const storeId = activeStoreId as number;

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Cargando categoría padre…</p>;
  }

  const parentCategory = categories.find((category) => category.id === parentId);

  if (!parentCategory) {
    return (
      <p className="text-sm text-red-600">
        No se encontró la categoría padre.{" "}
        <a href="/merchant/categories" className="underline">
          Volver al listado
        </a>
      </p>
    );
  }

  function handleCreated(createdParentId: number, subcategory: Subcategory) {
    addSubcategory(createdParentId, subcategory);
    sessionStorage.setItem(
      "category-create-success",
      `Subcategoría "${subcategory.name}" creada correctamente.`,
    );
    router.push("/merchant/categories");
  }

  return (
    <CreateSubcategoryForm
      storeId={storeId}
      parentId={parentId}
      parentName={parentCategory?.name}
      onCreated={handleCreated}
    />
  );
}
