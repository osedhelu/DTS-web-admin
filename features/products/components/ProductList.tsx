"use client";

import type { Product } from "@/features/products/types";

interface ProductListProps {
  products: Product[];
  onDeactivate: (productId: number) => Promise<void>;
  isLoading?: boolean;
}

function formatProductType(productType: Product["product_type"]): string {
  return productType === "service" ? "Servicio" : "Producto físico";
}

export function ProductList({
  products,
  onDeactivate,
  isLoading = false,
}: ProductListProps) {
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
    <div data-testid="products-list" className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50 text-left text-zinc-600">
          <tr>
            <th className="px-4 py-3 font-medium">Nombre</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium">Precio</th>
            <th className="px-4 py-3 font-medium">Detalle</th>
            <th className="px-4 py-3 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {products.map((product) => (
            <tr key={product.id} data-testid={`product-row-${product.id}`}>
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
                <button
                  type="button"
                  onClick={() => onDeactivate(product.id)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Desactivar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
