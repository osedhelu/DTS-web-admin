import type { CategoryTreeNode } from "@/features/categories/types";

import { CategoryRowActions } from "./CategoryRowActions";

interface CategoryTreeListProps {
  categories: CategoryTreeNode[];
  storeId: number;
  onUpdate: (
    categoryId: number,
    name: string,
    parentId: number | null,
  ) => Promise<boolean>;
  onDelete: (categoryId: number, parentId: number | null) => Promise<boolean>;
}

export function CategoryTreeList({
  categories,
  storeId,
  onUpdate,
  onDelete,
}: CategoryTreeListProps) {
  if (categories.length === 0) {
    return (
      <p data-testid="categories-empty" className="text-sm text-zinc-500">
        No hay categorías registradas.
      </p>
    );
  }

  return (
    <ul
      data-testid="categories-tree"
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4"
    >
      {categories.map((category) => (
        <li key={category.id} data-testid={`category-row-${category.id}`}>
          <p className="font-medium text-zinc-900">{category.name}</p>
          <CategoryRowActions
            categoryId={category.id}
            parentId={null}
            initialName={category.name}
            storeId={storeId}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
          {category.subcategories.length > 0 ? (
            <ul className="mt-2 space-y-3 border-l border-zinc-200 pl-4">
              {category.subcategories.map((subcategory) => (
                <li
                  key={subcategory.id}
                  data-testid={`subcategory-row-${subcategory.id}`}
                >
                  <p className="text-sm text-zinc-600">{subcategory.name}</p>
                  <CategoryRowActions
                    categoryId={subcategory.id}
                    parentId={subcategory.parent_id}
                    initialName={subcategory.name}
                    storeId={storeId}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-zinc-400">Sin subcategorías</p>
          )}
        </li>
      ))}
    </ul>
  );
}
