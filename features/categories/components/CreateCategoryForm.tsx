"use client";

import { FormEvent, useState } from "react";

import type { CategoryRecord, CategoryTreeNode } from "@/features/categories/types";

interface CreateCategoryFormProps {
  storeId: number;
  onCreated: (category: CategoryTreeNode) => void;
}

export function CreateCategoryForm({ storeId, onCreated }: CreateCategoryFormProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/merchant/stores/${storeId}/categories`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim() }),
        },
      );

      const data = (await response.json()) as CategoryRecord & { detail?: string };

      if (!response.ok) {
        setError(data.detail ?? "No se pudo crear la categoría");
        return;
      }

      onCreated({
        id: data.id,
        name: data.name,
        subcategories: [],
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
      data-testid="create-category-form"
      className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4"
    >
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">Nueva categoría</h3>
        <p className="text-xs text-zinc-600">Categoría raíz de tu tienda.</p>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Nombre
        <input
          data-testid="category-name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal"
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        data-testid="category-submit"
        disabled={isSubmitting}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {isSubmitting ? "Guardando…" : "Crear categoría"}
      </button>
    </form>
  );
}
