"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { InventoryTable } from "@/features/inventory/components/InventoryTable";
import { ServicesWithoutStock } from "@/features/inventory/components/ServicesWithoutStock";
import type { Product } from "@/features/products/types";
import type { Store } from "@/features/stores/types";
import type { PaginatedResponse } from "@/lib/api/types";

export function InventoryManager() {
  const [stores, setStores] = useState<Store[]>([]);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const physicalProducts = useMemo(
    () => products.filter((product) => product.product_type === "physical"),
    [products],
  );
  const services = useMemo(
    () => products.filter((product) => product.product_type === "service"),
    [products],
  );

  const loadProducts = useCallback(async (selectedStoreId: number) => {
    setIsLoadingProducts(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/merchant/stores/${selectedStoreId}/products`,
      );
      const data = (await response.json()) as PaginatedResponse<Product> & {
        detail?: string;
      };

      if (!response.ok) {
        setError(data.detail ?? "No se pudo cargar el inventario");
        setProducts([]);
        return;
      }

      setProducts(data.results);
    } catch {
      setError("Error de conexión al cargar inventario.");
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
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
          await loadProducts(firstStoreId);
        }
      } catch {
        setError("Error de conexión al cargar tiendas.");
      } finally {
        setIsLoadingStores(false);
      }
    }

    void loadStores();
  }, [loadProducts]);

  async function handleStoreChange(nextStoreId: number) {
    setStoreId(nextStoreId);
    setSuccessMessage(null);
    await loadProducts(nextStoreId);
  }

  function handleStockUpdated(product: Product) {
    setProducts((current) =>
      current.map((item) => (item.id === product.id ? product : item)),
    );
    setSuccessMessage(
      `Stock de "${product.name}" actualizado a ${product.stock} unidades.`,
    );
  }

  if (isLoadingStores) {
    return <p className="text-sm text-zinc-500">Cargando tienda…</p>;
  }

  if (stores.length === 0) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        No tienes tiendas registradas. Crea una tienda para gestionar inventario.
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
          data-testid="inventory-success-message"
          className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
        >
          {successMessage}
        </p>
      ) : null}

      {isLoadingProducts ? (
        <p className="text-sm text-zinc-500">Cargando inventario…</p>
      ) : (
        <>
          {storeId ? (
            <InventoryTable
              products={physicalProducts}
              storeId={storeId}
              onStockUpdated={handleStockUpdated}
            />
          ) : null}
          <ServicesWithoutStock services={services} />
        </>
      )}
    </div>
  );
}
