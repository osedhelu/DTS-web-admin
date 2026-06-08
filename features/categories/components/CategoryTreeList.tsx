"use client";

import type { CategoryFieldConfig, CategoryTreeNode } from "@/features/categories/types";

interface CategoryTreeListProps {
  categories: CategoryTreeNode[];
  storeId: number;
  onCreateCategory: () => void;
  onCreateSubcategory: (parentId: number, parentName: string) => void;
  onEdit: (params: {
    categoryId: number;
    parentId: number | null;
    parentName?: string;
    initialName: string;
    initialFieldConfig?: CategoryFieldConfig;
  }) => void;
}

export function CategoryTreeList({
  categories,
  storeId,
  onCreateCategory,
  onCreateSubcategory,
  onEdit,
}: CategoryTreeListProps) {
  if (categories.length === 0) {
    return (
      <div
        data-testid="categories-empty"
        className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center"
      >
        <p className="text-sm font-medium text-zinc-700">Aún no tienes categorías</p>
        <p className="mt-1 text-sm text-zinc-500">
          Empieza con una categoría raíz (ej. Comida). Luego agrega subcategorías
          (ej. Hamburguesas) sin salir de esta pantalla.
        </p>
        <button
          type="button"
          onClick={onCreateCategory}
          className="mt-4 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Crear primera categoría
        </button>
      </div>
    );
  }

  return (
    <ul data-testid="categories-tree" className="space-y-4">
      {categories.map((category) => (
        <li
          key={category.id}
          data-testid={`category-row-${category.id}`}
          className="rounded-xl border border-zinc-200 bg-white p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Categoría
              </p>
              <p className="text-lg font-semibold text-zinc-900">{category.name}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onCreateSubcategory(category.id, category.name)}
                data-testid={`subcategory-create-link-${category.id}`}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                + Subcategoría
              </button>
              <button
                type="button"
                onClick={() =>
                  onEdit({
                    categoryId: category.id,
                    parentId: null,
                    initialName: category.name,
                    initialFieldConfig: category.field_config,
                  })
                }
                data-testid={`category-edit-${category.id}`}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Editar
              </button>
            </div>
          </div>

          {category.subcategories.length > 0 ? (
            <ul className="mt-4 space-y-2 border-t border-zinc-100 pt-4">
              {category.subcategories.map((subcategory) => (
                <li
                  key={subcategory.id}
                  data-testid={`subcategory-row-${subcategory.id}`}
                  className="flex flex-col gap-2 rounded-lg bg-zinc-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-xs text-zinc-400">Subcategoría</p>
                    <p className="text-sm font-medium text-zinc-800">
                      {subcategory.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onEdit({
                        categoryId: subcategory.id,
                        parentId: subcategory.parent_id,
                        parentName: category.name,
                        initialName: subcategory.name,
                        initialFieldConfig: subcategory.field_config,
                      })
                    }
                    data-testid={`category-edit-${subcategory.id}`}
                    className="text-sm font-medium text-zinc-700 hover:underline"
                  >
                    Editar
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">
              Sin subcategorías. Usa «+ Subcategoría» para agregar una.
            </p>
          )}

          <span className="sr-only">store-{storeId}</span>
        </li>
      ))}
    </ul>
  );
}
