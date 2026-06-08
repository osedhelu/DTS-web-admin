import Link from "next/link";

import { CategoriesManager } from "@/features/categories/components/CategoriesManager";

export default function MerchantCategoriesPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900">
            Categorías y subcategorías
          </h2>
          <p className="text-zinc-600">
            Organiza tu catálogo en dos niveles: primero categorías raíz y luego
            subcategorías dentro de cada una.
          </p>
        </div>
        <Link
          href="/merchant/categories/new"
          data-testid="categories-create-link"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Nueva categoría
        </Link>
      </div>

      <CategoriesManager />
    </section>
  );
}
