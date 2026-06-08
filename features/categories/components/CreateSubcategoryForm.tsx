"use client";

import { FormEvent, useState } from "react";

import { CategoryFormScreen } from "@/features/categories/components/CategoryFormScreen";
import type { CategoryRecord, Subcategory } from "@/features/categories/types";

interface CreateSubcategoryFormProps {
  storeId: number;
  parentId: number;
  parentName?: string;
  onCreated: (parentId: number, subcategory: Subcategory) => void;
}

export function CreateSubcategoryForm({
  storeId,
  parentId,
  parentName,
  onCreated,
}: CreateSubcategoryFormProps) {
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
          body: JSON.stringify({
            name: name.trim(),
            parent_id: parentId,
          }),
        },
      );

      const data = (await response.json()) as CategoryRecord & { detail?: string };

      if (!response.ok) {
        setError(data.detail ?? "No se pudo crear la subcategoría");
        return;
      }

      onCreated(parentId, {
        id: data.id,
        name: data.name,
        parent_id: data.parent_id ?? parentId,
      });
      setName("");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CategoryFormScreen
      title="Nueva subcategoría"
      subtitle={
        parentName
          ? `Dentro de la categoría «${parentName}»`
          : "Subcategoría de segundo nivel"
      }
    >
      <form
        onSubmit={handleSubmit}
        data-testid="create-subcategory-form"
        className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Nombre
          <input
            data-testid="subcategory-name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Hamburguesas, Pizzas, Postres"
            className="rounded-lg border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>

        <input type="hidden" data-testid="subcategory-parent" value={String(parentId)} readOnly />

        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          data-testid="subcategory-submit"
          disabled={isSubmitting}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {isSubmitting ? "Guardando…" : "Crear subcategoría"}
        </button>
      </form>
    </CategoryFormScreen>
  );
}
