import type { CategoryFieldConfig, CategoryTreeNode } from "@/features/categories/types";

export type DynamicValues = Record<string, string>;

export function resolveProductFieldConfig(
  categories: CategoryTreeNode[],
  categoryId: number | null,
  subcategoryId: number | null,
): CategoryFieldConfig {
  if (categoryId === null) {
    return {};
  }

  const category = categories.find((item) => item.id === categoryId);
  if (!category) {
    return {};
  }

  if (subcategoryId !== null) {
    const subcategory = category.subcategories.find((item) => item.id === subcategoryId);
    if (subcategory?.field_config && Object.keys(subcategory.field_config).length > 0) {
      return subcategory.field_config;
    }
  }

  return category.field_config ?? {};
}

export function isFreeTextRule(rule: CategoryFieldConfig[string]): rule is "texto_libre" {
  return rule === "texto_libre";
}
