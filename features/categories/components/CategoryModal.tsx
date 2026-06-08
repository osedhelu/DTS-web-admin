"use client";

import { FormEvent, useEffect, useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { CategoryFieldConfigEditor } from "@/features/categories/components/CategoryFieldConfigEditor";
import {
  fieldConfigToRows,
  rowsToFieldConfig,
} from "@/features/categories/lib/field-config";
import { useCategoriesStore } from "@/features/categories/stores/categories-store";
import type {
  CategoryFieldConfig,
  CategoryFieldConfigRow,
  CategoryRecord,
  CategoryTreeNode,
  Subcategory,
} from "@/features/categories/types";
import { useUiStore } from "@/lib/stores/ui-store";

export type CategoryModalState =
  | { mode: "create-category" }
  | { mode: "create-subcategory"; parentId: number; parentName: string }
  | {
      mode: "edit";
      categoryId: number;
      parentId: number | null;
      parentName?: string;
      initialName: string;
      initialFieldConfig?: CategoryFieldConfig;
    };

interface CategoryModalProps {
  open: boolean;
  state: CategoryModalState | null;
  storeId: number;
  onClose: () => void;
}

export function CategoryModal({ open, state, storeId, onClose }: CategoryModalProps) {
  const addCategory = useCategoriesStore((s) => s.addCategory);
  const addSubcategory = useCategoriesStore((s) => s.addSubcategory);
  const updateCategory = useCategoriesStore((s) => s.updateCategory);
  const deleteCategory = useCategoriesStore((s) => s.deleteCategory);
  const setSuccess = useUiStore((s) => s.setSuccess);

  const [name, setName] = useState("");
  const [fieldRows, setFieldRows] = useState<CategoryFieldConfigRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!state) {
      return;
    }

    setName(state.mode === "edit" ? state.initialName : "");
    setFieldRows(
      state.mode === "edit"
        ? fieldConfigToRows(state.initialFieldConfig ?? {})
        : [],
    );
    setError(null);
    setIsSubmitting(false);
    setIsDeleting(false);
  }, [state]);

  if (!state) {
    return null;
  }

  const isEdit = state.mode === "edit";
  const isSubcategoryCreate = state.mode === "create-subcategory";
  const isSubcategoryEdit = isEdit && state.parentId !== null;

  const title =
    state.mode === "create-category"
      ? "Nueva categoría"
      : state.mode === "create-subcategory"
        ? "Nueva subcategoría"
        : "Editar categoría";

  const description =
    state.mode === "create-category"
      ? "Agrupa productos o servicios de tu catálogo."
      : state.mode === "create-subcategory"
        ? `Dentro de «${state.parentName}»`
        : isSubcategoryEdit
          ? `Subcategoría de «${state.parentName ?? "categoría padre"}»`
          : "Categoría raíz del catálogo";

  async function handleCreateCategory() {
    const response = await fetch(`/api/merchant/stores/${storeId}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const data = (await response.json()) as CategoryRecord & { detail?: string };

    if (!response.ok) {
      setError(data.detail ?? "No se pudo crear la categoría");
      return false;
    }

    const created: CategoryTreeNode = {
      id: data.id,
      name: data.name,
      subcategories: [],
    };
    addCategory(created);
    setSuccess(`Categoría "${data.name}" creada correctamente.`);
    return true;
  }

  async function handleCreateSubcategory() {
    if (state.mode !== "create-subcategory") {
      return false;
    }

    const response = await fetch(`/api/merchant/stores/${storeId}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), parent_id: state.parentId }),
    });
    const data = (await response.json()) as CategoryRecord & { detail?: string };

    if (!response.ok) {
      setError(data.detail ?? "No se pudo crear la subcategoría");
      return false;
    }

    const created: Subcategory = {
      id: data.id,
      name: data.name,
      parent_id: data.parent_id ?? state.parentId,
    };
    addSubcategory(state.parentId, created);
    setSuccess(`Subcategoría "${data.name}" creada correctamente.`);
    return true;
  }

  async function handleEdit() {
    if (state.mode !== "edit") {
      return false;
    }

    const saved = await updateCategory(
      storeId,
      state.categoryId,
      name.trim(),
      state.parentId,
      rowsToFieldConfig(fieldRows),
    );

    if (saved) {
      setSuccess(`Categoría "${name.trim()}" actualizada correctamente.`);
      return true;
    }

    setError("No se pudo actualizar la categoría");
    return false;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    let ok = false;
    if (state.mode === "create-category") {
      ok = await handleCreateCategory();
    } else if (state.mode === "create-subcategory") {
      ok = await handleCreateSubcategory();
    } else {
      ok = await handleEdit();
    }

    setIsSubmitting(false);
    if (ok) {
      onClose();
    }
  }

  async function handleDelete() {
    if (state.mode !== "edit") {
      return;
    }

    const label = isSubcategoryEdit ? "esta subcategoría" : "esta categoría";
    if (!window.confirm(`¿Eliminar ${label}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setIsDeleting(true);
    const deleted = await deleteCategory(storeId, state.categoryId, state.parentId);
    setIsDeleting(false);

    if (deleted) {
      setSuccess("Categoría eliminada correctamente.");
      onClose();
    } else {
      setError("No se pudo eliminar la categoría");
    }
  }

  const formTestId = isEdit
    ? "category-edit-form"
    : isSubcategoryCreate
      ? "create-subcategory-form"
      : "create-category-form";

  const nameTestId = isEdit
    ? `category-edit-input-${state.mode === "edit" ? state.categoryId : ""}`
    : isSubcategoryCreate
      ? "subcategory-name"
      : "category-name";

  const submitTestId = isEdit
    ? `category-save-${state.mode === "edit" ? state.categoryId : ""}`
    : isSubcategoryCreate
      ? "subcategory-submit"
      : "category-submit";

  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      testId="category-modal"
      panelClassName={isEdit ? "max-w-2xl" : "max-w-md"}
    >
      <form onSubmit={handleSubmit} data-testid={formTestId} className="space-y-4">
        {isSubcategoryCreate ? (
          <input
            type="hidden"
            data-testid="subcategory-parent"
            value={String(state.parentId)}
            readOnly
          />
        ) : null}

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Nombre
          <input
            data-testid={nameTestId}
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={
              isSubcategoryCreate || isSubcategoryEdit
                ? "Ej. Hamburguesas, Pizzas"
                : "Ej. Comida, Bebidas, Limpieza"
            }
            className="rounded-lg border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>

        {isEdit ? (
          <CategoryFieldConfigEditor rows={fieldRows} onChange={setFieldRows} />
        ) : null}

        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            data-testid={submitTestId}
            disabled={isSubmitting}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {isSubmitting
              ? "Guardando…"
              : isEdit
                ? "Guardar cambios"
                : isSubcategoryCreate
                  ? "Crear subcategoría"
                  : "Crear categoría"}
          </button>

          {isEdit ? (
            <button
              type="button"
              data-testid={`category-delete-${state.categoryId}`}
              disabled={isDeleting}
              onClick={() => void handleDelete()}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              {isDeleting ? "Eliminando…" : "Eliminar"}
            </button>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
