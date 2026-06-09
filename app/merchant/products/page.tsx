import { IconActionLink } from "@/components/ui/IconActionButton";
import { PlusIcon } from "@/components/ui/icons";
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
        <IconActionLink
          href="/merchant/products/new"
          label="Nuevo producto"
          variant="primary"
          size="md"
          testId="products-create-link"
          icon={<PlusIcon />}
        />
      </div>

      <ProductsManager />
    </section>
  );
}
