"use client";

import { useEffect, useState } from "react";

import { UiFeedback } from "@/components/ui/UiFeedback";
import { IconActionButton } from "@/components/ui/IconActionButton";
import { PlusIcon } from "@/components/ui/icons";
import {
  CategoryModal,
  type CategoryModalState,
} from "@/features/categories/components/CategoryModal";
import type { CategoryFieldConfig } from "@/features/categories/types";
import { CategoryTreeList } from "@/features/categories/components/CategoryTreeList";
import { useCategoriesStore } from "@/features/categories/stores/categories-store";
import { useMerchantStoreGuard } from "@/features/stores/hooks/use-merchant-store-guard";
import { useUiStore } from "@/lib/stores/ui-store";

export function CategoriesManager() {
  const guard = useMerchantStoreGuard();
  const categories = useCategoriesStore((state) => state.categories);
  const isLoading = useCategoriesStore((state) => state.isLoading);
  const loadCategories = useCategoriesStore((state) => state.loadCategories);
  const setSuccess = useUiStore((state) => state.setSuccess);

  const [modalState, setModalState] = useState<CategoryModalState | null>(null);

  useEffect(() => {
    if (!guard.ready) {
      return;
    }

    void loadCategories(guard.activeStoreId);
  }, [guard.ready, guard.activeStoreId, loadCategories]);

  if (!guard.ready) {
    return guard.content;
  }

  const storeId = guard.activeStoreId;
  const modalOpen = modalState !== null;

  function openCreateCategory() {
    setModalState({ mode: "choose-root" });
  }

  function openCreateCategoryManual() {
    setModalState({ mode: "create-category" });
  }

  async function handleTemplateImported(templateName: string) {
    await loadCategories(storeId);
    setSuccess(`Plantilla «${templateName}» importada correctamente.`);
    setModalState(null);
  }

  function openCreateSubcategory(parentId: number, parentName: string) {
    setModalState({ mode: "create-subcategory", parentId, parentName });
  }

  function openEdit(params: {
    categoryId: number;
    parentId: number | null;
    parentName?: string;
    initialName: string;
    initialFieldConfig?: CategoryFieldConfig;
  }) {
    setModalState({ mode: "edit", ...params });
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900">
            Categorías y subcategorías
          </h2>
          <p className="text-zinc-600">
            Gestiona todo desde esta pantalla: crea categorías, agrega
            subcategorías y edita sin cambiar de página.
          </p>
        </div>
        <IconActionButton
          label="Nueva categoría"
          variant="primary"
          size="md"
          testId="categories-create-link"
          icon={<PlusIcon />}
          onClick={openCreateCategory}
        />
      </div>

      <UiFeedback successTestId="categories-success-message" />

      {isLoading ? (
        <p className="text-sm text-zinc-500">Cargando categorías…</p>
      ) : (
        <CategoryTreeList
          categories={categories}
          storeId={storeId}
          onCreateCategory={openCreateCategory}
          onCreateSubcategory={openCreateSubcategory}
          onEdit={openEdit}
        />
      )}

      <CategoryModal
        open={modalOpen}
        state={modalState}
        storeId={storeId}
        onClose={() => {
          setModalState(null);
          void loadCategories(storeId);
        }}
        onSwitchToCreateCategory={openCreateCategoryManual}
        onTemplateImported={(templateName) => void handleTemplateImported(templateName)}
      />
    </section>
  );
}
