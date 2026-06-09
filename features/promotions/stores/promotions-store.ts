import { create } from "@/lib/stores/create-store";
import { useUiStore } from "@/lib/stores/ui-store";
import type {
  CreatePromotionPayload,
  StorePromotion,
  UpdatePromotionPayload,
} from "@/features/promotions/types";
import type { PaginatedResponse } from "@/lib/api/types";

interface PromotionsState {
  promotions: StorePromotion[];
  isLoading: boolean;
  loadPromotions: (storeId: number) => Promise<void>;
  createPromotion: (
    storeId: number,
    payload: CreatePromotionPayload,
  ) => Promise<boolean>;
  updatePromotion: (
    storeId: number,
    promotionId: number,
    payload: UpdatePromotionPayload,
  ) => Promise<boolean>;
  deactivatePromotion: (storeId: number, promotionId: number) => Promise<boolean>;
  activatePromotion: (storeId: number, promotionId: number) => Promise<boolean>;
}

export const usePromotionsStore = create<PromotionsState>((set, get) => ({
  promotions: [],
  isLoading: false,

  loadPromotions: async (storeId) => {
    set({ isLoading: true });
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch(`/api/merchant/stores/${storeId}/promotions`);
      const data = (await response.json()) as PaginatedResponse<StorePromotion> & {
        detail?: string;
      };

      if (!response.ok) {
        useUiStore.getState().setError(
          data.detail ?? "No se pudieron cargar las promociones",
        );
        set({ promotions: [], isLoading: false });
        return;
      }

      set({ promotions: data.results, isLoading: false });
    } catch {
      useUiStore.getState().setError("Error de conexión al cargar promociones.");
      set({ promotions: [], isLoading: false });
    }
  },

  createPromotion: async (storeId, payload) => {
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch(`/api/merchant/stores/${storeId}/promotions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as StorePromotion & { detail?: string };

      if (!response.ok) {
        useUiStore.getState().setError(data.detail ?? "No se pudo crear la promoción");
        return false;
      }

      set({ promotions: [data, ...get().promotions] });
      useUiStore.getState().setSuccess(
        `Promoción "${data.name}" creada correctamente.`,
      );
      return true;
    } catch {
      useUiStore.getState().setError("Error de conexión al crear promoción.");
      return false;
    }
  },

  updatePromotion: async (storeId, promotionId, payload) => {
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch(
        `/api/merchant/stores/${storeId}/promotions/${promotionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json()) as StorePromotion & { detail?: string };

      if (!response.ok) {
        useUiStore.getState().setError(
          data.detail ?? "No se pudo actualizar la promoción",
        );
        return false;
      }

      set({
        promotions: get().promotions.map((promotion) =>
          promotion.id === promotionId ? data : promotion,
        ),
      });
      useUiStore.getState().setSuccess(
        `Promoción "${data.name}" actualizada correctamente.`,
      );
      return true;
    } catch {
      useUiStore.getState().setError("Error de conexión al actualizar promoción.");
      return false;
    }
  },

  deactivatePromotion: async (storeId, promotionId) => {
    const ok = await get().updatePromotion(storeId, promotionId, { is_active: false });
    if (ok) {
      useUiStore.getState().setSuccess("Promoción desactivada.");
    }
    return ok;
  },

  activatePromotion: async (storeId, promotionId) => {
    const ok = await get().updatePromotion(storeId, promotionId, { is_active: true });
    if (ok) {
      useUiStore.getState().setSuccess("Promoción activada de nuevo.");
    }
    return ok;
  },
}));
