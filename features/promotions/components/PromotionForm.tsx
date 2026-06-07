"use client";

import { useState } from "react";

import type {
  CreatePromotionPayload,
  StorePromotion,
  UpdatePromotionPayload,
} from "@/features/promotions/types";

interface PromotionFormProps {
  initial?: StorePromotion | null;
  onSubmit: (
    payload: CreatePromotionPayload | UpdatePromotionPayload,
  ) => Promise<boolean>;
  onCancel?: () => void;
  submitLabel?: string;
}

const defaultPayload: CreatePromotionPayload = {
  name: "",
  discount_type: "PERCENTAGE",
  discount_value: "10",
  product_id: null,
};

function formatDiscountType(type: StorePromotion["discount_type"]): string {
  return type === "PERCENTAGE" ? "Porcentaje" : "Monto fijo";
}

export function PromotionForm({
  initial = null,
  onSubmit,
  onCancel,
  submitLabel,
}: PromotionFormProps) {
  const [payload, setPayload] = useState<CreatePromotionPayload>(
    initial
      ? {
          name: initial.name,
          discount_type: initial.discount_type,
          discount_value: initial.discount_value,
          product_id: initial.product_id,
          valid_from: initial.valid_from,
          valid_until: initial.valid_until,
        }
      : defaultPayload,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const saved = await onSubmit(payload);
    if (saved && !initial) {
      setPayload(defaultPayload);
    }

    setIsSubmitting(false);
  }

  return (
    <form
      data-testid={initial ? "promotion-edit-form" : "promotion-form"}
      onSubmit={(event) => void handleSubmit(event)}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4"
    >
      <h3 className="text-sm font-semibold text-zinc-900">
        {initial ? "Editar promoción" : "Nueva promoción"}
      </h3>

      <label className="flex flex-col gap-1 text-sm">
        Nombre
        <input
          data-testid="promotion-name"
          required
          value={payload.name}
          onChange={(event) =>
            setPayload((current) => ({ ...current, name: event.target.value }))
          }
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Tipo de descuento
        <select
          data-testid="promotion-discount-type"
          value={payload.discount_type}
          onChange={(event) =>
            setPayload((current) => ({
              ...current,
              discount_type: event.target.value as CreatePromotionPayload["discount_type"],
            }))
          }
          className="rounded-lg border border-zinc-300 px-3 py-2"
        >
          <option value="PERCENTAGE">Porcentaje</option>
          <option value="FIXED">Monto fijo</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Valor
        <input
          data-testid="promotion-discount-value"
          required
          type="number"
          min="0"
          step="0.01"
          value={payload.discount_value}
          onChange={(event) =>
            setPayload((current) => ({
              ...current,
              discount_value: event.target.value,
            }))
          }
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <p className="text-xs text-zinc-500">
        Alcance: {initial?.product_id ? "Producto específico" : "Toda la tienda"}
      </p>

      <div className="flex gap-2">
        <button
          type="submit"
          data-testid="promotion-submit"
          disabled={isSubmitting}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? "Guardando…" : submitLabel ?? (initial ? "Guardar" : "Crear promoción")}
        </button>
        {onCancel ? (
          <button
            type="button"
            data-testid="promotion-cancel"
            onClick={onCancel}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}

export function formatPromotionSummary(promotion: StorePromotion): string {
  if (promotion.discount_type === "PERCENTAGE") {
    return `${promotion.discount_value}%`;
  }

  return `$${promotion.discount_value}`;
}

export { formatDiscountType };
