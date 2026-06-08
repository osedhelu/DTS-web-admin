"use client";

import type { CategoryFieldConfig } from "@/features/categories/types";
import { isFreeTextRule } from "@/features/products/lib/dynamic-fields";
import type { DynamicValues } from "@/features/products/lib/dynamic-fields";

interface DynamicProductFieldsProps {
  fieldConfig: CategoryFieldConfig;
  values: DynamicValues;
  onChange: (values: DynamicValues) => void;
}

export function DynamicProductFields({
  fieldConfig,
  values,
  onChange,
}: DynamicProductFieldsProps) {
  const entries = Object.entries(fieldConfig);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div
      data-testid="product-dynamic-fields"
      className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
    >
      <div>
        <h4 className="text-sm font-semibold text-zinc-900">Parámetros de la categoría</h4>
        <p className="text-xs text-zinc-500">
          Completa los campos definidos para esta categoría.
        </p>
      </div>

      {entries.map(([key, rule]) => (
        <label
          key={key}
          className="flex flex-col gap-1 text-sm font-medium text-zinc-700"
        >
          {key.charAt(0).toUpperCase() + key.slice(1)}
          {isFreeTextRule(rule) ? (
            <input
              data-testid={`product-dynamic-${key}`}
              required
              value={values[key] ?? ""}
              onChange={(event) =>
                onChange({ ...values, [key]: event.target.value })
              }
              className="rounded-lg border border-zinc-300 px-3 py-2 font-normal"
            />
          ) : (
            <select
              data-testid={`product-dynamic-${key}`}
              required
              value={values[key] ?? ""}
              onChange={(event) =>
                onChange({ ...values, [key]: event.target.value })
              }
              className="rounded-lg border border-zinc-300 px-3 py-2 font-normal"
            >
              <option value="">Selecciona…</option>
              {rule.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
        </label>
      ))}
    </div>
  );
}
