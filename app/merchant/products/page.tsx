import { ProductsManager } from "@/features/products/components/ProductsManager";

export default function MerchantProductsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">
          Productos y servicios
        </h2>
        <p className="text-zinc-600">
          Crea productos físicos o servicios a domicilio para tu tienda.
        </p>
      </div>

      <ProductsManager />
    </section>
  );
}
