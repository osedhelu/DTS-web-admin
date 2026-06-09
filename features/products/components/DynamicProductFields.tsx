"use client";

import Link from "next/link";

import { DiscountBadge } from "@/components/ui/DiscountBadge";
import type { CategoryFieldConfig } from "@/features/categories/types";
import {
  formatOptionPromotionLabel,
  formatOverlayPromotionLabel,
  promotionEditHref,
} from "@/features/promotions/lib/product-promotion-map";
import type { StorePromotion } from "@/features/promotions/types";
import {
  getRuleOptions,
  getSelectedOptions,
  isFreeTextRule,
  isMultiSelectRule,
  type DynamicValues,
} from "@/features/products/lib/dynamic-fields";

interface DynamicProductFieldsProps {
  fieldConfig: CategoryFieldConfig;
  values: DynamicValues;
  onChange: (values: DynamicValues) => void;
  optionPromotions?: Record<string, Record<string, StorePromotion>>;
}

function formatLabel(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export function DynamicProductFields({
  fieldConfig,
  values,
  onChange,
  optionPromotions = {},
}: DynamicProductFieldsProps) {
  const entries = Object.entries(fieldConfig);

  if (entries.length === 0) {
    return null;
  }

  function toggleMultiOption(fieldKey: string, option: string, checked: boolean) {
    const selected = getSelectedOptions(values[fieldKey]);
    const nextSelected = checked
      ? [...selected, option]
      : selected.filter((item) => item !== option);

    onChange({
      ...values,
      [fieldKey]: nextSelected,
    });
  }

  return (
    <div
      data-testid="product-dynamic-fields"
      className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
    >
      <div>
        <h4 className="text-sm font-semibold text-zinc-900">Parámetros de la categoría</h4>
        <p className="text-xs text-zinc-500">
          Elige qué opciones vende este producto (ej. tallas S, M, XL). Usa el campo
          Precio del producto para el valor base. Los descuentos se configuran en
          Promociones.
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
                Opciones definidas en la categoría. Elige cuáles vende este producto.
              </p>
              <div
                data-testid={`product-dynamic-${key}`}
                className="flex flex-wrap items-center gap-3 pt-1"
              >
                {getRuleOptions(rule).map((option, index) => {
                  const selected = getSelectedOptions(values[key]);
                  const isChecked = selected.includes(option);
                  const promotion = optionPromotions[key]?.[option];

                  return (
                    <div
                      key={`${key}-${index}`}
                      className="relative inline-flex"
                    >
                      <label
                        data-testid={`product-dynamic-${key}-${option}`}
                        className={`inline-flex min-h-[2.25rem] min-w-[2.75rem] cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-center text-sm ${
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
                      {promotion ? (
                        <Link
                          href={promotionEditHref(promotion.id)}
                          data-testid={`product-option-promotion-${promotion.id}`}
                          onClick={(event) => event.stopPropagation()}
                          onMouseDown={(event) => event.stopPropagation()}
                          className="absolute -right-2 -top-2 z-10"
                          title={promotion.name}
                        >
                          <DiscountBadge
                            variant="overlay"
                            label={formatOverlayPromotionLabel(promotion)}
                            testId={`product-option-promotion-badge-${promotion.id}`}
                          />
                        </Link>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
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
              {typeof values[key] === "string" && values[key]
                ? (() => {
                    const selectedOption = values[key] as string;
                    const promotion = optionPromotions[key]?.[selectedOption];
                    if (!promotion) {
                      return null;
                    }

                    return (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-zinc-500">Descuento activo:</span>
                        <Link
                          href={promotionEditHref(promotion.id)}
                          data-testid={`product-option-promotion-${promotion.id}`}
                          className="inline-flex"
                          title={promotion.name}
                        >
                          <DiscountBadge
                            label={`${formatOptionPromotionLabel(promotion)} · ${promotion.name}`}
                            testId={`product-option-promotion-badge-${promotion.id}`}
                          />
                        </Link>
                      </div>
                    );
                  })()
                : null}
            </>
          )}
        </fieldset>
      ))}
    </div>
  );
}
