"use client";

import { useEffect } from "react";

import { UiFeedback } from "@/components/ui/UiFeedback";
import { CouponForm } from "@/features/coupons/components/CouponForm";
import { useCouponsStore } from "@/features/coupons/stores/coupons-store";

export function CouponsManager() {
  const coupons = useCouponsStore((state) => state.coupons);
  const isLoading = useCouponsStore((state) => state.isLoading);
  const loadCoupons = useCouponsStore((state) => state.loadCoupons);
  const createCoupon = useCouponsStore((state) => state.createCoupon);

  useEffect(() => {
    void loadCoupons();
  }, [loadCoupons]);

  return (
    <div data-testid="coupons-manager" className="space-y-6">
      <UiFeedback successTestId="coupons-success-message" />

      <CouponForm onSubmit={createCoupon} />

      {isLoading ? (
        <p className="text-sm text-zinc-500">Cargando cupones…</p>
      ) : (
        <div data-testid="coupons-list" className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-600">
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Usos</th>
                <th className="px-4 py-3">Activo</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr
                  key={coupon.id}
                  data-testid={`coupon-row-${coupon.id}`}
                  className="border-b border-zinc-100"
                >
                  <td className="px-4 py-3 font-medium">{coupon.code}</td>
                  <td className="px-4 py-3">{coupon.discount_type}</td>
                  <td className="px-4 py-3">{coupon.discount_value}</td>
                  <td className="px-4 py-3">
                    {coupon.used_count}
                    {coupon.max_uses !== null ? ` / ${coupon.max_uses}` : ""}
                  </td>
                  <td className="px-4 py-3">{coupon.is_active ? "Sí" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 ? (
            <p className="px-4 py-3 text-sm text-zinc-500">No hay cupones creados.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
