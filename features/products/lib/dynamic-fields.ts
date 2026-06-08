import {
  parseFieldRule,
  uniqueOptions,
} from "@/features/categories/lib/field-config";
import type { CategoryFieldConfig, CategoryTreeNode } from "@/features/categories/types";

export type DynamicValue = string | string[];
export type DynamicValues = Record<string, DynamicValue>;

export function mergeFieldConfig(
  parent: CategoryFieldConfig | undefined,
  child: CategoryFieldConfig | undefined,
): CategoryFieldConfig {
  return {
    ...(parent ?? {}),
    ...(child ?? {}),
  };
}

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

  const parentConfig = category.field_config ?? {};

  if (subcategoryId !== null) {
    const subcategory = category.subcategories.find((item) => item.id === subcategoryId);
    return mergeFieldConfig(parentConfig, subcategory?.field_config);
  }

  return parentConfig;
}

export function isFreeTextRule(rule: CategoryFieldConfig[string]): boolean {
  return parseFieldRule(rule).mode === "free_text";
}

export function isMultiSelectRule(rule: CategoryFieldConfig[string]): boolean {
  return parseFieldRule(rule).mode === "multi";
}

export function getRuleOptions(rule: CategoryFieldConfig[string]): string[] {
  return uniqueOptions(parseFieldRule(rule).options);
}

export function normalizeDynamicValueForForm(
  rule: CategoryFieldConfig[string],
  value: DynamicValue | undefined,
): DynamicValue {
  if (isFreeTextRule(rule)) {
    return typeof value === "string" ? value : "";
  }

  if (isMultiSelectRule(rule)) {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === "string" && value) {
      return [value];
    }
    return [];
  }

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

export function buildEmptyDynamicValues(fieldConfig: CategoryFieldConfig): DynamicValues {
  const values: DynamicValues = {};

  for (const [key, rule] of Object.entries(fieldConfig)) {
    values[key] = normalizeDynamicValueForForm(rule, undefined);
  }

  return values;
}

export function syncDynamicValues(
  fieldConfig: CategoryFieldConfig,
  current: DynamicValues,
): DynamicValues {
  const next = buildEmptyDynamicValues(fieldConfig);

  for (const key of Object.keys(fieldConfig)) {
    next[key] = normalizeDynamicValueForForm(fieldConfig[key], current[key]);
  }

  return next;
}
