import { create } from "@/lib/stores/create-store";
import { useUiStore } from "@/lib/stores/ui-store";
import type { Coupon, CreateCouponPayload } from "@/features/coupons/types";
import type { PaginatedResponse } from "@/lib/api/types";

interface CouponsState {
  coupons: Coupon[];
  isLoading: boolean;
  loadCoupons: () => Promise<void>;
  createCoupon: (payload: CreateCouponPayload) => Promise<boolean>;
}

export const useCouponsStore = create<CouponsState>((set, get) => ({
  coupons: [],
  isLoading: false,

  loadCoupons: async () => {
    set({ isLoading: true });
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch("/api/admin/coupons");
      const data = (await response.json()) as PaginatedResponse<Coupon> & {
        detail?: string;
      };

      if (!response.ok) {
        useUiStore.getState().setError(data.detail ?? "No se pudieron cargar cupones");
        set({ coupons: [], isLoading: false });
        return;
      }

      set({ coupons: data.results, isLoading: false });
    } catch {
      useUiStore.getState().setError("Error de conexión al cargar cupones.");
      set({ coupons: [], isLoading: false });
    }
  },

  createCoupon: async (payload) => {
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as Coupon & { detail?: string };

      if (!response.ok) {
        useUiStore.getState().setError(data.detail ?? "No se pudo crear el cupón");
        return false;
      }

      set({ coupons: [data, ...get().coupons] });
      useUiStore.getState().setSuccess(`Cupón "${data.code}" creado correctamente.`);
      return true;
    } catch {
      useUiStore.getState().setError("Error de conexión al crear cupón.");
      return false;
    }
  },
}));
