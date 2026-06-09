import {
  parseFieldRule,
  uniqueOptions,
} from "@/features/categories/lib/field-config";
import type { CategoryFieldConfig, CategoryTreeNode } from "@/features/categories/types";

export type DynamicMultiWithPrices = {
  options: string[];
  prices?: Record<string, string>;
};

export type DynamicValue = string | string[] | DynamicMultiWithPrices;
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

export function getSelectedOptions(value: DynamicValue | undefined): string[] {
  if (value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return value ? [value] : [];
  }

  return value.options ?? [];
}

export function getOptionPrices(value: DynamicValue | undefined): Record<string, string> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value.prices ?? {};
  }

  return {};
}

export function buildMultiDynamicValue(
  selected: string[],
  prices: Record<string, string>,
): DynamicValue {
  const cleanedPrices = Object.fromEntries(
    Object.entries(prices).filter(
      ([option, price]) => selected.includes(option) && price.trim(),
    ),
  );

  if (Object.keys(cleanedPrices).length > 0) {
    return { options: selected, prices: cleanedPrices };
  }

  return selected;
}

export function normalizeDynamicValueForForm(
  rule: CategoryFieldConfig[string],
  value: DynamicValue | undefined,
): DynamicValue {
  if (isFreeTextRule(rule)) {
    return typeof value === "string" ? value : "";
  }

  if (isMultiSelectRule(rule)) {
    return getSelectedOptions(value);
  }

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  if (value && typeof value === "object") {
    return getSelectedOptions(value)[0] ?? "";
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
