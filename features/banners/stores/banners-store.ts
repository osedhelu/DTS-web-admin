import { create } from "@/lib/stores/create-store";
import { useUiStore } from "@/lib/stores/ui-store";
import type {
  Banner,
  CreateBannerPayload,
  UpdateBannerPayload,
} from "@/features/banners/types";
import type { PaginatedResponse } from "@/lib/api/types";

interface BannersState {
  banners: Banner[];
  isLoading: boolean;
  loadBanners: () => Promise<void>;
  createBanner: (payload: CreateBannerPayload) => Promise<boolean>;
  updateBanner: (bannerId: number, payload: UpdateBannerPayload) => Promise<boolean>;
  deleteBanner: (bannerId: number) => Promise<boolean>;
}

export const useBannersStore = create<BannersState>((set, get) => ({
  banners: [],
  isLoading: false,

  loadBanners: async () => {
    set({ isLoading: true });
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch("/api/admin/banners");
      const data = (await response.json()) as PaginatedResponse<Banner> & {
        detail?: string;
      };

      if (!response.ok) {
        useUiStore.getState().setError(data.detail ?? "No se pudieron cargar banners");
        set({ banners: [], isLoading: false });
        return;
      }

      set({ banners: data.results, isLoading: false });
    } catch {
      useUiStore.getState().setError("Error de conexión al cargar banners.");
      set({ banners: [], isLoading: false });
    }
  },

  createBanner: async (payload) => {
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as Banner & { detail?: string };

      if (!response.ok) {
        useUiStore.getState().setError(data.detail ?? "No se pudo crear el banner");
        return false;
      }

      set({ banners: [...get().banners, data].sort((a, b) => a.sort_order - b.sort_order) });
      useUiStore.getState().setSuccess(`Banner "${data.title}" creado correctamente.`);
      return true;
    } catch {
      useUiStore.getState().setError("Error de conexión al crear banner.");
      return false;
    }
  },

  updateBanner: async (bannerId, payload) => {
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch(`/api/admin/banners/${bannerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as Banner & { detail?: string };

      if (!response.ok) {
        useUiStore.getState().setError(data.detail ?? "No se pudo actualizar el banner");
        return false;
      }

      set({
        banners: get()
          .banners.map((banner) => (banner.id === bannerId ? data : banner))
          .sort((a, b) => a.sort_order - b.sort_order),
      });
      useUiStore.getState().setSuccess(`Banner "${data.title}" actualizado correctamente.`);
      return true;
    } catch {
      useUiStore.getState().setError("Error de conexión al actualizar banner.");
      return false;
    }
  },

  deleteBanner: async (bannerId) => {
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch(`/api/admin/banners/${bannerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as { detail?: string };
        useUiStore.getState().setError(data.detail ?? "No se pudo eliminar el banner");
        return false;
      }

      set({ banners: get().banners.filter((banner) => banner.id !== bannerId) });
      useUiStore.getState().setSuccess("Banner eliminado correctamente.");
      return true;
    } catch {
      useUiStore.getState().setError("Error de conexión al eliminar banner.");
      return false;
    }
  },
}));
