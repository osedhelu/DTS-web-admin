"use client";

import type { CategoryTreeNode } from "@/features/categories/types";

interface CategorySelectorProps {
  categories: CategoryTreeNode[];
  categoryId: number | null;
  subcategoryId: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  onSubcategoryChange: (subcategoryId: number | null) => void;
}

export function CategorySelector({
  categories,
  categoryId,
  subcategoryId,
  onCategoryChange,
  onSubcategoryChange,
}: CategorySelectorProps) {
  const selectedCategory = categories.find((category) => category.id === categoryId);
  const subcategories = selectedCategory?.subcategories ?? [];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Categoría
        <select
          data-testid="product-category"
          value={categoryId ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            onCategoryChange(value ? Number(value) : null);
            onSubcategoryChange(null);
          }}
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal"
        >
          <option value="">Sin categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Subcategoría
        <select
          data-testid="product-subcategory"
          value={subcategoryId ?? ""}
          disabled={!categoryId || subcategories.length === 0}
          onChange={(event) => {
            const value = event.target.value;
            onSubcategoryChange(value ? Number(value) : null);
          }}
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal disabled:bg-zinc-100"
        >
          <option value="">Sin subcategoría</option>
          {subcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
