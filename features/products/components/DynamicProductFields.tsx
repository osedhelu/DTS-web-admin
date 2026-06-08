"use client";

import type { CategoryFieldConfig } from "@/features/categories/types";
import {
  getRuleOptions,
  isFreeTextRule,
  isMultiSelectRule,
  type DynamicValues,
} from "@/features/products/lib/dynamic-fields";

interface DynamicProductFieldsProps {
  fieldConfig: CategoryFieldConfig;
  values: DynamicValues;
  onChange: (values: DynamicValues) => void;
}

function formatLabel(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
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

  function toggleMultiOption(fieldKey: string, option: string, checked: boolean) {
    const current = values[fieldKey];
    const selected = Array.isArray(current) ? current : [];

    const next = checked
      ? [...selected, option]
      : selected.filter((item) => item !== option);

    onChange({ ...values, [fieldKey]: next });
  }

  return (
    <div
      data-testid="product-dynamic-fields"
      className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
    >
      <div>
        <h4 className="text-sm font-semibold text-zinc-900">Parámetros de la categoría</h4>
        <p className="text-xs text-zinc-500">
          Indica qué opciones ofrece este producto según la configuración de la categoría.
        </p>
      </div>

      {entries.map(([key, rule]) => (
        <fieldset
          key={key}
          className="space-y-2 rounded-lg border border-zinc-200 bg-white p-3"
        >
          <legend className="px-1 text-sm font-medium text-zinc-800">
            {formatLabel(key)}
          </legend>

          {isFreeTextRule(rule) ? (
            <input
              data-testid={`product-dynamic-${key}`}
              required
              value={typeof values[key] === "string" ? values[key] : ""}
              onChange={(event) =>
                onChange({ ...values, [key]: event.target.value })
              }
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-normal"
            />
          ) : isMultiSelectRule(rule) ? (
            <>
              <p className="text-xs text-zinc-500">
                Marca las opciones que este producto maneja (puedes elegir varias).
              </p>
              <div
                data-testid={`product-dynamic-${key}`}
                className="flex flex-wrap gap-2"
              >
                {getRuleOptions(rule).map((option, index) => {
                  const selected = Array.isArray(values[key]) ? values[key] : [];
                  const isChecked = selected.includes(option);

                  return (
                    <label
                      key={`${key}-${index}`}
                      data-testid={`product-dynamic-${key}-${option}`}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                        isChecked
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isChecked}
                        onChange={(event) =>
                          toggleMultiOption(key, option, event.target.checked)
                        }
                      />
                      {option}
                    </label>
                  );
                })}
              </div>
            </>
          ) : (
            <select
              data-testid={`product-dynamic-${key}`}
              required
              value={typeof values[key] === "string" ? values[key] : ""}
              onChange={(event) =>
                onChange({ ...values, [key]: event.target.value })
              }
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-normal"
            >
              <option value="">Selecciona…</option>
              {getRuleOptions(rule).map((option, index) => (
                <option key={`${key}-${index}`} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
        </fieldset>
      ))}
    </div>
  );
}
