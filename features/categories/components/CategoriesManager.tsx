"use client";

import { useCallback, useEffect, useState } from "react";

import { CategoryTreeList } from "@/features/categories/components/CategoryTreeList";
import { CreateCategoryForm } from "@/features/categories/components/CreateCategoryForm";
import { CreateSubcategoryForm } from "@/features/categories/components/CreateSubcategoryForm";
import type { CategoryTreeNode, Subcategory } from "@/features/categories/types";
import type { Store } from "@/features/stores/types";

export function CategoriesManager() {
  const [stores, setStores] = useState<Store[]>([]);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const loadCategories = useCallback(async (selectedStoreId: number) => {
    setIsLoadingCategories(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/merchant/stores/${selectedStoreId}/categories`,
      );
      const data = (await response.json()) as CategoryTreeNode[] & {
        detail?: string;
      };

      if (!response.ok) {
        const detail = (data as { detail?: string }).detail;
        setError(detail ?? "No se pudieron cargar las categorías");
        setCategories([]);
        return;
      }

      setCategories(data);
    } catch {
      setError("Error de conexión al cargar categorías.");
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    async function loadStores() {
      setIsLoadingStores(true);
      setError(null);

      try {
        const response = await fetch("/api/merchant/stores");
        const data = (await response.json()) as { results: Store[]; detail?: string };

        if (!response.ok) {
          setError(data.detail ?? "No se pudieron cargar las tiendas");
          return;
        }

        setStores(data.results);

        if (data.results.length > 0) {
          const firstStoreId = data.results[0].id;
          setStoreId(firstStoreId);
          await loadCategories(firstStoreId);
        }
      } catch {
        setError("Error de conexión al cargar tiendas.");
      } finally {
        setIsLoadingStores(false);
      }
    }

    void loadStores();
  }, [loadCategories]);

  async function handleStoreChange(nextStoreId: number) {
    setStoreId(nextStoreId);
    setSuccessMessage(null);
    await loadCategories(nextStoreId);
  }

  function handleCategoryCreated(category: CategoryTreeNode) {
    setCategories((current) => [...current, category]);
    setSuccessMessage(`Categoría "${category.name}" creada correctamente.`);
  }

  function handleSubcategoryCreated(parentId: number, subcategory: Subcategory) {
    setCategories((current) =>
      current.map((category) =>
        category.id === parentId
          ? {
              ...category,
              subcategories: [...category.subcategories, subcategory],
            }
          : category,
      ),
    );
    setSuccessMessage(
      `Subcategoría "${subcategory.name}" creada correctamente.`,
    );
  }

  if (isLoadingStores) {
    return <p className="text-sm text-zinc-500">Cargando tienda…</p>;
  }

  if (stores.length === 0) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        No tienes tiendas registradas. Crea una tienda para gestionar categorías.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {stores.length > 1 ? (
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Tienda
          <select
            value={storeId ?? ""}
            onChange={(event) => handleStoreChange(Number(event.target.value))}
            className="max-w-sm rounded-lg border border-zinc-300 px-3 py-2 font-normal"
          >
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="text-sm text-zinc-600">
          Tienda: <span className="font-medium">{stores[0].name}</span>
        </p>
      )}

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {successMessage ? (
        <p
          data-testid="categories-success-message"
          className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
        >
          {successMessage}
        </p>
      ) : null}

      {storeId ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <CreateCategoryForm
            storeId={storeId}
            onCreated={handleCategoryCreated}
          />
          <CreateSubcategoryForm
            storeId={storeId}
            categories={categories}
            onCreated={handleSubcategoryCreated}
          />
        </div>
      ) : null}

      {isLoadingCategories ? (
        <p className="text-sm text-zinc-500">Cargando categorías…</p>
      ) : (
        <CategoryTreeList categories={categories} />
      )}
    </div>
  );
}
