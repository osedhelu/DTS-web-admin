"use client";

import { FormEvent, useState } from "react";

import type { Product } from "@/features/products/types";

interface InventoryTableProps {
  products: Product[];
  storeId: number;
  onStockUpdated: (product: Product) => void;
}

export function InventoryTable({
  products,
  storeId,
  onStockUpdated,
}: InventoryTableProps) {
  const [draftStock, setDraftStock] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [rowError, setRowError] = useState<Record<number, string>>({});

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
    product: Product,
  ) {
    event.preventDefault();
    setRowError((current) => ({ ...current, [product.id]: "" }));
    setSavingId(product.id);

    const nextStock = Number(draftStock[product.id] ?? product.stock);

    try {
      const response = await fetch(
        `/api/merchant/stores/${storeId}/products/${product.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stock: nextStock }),
        },
      );

      const data = (await response.json()) as Product & { detail?: string };

      if (!response.ok) {
        setRowError((current) => ({
          ...current,
          [product.id]: data.detail ?? "No se pudo actualizar el stock",
        }));
        return;
      }

      onStockUpdated(data);
      setDraftStock((current) => {
        const next = { ...current };
        delete next[product.id];
        return next;
      });
    } catch {
      setRowError((current) => ({
        ...current,
        [product.id]: "Error de conexión",
      }));
    } finally {
      setSavingId(null);
    }
  }

  if (products.length === 0) {
    return (
      <p data-testid="inventory-empty" className="text-sm text-zinc-500">
        No hay productos físicos con inventario.
      </p>
    );
  }

  return (
    <div
      data-testid="inventory-table"
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
    >
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50 text-left text-zinc-600">
          <tr>
            <th className="px-4 py-3 font-medium">Producto</th>
            <th className="px-4 py-3 font-medium">Stock actual</th>
            <th className="px-4 py-3 font-medium">Actualizar stock</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {products.map((product) => (
            <tr
              key={product.id}
              data-testid={`inventory-row-${product.id}`}
            >
              <td className="px-4 py-3 font-medium text-zinc-900">
                {product.name}
              </td>
              <td
                className="px-4 py-3"
                data-testid={`stock-current-${product.id}`}
              >
                {product.stock}
              </td>
              <td className="px-4 py-3">
                <form
                  className="flex items-center gap-2"
                  onSubmit={(event) => handleSubmit(event, product)}
                >
                  <input
                    data-testid={`stock-input-${product.id}`}
                    type="number"
                    min="0"
                    required
                    value={draftStock[product.id] ?? String(product.stock)}
                    onChange={(event) =>
                      setDraftStock((current) => ({
                        ...current,
                        [product.id]: event.target.value,
                      }))
                    }
                    className="w-24 rounded-lg border border-zinc-300 px-2 py-1"
                  />
                  <button
                    type="submit"
                    data-testid={`stock-save-${product.id}`}
                    disabled={savingId === product.id}
                    className="rounded-lg bg-zinc-900 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
                  >
                    {savingId === product.id ? "Guardando…" : "Actualizar"}
                  </button>
                </form>
                {rowError[product.id] ? (
                  <p className="mt-1 text-xs text-red-600">{rowError[product.id]}</p>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
