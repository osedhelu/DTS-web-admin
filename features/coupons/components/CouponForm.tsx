"use client";

import { useState } from "react";

import type {
  Coupon,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "@/features/coupons/types";

interface CouponFormProps {
  initial?: Coupon | null;
  submitLabel?: string;
  onSubmit: (
    payload: CreateCouponPayload | UpdateCouponPayload,
  ) => Promise<boolean>;
  onCancel?: () => void;
}

const defaultPayload: CreateCouponPayload = {
  code: "",
  discount_type: "percentage",
  discount_value: "10",
  min_order_total: "0",
  max_uses: null,
  valid_from: new Date().toISOString().slice(0, 10),
  valid_until: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10),
  is_active: true,
};

export function CouponForm({
  initial = null,
  submitLabel,
  onSubmit,
  onCancel,
}: CouponFormProps) {
  const [payload, setPayload] = useState<CreateCouponPayload>(
    initial
      ? {
          code: initial.code,
          discount_type: initial.discount_type,
          discount_value: initial.discount_value,
          min_order_total: initial.min_order_total,
          max_uses: initial.max_uses,
          valid_from: initial.valid_from.slice(0, 10),
          valid_until: initial.valid_until.slice(0, 10),
          is_active: initial.is_active,
        }
      : defaultPayload,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);

    const saved = await onSubmit(payload);
    if (saved && !initial) {
      setPayload(defaultPayload);
    }

    setIsSubmitting(false);
  }

  return (
    <form
      data-testid={initial ? "coupon-edit-form" : "coupon-form"}
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4"
    >
      <h3 className="text-sm font-semibold text-zinc-900">
        {initial ? "Editar cupón" : "Nuevo cupón"}
      </h3>

      <label className="flex flex-col gap-1 text-sm">
        Código
        <input
          data-testid="coupon-code"
          required
          value={payload.code}
          onChange={(event) =>
            setPayload((current) => ({ ...current, code: event.target.value }))
          }
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Tipo de descuento
        <select
          data-testid="coupon-discount-type"
          value={payload.discount_type}
          onChange={(event) =>
            setPayload((current) => ({
              ...current,
              discount_type: event.target.value as CreateCouponPayload["discount_type"],
            }))
          }
          className="rounded-lg border border-zinc-300 px-3 py-2"
        >
          <option value="percentage">Porcentaje</option>
          <option value="fixed">Monto fijo</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Valor
        <input
          data-testid="coupon-discount-value"
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

      <label className="flex items-center gap-2 text-sm">
        <input
          data-testid="coupon-is-active"
          type="checkbox"
          checked={payload.is_active}
          onChange={(event) =>
            setPayload((current) => ({ ...current, is_active: event.target.checked }))
          }
        />
        Activo
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          data-testid="coupon-submit"
          disabled={isSubmitting}
          onClick={() => void handleSubmit()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? "Guardando…" : (submitLabel ?? "Crear cupón")}
        </button>
        {onCancel ? (
          <button
            type="button"
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
