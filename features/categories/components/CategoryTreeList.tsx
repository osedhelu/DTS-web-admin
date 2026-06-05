import type { CategoryTreeNode } from "@/features/categories/types";

interface CategoryTreeListProps {
  categories: CategoryTreeNode[];
}

export function CategoryTreeList({ categories }: CategoryTreeListProps) {
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
          {category.subcategories.length > 0 ? (
            <ul className="mt-2 space-y-1 border-l border-zinc-200 pl-4">
              {category.subcategories.map((subcategory) => (
                <li
                  key={subcategory.id}
                  data-testid={`subcategory-row-${subcategory.id}`}
                  className="text-sm text-zinc-600"
                >
                  {subcategory.name}
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
