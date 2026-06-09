"use client";

import { useEffect, useState } from "react";

import { UiFeedback } from "@/components/ui/UiFeedback";
import { IconActionButton } from "@/components/ui/IconActionButton";
import { DeactivateIcon, EditIcon } from "@/components/ui/icons";
import {
  PromotionForm,
  formatDiscountType,
  formatPromotionScope,
  formatPromotionSummary,
} from "@/features/promotions/components/PromotionForm";
import { usePromotionsStore } from "@/features/promotions/stores/promotions-store";
import type {
  CreatePromotionPayload,
  StorePromotion,
  UpdatePromotionPayload,
} from "@/features/promotions/types";
import { useMerchantStoreGuard } from "@/features/stores/hooks/use-merchant-store-guard";

export function PromotionsManager() {
  const guard = useMerchantStoreGuard();
  const promotions = usePromotionsStore((state) => state.promotions);
  const isLoading = usePromotionsStore((state) => state.isLoading);
  const loadPromotions = usePromotionsStore((state) => state.loadPromotions);
  const createPromotion = usePromotionsStore((state) => state.createPromotion);
  const updatePromotion = usePromotionsStore((state) => state.updatePromotion);
  const deactivatePromotion = usePromotionsStore((state) => state.deactivatePromotion);

  const [editing, setEditing] = useState<StorePromotion | null>(null);

  useEffect(() => {
    if (!guard.ready) {
      return;
    }

    void loadPromotions(guard.activeStoreId);
  }, [guard.ready, guard.activeStoreId, loadPromotions]);

  if (!guard.ready) {
    return guard.content;
  }

  const storeId = guard.activeStoreId;

  return (
    <div data-testid="promotions-manager" className="space-y-6">
      <UiFeedback successTestId="promotions-success-message" />

      {editing ? (
        <PromotionForm
          storeId={storeId}
          initial={editing}
          submitLabel="Guardar cambios"
          onCancel={() => setEditing(null)}
          onSubmit={async (payload) => {
            const saved = await updatePromotion(storeId, editing.id, payload);
            if (saved) {
              setEditing(null);
            }
            return saved;
          }}
        />
      ) : (
        <PromotionForm
          storeId={storeId}
          onSubmit={async (payload) =>
            createPromotion(storeId, payload as CreatePromotionPayload)
          }
        />
      )}

      {isLoading ? (
        <p className="text-sm text-zinc-500">Cargando promociones…</p>
      ) : (
        <div
          data-testid="promotions-list"
          className="overflow-x-auto rounded-xl border border-zinc-200 bg-white"
        >
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-600">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Alcance</th>
                <th className="px-4 py-3">Activa</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promotion) => (
                <tr
                  key={promotion.id}
                  data-testid={`promotion-row-${promotion.id}`}
                  className="border-b border-zinc-100"
                >
                  <td className="px-4 py-3 font-medium">{promotion.name}</td>
                  <td className="px-4 py-3">
                    {formatDiscountType(promotion.discount_type)}
                  </td>
                  <td className="px-4 py-3">
                    {formatPromotionSummary(promotion)}
                  </td>
                  <td className="px-4 py-3">
                    {formatPromotionScope(promotion)}
                  </td>
                  <td className="px-4 py-3">{promotion.is_active ? "Sí" : "No"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <IconActionButton
                        label="Editar promoción"
                        testId={`promotion-edit-${promotion.id}`}
                        icon={<EditIcon />}
                        onClick={() => setEditing(promotion)}
                      />
                      {promotion.is_active ? (
                        <IconActionButton
                          label="Desactivar promoción"
                          variant="danger"
                          testId={`promotion-deactivate-${promotion.id}`}
                          icon={<DeactivateIcon />}
                          onClick={() =>
                            void deactivatePromotion(storeId, promotion.id)
                          }
                        />
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {promotions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-zinc-500">
              No hay promociones creadas.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
