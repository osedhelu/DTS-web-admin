import { create } from "@/lib/stores/create-store";
import { useUiStore } from "@/lib/stores/ui-store";
import type { MerchantDashboardMetrics } from "@/features/merchant-dashboard/types";

interface MerchantDashboardState {
  metrics: MerchantDashboardMetrics | null;
  isLoading: boolean;
  loadDashboard: (storeId: number, days?: number) => Promise<void>;
  reset: () => void;
}

export const useMerchantDashboardStore = create<MerchantDashboardState>((set) => ({
  metrics: null,
  isLoading: false,

  loadDashboard: async (storeId, days = 30) => {
    set({ isLoading: true });
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch(
        `/api/merchant/stores/${storeId}/dashboard?days=${days}`,
      );
      const data = (await response.json()) as MerchantDashboardMetrics & {
        detail?: string;
      };

      if (!response.ok) {
        useUiStore.getState().setError(
          data.detail ?? "No se pudieron cargar las métricas",
        );
        set({ metrics: null, isLoading: false });
        return;
      }

      set({ metrics: data, isLoading: false });
    } catch {
      useUiStore.getState().setError("Error de conexión al cargar el dashboard.");
      set({ metrics: null, isLoading: false });
    }
  },

  reset: () => {
    set({ metrics: null, isLoading: false });
  },
}));
