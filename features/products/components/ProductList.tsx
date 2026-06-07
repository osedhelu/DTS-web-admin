"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { productMediaUrl } from "@/lib/products/media-url";
import type { Product } from "@/features/products/types";

interface ProductListProps {
  products: Product[];
  onDeactivate: (productId: number) => Promise<void>;
  isLoading?: boolean;
}

const PAGE_SIZE = 10;

function formatProductType(productType: Product["product_type"]): string {
  return productType === "service" ? "Servicio" : "Producto físico";
}

export function ProductList({
  products,
  onDeactivate,
  isLoading = false,
}: ProductListProps) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);

  const visibleProducts = useMemo(
    () =>
      products.slice(
        currentPage * PAGE_SIZE,
        currentPage * PAGE_SIZE + PAGE_SIZE,
      ),
    [currentPage, products],
  );

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Cargando catálogo…</p>;
  }

  if (products.length === 0) {
    return (
      <p data-testid="products-empty" className="text-sm text-zinc-500">
        No hay ítems en el catálogo.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div
        data-testid="products-list"
        className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
      >
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">Foto</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Detalle</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {visibleProducts.map((product) => {
              const thumbnail = product.primary_image_url;

              return (
                <tr key={product.id} data-testid={`product-row-${product.id}`}>
                  <td className="px-4 py-3">
                    <div
                      data-testid={`product-thumbnail-${product.id}`}
                      className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-zinc-100 text-xs text-zinc-400"
                    >
                      {thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={productMediaUrl(thumbnail)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        "—"
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {product.name}
                  </td>
                  <td className="px-4 py-3">{formatProductType(product.product_type)}</td>
                  <td className="px-4 py-3">${product.price}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {product.product_type === "service"
                      ? product.duration_minutes
                        ? `${product.duration_minutes} min`
                        : "—"
                      : `Stock: ${product.stock}`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/merchant/products/${product.id}`}
                        data-testid={`product-edit-${product.id}`}
                        className="text-sm font-medium text-zinc-900 hover:underline"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDeactivate(product.id)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Desactivar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div
          data-testid="products-pagination"
          className="flex items-center justify-between text-sm text-zinc-600"
        >
          <span>
            Página {currentPage + 1} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              data-testid="products-prev-page"
              disabled={currentPage === 0}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              className="rounded border border-zinc-300 px-3 py-1 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              data-testid="products-next-page"
              disabled={currentPage >= totalPages - 1}
              onClick={() =>
                setPage((value) => Math.min(totalPages - 1, value + 1))
              }
              className="rounded border border-zinc-300 px-3 py-1 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
