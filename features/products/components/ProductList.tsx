"use client";

import { useMemo, useState } from "react";

import { DiscountBadge } from "@/components/ui/DiscountBadge";
import { IconActionButton, IconActionLink } from "@/components/ui/IconActionButton";
import { DeactivateIcon, EditIcon } from "@/components/ui/icons";
import { resolvePrimaryImageUrl } from "@/features/products/lib/primary-image";
import { resolveMediaUrl } from "@/lib/media-url";
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
              const thumbnail = resolvePrimaryImageUrl(
                undefined,
                product.primary_image_url,
              );

              return (
                <tr key={product.id} data-testid={`product-row-${product.id}`}>
                  <td className="px-4 py-3">
                    <div
                      data-testid={`product-thumbnail-${product.id}`}
                      className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-zinc-100 text-xs text-zinc-400"
                    >
                      {thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resolveMediaUrl(thumbnail) || thumbnail}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        "—"
                      )}
                      {product.promotion_badge ? (
                        <span className="absolute bottom-0 left-0 right-0 bg-amber-500/90 px-0.5 text-center text-[8px] font-bold leading-tight text-white">
                          %
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    <div className="flex flex-col gap-1">
                      <span>{product.name}</span>
                      {product.promotion_badge ? (
                        <DiscountBadge
                          label={product.promotion_badge}
                          testId={`product-promotion-badge-${product.id}`}
                        />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatProductType(product.product_type)}</td>
                  <td className="px-4 py-3">
                    <div className="relative inline-flex">
                      ${product.price}
                      {product.promotion_badge ? (
                        <span
                          className="absolute -right-2 -top-2 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white"
                          aria-hidden
                        />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {product.product_type === "service"
                      ? product.duration_minutes
                        ? `${product.duration_minutes} min`
                        : "—"
                      : `Stock: ${product.stock}`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <IconActionLink
                        href={`/merchant/products/${product.id}`}
                        label="Editar producto"
                        testId={`product-edit-${product.id}`}
                        icon={<EditIcon />}
                      />
                      <IconActionButton
                        label="Desactivar producto"
                        variant="danger"
                        icon={<DeactivateIcon />}
                        onClick={() => onDeactivate(product.id)}
                      />
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
