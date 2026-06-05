"use client";

import { FormEvent, useState } from "react";

import type {
  CategoryRecord,
  CategoryTreeNode,
  Subcategory,
} from "@/features/categories/types";

interface CreateSubcategoryFormProps {
  storeId: number;
  categories: CategoryTreeNode[];
  onCreated: (parentId: number, subcategory: Subcategory) => void;
}

export function CreateSubcategoryForm({
  storeId,
  categories,
  onCreated,
}: CreateSubcategoryFormProps) {
  const [parentId, setParentId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const parsedParentId = Number(parentId);

    try {
      const response = await fetch(
        `/api/merchant/stores/${storeId}/categories`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            parent_id: parsedParentId,
          }),
        },
      );

      const data = (await response.json()) as CategoryRecord & { detail?: string };

      if (!response.ok) {
        setError(data.detail ?? "No se pudo crear la subcategoría");
        return;
      }

      onCreated(parsedParentId, {
        id: data.id,
        name: data.name,
        parent_id: data.parent_id ?? parsedParentId,
      });
      setName("");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="create-subcategory-form"
      className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4"
    >
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">Nueva subcategoría</h3>
        <p className="text-xs text-zinc-600">
          Debe pertenecer a una categoría raíz existente.
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Categoría padre
        <select
          data-testid="subcategory-parent"
          required
          value={parentId}
          onChange={(event) => setParentId(event.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal"
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Nombre
        <input
          data-testid="subcategory-name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal"
          disabled={categories.length === 0}
        />
      </label>

      {categories.length === 0 ? (
        <p className="text-xs text-zinc-500">
          Crea al menos una categoría raíz antes de agregar subcategorías.
        </p>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        data-testid="subcategory-submit"
        disabled={isSubmitting || categories.length === 0}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {isSubmitting ? "Guardando…" : "Crear subcategoría"}
      </button>
    </form>
  );
}
