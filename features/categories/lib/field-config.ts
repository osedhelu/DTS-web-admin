import type {
  CategoryFieldConfig,
  CategoryFieldConfigRow,
  CategoryFieldMode,
  CategoryFieldRule,
} from "@/features/categories/types";

export const FREE_TEXT_RULE = "texto_libre";

export function parseFieldRule(rule: CategoryFieldRule): {
  mode: "multi" | "single" | "free_text";
  options: string[];
} {
  if (rule === FREE_TEXT_RULE) {
    return { mode: "free_text", options: [] };
  }

  if (Array.isArray(rule)) {
    return { mode: "multi", options: uniqueOptions(rule) };
  }

  return {
    mode: rule.mode,
    options: uniqueOptions(rule.options),
  };
}

export function uniqueOptions(options: string[]): string[] {
  return [...new Set(options.map((option) => option.trim()).filter(Boolean))];
}

export function fieldConfigToRows(config: CategoryFieldConfig): CategoryFieldConfigRow[] {
  return Object.entries(config).map(([key, value]) => {
    const parsed = parseFieldRule(value);

    if (parsed.mode === "free_text") {
      return { key, type: "free_text" as const, options: "" };
    }

    return {
      key,
      type: parsed.mode === "single" ? ("single_select" as const) : ("multi_select" as const),
      options: parsed.options.join(", "),
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

    const options = uniqueOptions(row.options.split(","));

    if (options.length > 0) {
      const mode: CategoryFieldMode = row.type === "single_select" ? "single" : "multi";
      config[key] = { mode, options };
    }
  }

  return config;
}
