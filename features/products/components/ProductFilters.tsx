"use client";

export type ProductTypeFilter = "all" | "physical" | "service";

interface ProductFiltersProps {
  search: string;
  typeFilter: ProductTypeFilter;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: ProductTypeFilter) => void;
}

export function ProductFilters({
  search,
  typeFilter,
  onSearchChange,
  onTypeFilterChange,
}: ProductFiltersProps) {
  return (
    <div
      data-testid="products-filters"
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-end"
    >
      <label className="flex flex-1 flex-col gap-1 text-sm">
        Buscar
        <input
          data-testid="products-search-input"
          type="search"
          placeholder="Nombre del producto o servicio"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex w-full flex-col gap-1 text-sm sm:w-48">
        Tipo
        <select
          data-testid="products-type-filter"
          value={typeFilter}
          onChange={(event) =>
            onTypeFilterChange(event.target.value as ProductTypeFilter)
          }
          className="rounded-lg border border-zinc-300 px-3 py-2"
        >
          <option value="all">Todos</option>
          <option value="physical">Producto físico</option>
          <option value="service">Servicio</option>
        </select>
      </label>
    </div>
  );
}
