"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { CategoryFormScreen } from "@/features/categories/components/CategoryFormScreen";
import { useCategoriesStore } from "@/features/categories/stores/categories-store";

interface CategoryEditFormProps {
  storeId: number;
  categoryId: number;
  initialName: string;
  parentId: number | null;
  parentName?: string;
}

export function CategoryEditForm({
  storeId,
  categoryId,
  initialName,
  parentId,
  parentName,
}: CategoryEditFormProps) {
  const router = useRouter();
  const updateCategory = useCategoriesStore((state) => state.updateCategory);
  const deleteCategory = useCategoriesStore((state) => state.deleteCategory);

  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isSubcategory = parentId !== null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const saved = await updateCategory(storeId, categoryId, name.trim(), parentId);
    setIsSubmitting(false);

    if (saved) {
      sessionStorage.setItem(
        "category-create-success",
        `Categoría "${name.trim()}" actualizada correctamente.`,
      );
      router.push("/merchant/categories");
    }
  }

  async function handleDelete() {
    const label = isSubcategory ? "esta subcategoría" : "esta categoría";
    if (!window.confirm(`¿Eliminar ${label}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setIsDeleting(true);
    const deleted = await deleteCategory(storeId, categoryId, parentId);
    setIsDeleting(false);

    if (deleted) {
      sessionStorage.setItem(
        "category-create-success",
        "Categoría eliminada correctamente.",
      );
      router.push("/merchant/categories");
    }
  }

  return (
    <CategoryFormScreen
      title={initialName}
      subtitle={
        isSubcategory
          ? `Subcategoría de «${parentName ?? "categoría padre"}»`
          : "Categoría raíz del catálogo"
      }
    >
      <form
        onSubmit={handleSubmit}
        data-testid="category-edit-form"
        className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Nombre
          <input
            data-testid={`category-edit-input-${categoryId}`}
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>

        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            data-testid={`category-save-${categoryId}`}
            disabled={isSubmitting}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {isSubmitting ? "Guardando…" : "Guardar cambios"}
          </button>

          <button
            type="button"
            data-testid={`category-delete-${categoryId}`}
            disabled={isDeleting}
            onClick={() => void handleDelete()}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            {isDeleting ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </form>
    </CategoryFormScreen>
  );
}
