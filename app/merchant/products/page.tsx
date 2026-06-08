import Link from "next/link";

import { ProductsManager } from "@/features/products/components/ProductsManager";

export default function MerchantProductsPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900">
            Productos y servicios
          </h2>
          <p className="text-zinc-600">
            Administra tu catálogo de productos físicos y servicios a domicilio.
          </p>
        </div>
        <Link
          href="/merchant/products/new"
          data-testid="products-create-link"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Nuevo producto
        </Link>
      </div>

      <ProductsManager />
    </section>
  );
}
