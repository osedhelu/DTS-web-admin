"use client";

import { useState } from "react";

import type { CreateCouponPayload } from "@/features/coupons/types";

interface CouponFormProps {
  onSubmit: (payload: CreateCouponPayload) => Promise<boolean>;
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

export function CouponForm({ onSubmit }: CouponFormProps) {
  const [payload, setPayload] = useState(defaultPayload);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const created = await onSubmit(payload);
    if (created) {
      setPayload(defaultPayload);
    }

    setIsSubmitting(false);
  }

  return (
    <form
      data-testid="coupon-form"
      onSubmit={(event) => void handleSubmit(event)}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4"
    >
      <h3 className="text-sm font-semibold text-zinc-900">Nuevo cupón</h3>

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

      <button
        type="submit"
        data-testid="coupon-submit"
        disabled={isSubmitting}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isSubmitting ? "Creando…" : "Crear cupón"}
      </button>
    </form>
  );
}
