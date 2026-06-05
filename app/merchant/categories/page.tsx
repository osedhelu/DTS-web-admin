import { CategoriesManager } from "@/features/categories/components/CategoriesManager";

export default function MerchantCategoriesPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">
          Categorías y subcategorías
        </h2>
        <p className="text-zinc-600">
          Organiza el catálogo de tu tienda en dos niveles: categoría raíz y
          subcategoría.
        </p>
      </div>

      <CategoriesManager />
    </section>
  );
}
