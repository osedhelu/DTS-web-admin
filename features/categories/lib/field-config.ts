import type { CategoryFieldConfig, CategoryFieldConfigRow } from "@/features/categories/types";

export const FREE_TEXT_RULE = "texto_libre";

export function fieldConfigToRows(config: CategoryFieldConfig): CategoryFieldConfigRow[] {
  return Object.entries(config).map(([key, value]) => {
    if (value === FREE_TEXT_RULE) {
      return { key, type: "free_text" as const, options: "" };
    }

    return {
      key,
      type: "select" as const,
      options: value.join(", "),
    };
  });
}

export function rowsToFieldConfig(rows: CategoryFieldConfigRow[]): CategoryFieldConfig {
  const config: CategoryFieldConfig = {};

  for (const row of rows) {
    const key = row.key.trim();
    if (!key) {
      continue;
    }

    if (row.type === "free_text") {
      config[key] = FREE_TEXT_RULE;
      continue;
    }

    const options = row.options
      .split(",")
      .map((option) => option.trim())
      .filter(Boolean);

    if (options.length > 0) {
      config[key] = options;
    }
  }

  return config;
}
