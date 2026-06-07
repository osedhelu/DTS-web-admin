import { create } from "@/lib/stores/create-store";
import { useUiStore } from "@/lib/stores/ui-store";
import type {
  AdminMerchant,
  MerchantFilters,
} from "@/features/admin-merchants/types";
import type { PaginatedResponse } from "@/lib/api/types";

interface AdminMerchantsState {
  merchants: AdminMerchant[];
  filters: MerchantFilters;
  isLoading: boolean;
  loadMerchants: (filters?: MerchantFilters) => Promise<void>;
  setFilters: (filters: MerchantFilters) => void;
  suspendStore: (storeId: number) => Promise<boolean>;
  reactivateStore: (storeId: number) => Promise<boolean>;
}

function buildQuery(filters: MerchantFilters): string {
  const params = new URLSearchParams();
  if (filters.email_verified !== undefined) {
    params.set("email_verified", String(filters.email_verified));
  }
  if (filters.is_active !== undefined) {
    params.set("is_active", String(filters.is_active));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const useAdminMerchantsStore = create<AdminMerchantsState>((set, get) => ({
  merchants: [],
  filters: {},
  isLoading: false,

  setFilters: (filters) => set({ filters }),

  loadMerchants: async (filters) => {
    const activeFilters = filters ?? get().filters;
    set({ isLoading: true, filters: activeFilters });
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch(`/api/admin/merchants${buildQuery(activeFilters)}`);
      const data = (await response.json()) as PaginatedResponse<AdminMerchant> & {
        detail?: string;
      };

      if (!response.ok) {
        useUiStore.getState().setError(data.detail ?? "No se pudieron cargar comercios");
        set({ merchants: [], isLoading: false });
        return;
      }

      set({ merchants: data.results, isLoading: false });
    } catch {
      useUiStore.getState().setError("Error de conexión al cargar comercios.");
      set({ merchants: [], isLoading: false });
    }
  },

  suspendStore: async (storeId) => {
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch(`/api/admin/stores/${storeId}/moderation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: false }),
      });
      const data = (await response.json()) as { detail?: string; is_active?: boolean };

      if (!response.ok) {
        useUiStore.getState().setError(data.detail ?? "No se pudo suspender la tienda");
        return false;
      }

      set({
        merchants: get().merchants.map((merchant) =>
          merchant.store_id === storeId
            ? { ...merchant, store_is_active: false }
            : merchant,
        ),
      });
      useUiStore.getState().setSuccess("Tienda suspendida correctamente.");
      return true;
    } catch {
      useUiStore.getState().setError("Error de conexión al suspender tienda.");
      return false;
    }
  },

  reactivateStore: async (storeId) => {
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch(`/api/admin/stores/${storeId}/moderation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: true }),
      });
      const data = (await response.json()) as { detail?: string; is_active?: boolean };

      if (!response.ok) {
        useUiStore.getState().setError(data.detail ?? "No se pudo reactivar la tienda");
        return false;
      }

      set({
        merchants: get().merchants.map((merchant) =>
          merchant.store_id === storeId
            ? { ...merchant, store_is_active: true }
            : merchant,
        ),
      });
      useUiStore.getState().setSuccess("Tienda reactivada correctamente.");
      return true;
    } catch {
      useUiStore.getState().setError("Error de conexión al reactivar tienda.");
      return false;
    }
  },
}));
