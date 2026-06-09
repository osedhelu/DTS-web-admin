"use client";

import { Modal } from "@/components/ui/Modal";
import { PromotionForm } from "@/features/promotions/components/PromotionForm";
import type {
  CreatePromotionPayload,
  StorePromotion,
  UpdatePromotionPayload,
} from "@/features/promotions/types";

export type PromotionModalState =
  | { mode: "create" }
  | { mode: "edit"; promotion: StorePromotion };

interface PromotionModalProps {
  open: boolean;
  state: PromotionModalState | null;
  storeId: number;
  onClose: () => void;
  onCreate: (payload: CreatePromotionPayload) => Promise<boolean>;
  onUpdate: (
    promotionId: number,
    payload: UpdatePromotionPayload,
  ) => Promise<boolean>;
}

function getPromotionModalKey(state: PromotionModalState): string {
  return state.mode === "edit" ? `edit-${state.promotion.id}` : "create";
}

export function PromotionModal({
  open,
  state,
  storeId,
  onClose,
  onCreate,
  onUpdate,
}: PromotionModalProps) {
  if (!open || !state) {
    return null;
  }

  const isEdit = state.mode === "edit";

  return (
    <Modal
      open
      title={isEdit ? "Editar promoción" : "Nueva promoción"}
      description={
        isEdit
          ? `Modifica el descuento «${state.promotion.name}».`
          : "Define un descuento por porcentaje o monto fijo para tu tienda o un producto."
      }
      onClose={onClose}
      testId="promotion-modal"
      panelClassName="max-w-lg"
    >
      <PromotionForm
        key={getPromotionModalKey(state)}
        storeId={storeId}
        layout="plain"
        initial={isEdit ? state.promotion : null}
        submitLabel={isEdit ? "Guardar cambios" : "Crear promoción"}
        onCancel={onClose}
        onSubmit={async (payload) => {
          const saved = isEdit
            ? await onUpdate(state.promotion.id, payload)
            : await onCreate(payload as CreatePromotionPayload);

          if (saved) {
            onClose();
          }

          return saved;
        }}
      />
    </Modal>
  );
}
