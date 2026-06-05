import type { Product } from "@/features/products/types";

interface ServicesWithoutStockProps {
  services: Product[];
}

export function ServicesWithoutStock({ services }: ServicesWithoutStockProps) {
  if (services.length === 0) {
    return null;
  }

  return (
    <section
      data-testid="inventory-services-section"
      className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
    >
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">Servicios</h3>
        <p className="text-sm text-zinc-600">
          Los servicios no gestionan inventario ni stock.
        </p>
      </div>

      <ul className="space-y-2">
        {services.map((service) => (
          <li
            key={service.id}
            data-testid={`inventory-service-row-${service.id}`}
            className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
          >
            <span className="font-medium text-zinc-900">{service.name}</span>
            <span className="text-zinc-500">Sin inventario</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
