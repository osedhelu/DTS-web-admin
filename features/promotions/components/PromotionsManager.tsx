"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { UiFeedback } from "@/components/ui/UiFeedback";
import { IconActionButton } from "@/components/ui/IconActionButton";
import { ActivateIcon, DeactivateIcon, EditIcon, PlusIcon } from "@/components/ui/icons";
import {
  formatDiscountType,
  formatPromotionScope,
  formatPromotionSummary,
} from "@/features/promotions/components/PromotionForm";
import {
  PromotionModal,
  type PromotionModalState,
} from "@/features/promotions/components/PromotionModal";
import { usePromotionsStore } from "@/features/promotions/stores/promotions-store";
import {
  formatPromotionScheduleStatus,
  formatPromotionValidity,
  getPromotionScheduleStatus,
} from "@/features/promotions/lib/promotion-schedule";
import type { CreatePromotionPayload } from "@/features/promotions/types";
import { useMerchantStoreGuard } from "@/features/stores/hooks/use-merchant-store-guard";

export function PromotionsManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const guard = useMerchantStoreGuard();
  const promotions = usePromotionsStore((state) => state.promotions);
  const isLoading = usePromotionsStore((state) => state.isLoading);
  const loadPromotions = usePromotionsStore((state) => state.loadPromotions);
  const createPromotion = usePromotionsStore((state) => state.createPromotion);
  const updatePromotion = usePromotionsStore((state) => state.updatePromotion);
  const deactivatePromotion = usePromotionsStore((state) => state.deactivatePromotion);
  const activatePromotion = usePromotionsStore((state) => state.activatePromotion);

  const [modalState, setModalState] = useState<PromotionModalState | null>(null);
  const handledPromotionIdRef = useRef<number | null>(null);

  const promotionIdParam = searchParams.get("promotionId");
  const requestedPromotionId = promotionIdParam ? Number(promotionIdParam) : null;

  useEffect(() => {
    if (!guard.ready) {
      return;
    }

    void loadPromotions(guard.activeStoreId);
  }, [guard.ready, guard.activeStoreId, loadPromotions]);

  useEffect(() => {
    if (
      isLoading ||
      !requestedPromotionId ||
      Number.isNaN(requestedPromotionId) ||
      handledPromotionIdRef.current === requestedPromotionId
    ) {
      return;
    }

    const promotion = promotions.find((item) => item.id === requestedPromotionId);
    if (!promotion) {
      return;
    }

    handledPromotionIdRef.current = requestedPromotionId;
    setModalState({ mode: "edit", promotion });

    requestAnimationFrame(() => {
      document
        .querySelector(`[data-testid="promotion-row-${requestedPromotionId}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    router.replace("/merchant/promotions", { scroll: false });
  }, [isLoading, promotions, requestedPromotionId, router]);

  if (!guard.ready) {
    return guard.content;
  }

  const storeId = guard.activeStoreId;
  const modalOpen = modalState !== null;

  function openCreateModal() {
    setModalState({ mode: "create" });
  }

  return (
    <div data-testid="promotions-manager" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-600">
          Gestiona descuentos activos de tu tienda. Crea o edita desde el modal.
        </p>
        <IconActionButton
          label="Nueva promoción"
          variant="primary"
          size="md"
          testId="promotion-create-button"
          icon={<PlusIcon />}
          onClick={openCreateModal}
        />
      </div>

      <UiFeedback successTestId="promotions-success-message" />

      <PromotionModal
        open={modalOpen}
        state={modalState}
        storeId={storeId}
        onClose={() => setModalState(null)}
        onCreate={async (payload) => createPromotion(storeId, payload as CreatePromotionPayload)}
        onUpdate={async (promotionId, payload) =>
          updatePromotion(storeId, promotionId, payload)
        }
      />

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
                <th className="px-4 py-3">Vigencia</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promotion) => {
                const scheduleStatus = getPromotionScheduleStatus(promotion);

                return (
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
                      {promotion.product_id ? (
                        <Link
                          href={`/merchant/products/${promotion.product_id}`}
                          data-testid={`promotion-product-link-${promotion.id}`}
                          className="text-zinc-900 underline-offset-2 hover:underline"
                        >
                          {formatPromotionScope(promotion)}
                        </Link>
                      ) : (
                        formatPromotionScope(promotion)
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-600">
                      {formatPromotionValidity(promotion)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        data-testid={`promotion-status-${promotion.id}`}
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          scheduleStatus === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : scheduleStatus === "scheduled"
                              ? "bg-amber-100 text-amber-900"
                              : scheduleStatus === "expired"
                                ? "bg-zinc-200 text-zinc-600"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {formatPromotionScheduleStatus(scheduleStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <IconActionButton
                          label="Editar promoción"
                          testId={`promotion-edit-${promotion.id}`}
                          icon={<EditIcon />}
                          onClick={() => setModalState({ mode: "edit", promotion })}
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
                        ) : (
                          <IconActionButton
                            label="Activar promoción"
                            variant="primary"
                            testId={`promotion-activate-${promotion.id}`}
                            icon={<ActivateIcon />}
                            onClick={() =>
                              void activatePromotion(storeId, promotion.id)
                            }
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {promotions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-zinc-500">
              No hay promociones creadas. Usa el botón + para agregar la primera.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
