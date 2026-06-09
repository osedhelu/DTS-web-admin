"use client";

import { useEffect, useState } from "react";

import { UiFeedback } from "@/components/ui/UiFeedback";
import { IconActionButton } from "@/components/ui/IconActionButton";
import { EditIcon, TrashIcon } from "@/components/ui/icons";
import { CouponForm } from "@/features/coupons/components/CouponForm";
import { useCouponsStore } from "@/features/coupons/stores/coupons-store";
import type { Coupon, CreateCouponPayload } from "@/features/coupons/types";

export function CouponsManager() {
  const coupons = useCouponsStore((state) => state.coupons);
  const isLoading = useCouponsStore((state) => state.isLoading);
  const loadCoupons = useCouponsStore((state) => state.loadCoupons);
  const createCoupon = useCouponsStore((state) => state.createCoupon);
  const updateCoupon = useCouponsStore((state) => state.updateCoupon);
  const deleteCoupon = useCouponsStore((state) => state.deleteCoupon);

  const [editing, setEditing] = useState<Coupon | null>(null);

  useEffect(() => {
    void loadCoupons();
  }, [loadCoupons]);

  return (
    <div data-testid="coupons-manager" className="space-y-6">
      <UiFeedback successTestId="coupons-success-message" />

      {editing ? (
        <CouponForm
          key={editing.id}
          initial={editing}
          submitLabel="Guardar cambios"
          onCancel={() => setEditing(null)}
          onSubmit={async (payload) => {
            const saved = await updateCoupon(editing.id, payload);
            if (saved) {
              setEditing(null);
            }
            return saved;
          }}
        />
      ) : (
        <CouponForm
          onSubmit={async (payload) => createCoupon(payload as CreateCouponPayload)}
        />
      )}

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
                <th className="px-4 py-3">Acciones</th>
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
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <IconActionButton
                        label="Editar cupón"
                        testId={`coupon-edit-${coupon.id}`}
                        icon={<EditIcon />}
                        onClick={() => setEditing(coupon)}
                      />
                      <IconActionButton
                        label="Eliminar cupón"
                        variant="danger"
                        testId={`coupon-delete-${coupon.id}`}
                        icon={<TrashIcon />}
                        onClick={() => void deleteCoupon(coupon.id)}
                      />
                    </div>
                  </td>
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
