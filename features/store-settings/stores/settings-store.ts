import { create } from "@/lib/stores/create-store";
import { useUiStore } from "@/lib/stores/ui-store";
import type { Store, UpdateStoreProfilePayload } from "@/features/stores/types";

interface StoreSettingsState {
  profile: Store | null;
  isLoading: boolean;
  isSaving: boolean;
  loadProfile: (storeId: number) => Promise<void>;
  updateProfile: (
    storeId: number,
    payload: UpdateStoreProfilePayload,
  ) => Promise<Store | null>;
}

export const useStoreSettingsStore = create<StoreSettingsState>((set) => ({
  profile: null,
  isLoading: false,
  isSaving: false,

  loadProfile: async (storeId) => {
    set({ isLoading: true });
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch(`/api/merchant/stores/${storeId}/profile`);
      const data = (await response.json()) as Store & { detail?: string };

      if (!response.ok) {
        useUiStore.getState().setError(
          data.detail ?? "No se pudo cargar la configuración de la tienda",
        );
        set({ profile: null, isLoading: false });
        return;
      }

      set({ profile: data, isLoading: false });
    } catch {
      useUiStore.getState().setError(
        "Error de conexión al cargar la configuración.",
      );
      set({ profile: null, isLoading: false });
    }
  },

  updateProfile: async (storeId, payload) => {
    set({ isSaving: true });
    useUiStore.getState().clearMessages();

    try {
      const hasLogo = payload.logo instanceof File;
      let response: Response;

      if (hasLogo) {
        const formData = new FormData();
        if (payload.name !== undefined) formData.append("name", payload.name);
        if (payload.description !== undefined) {
          formData.append("description", payload.description);
        }
        if (payload.phone !== undefined) formData.append("phone", payload.phone);
        if (payload.address !== undefined) {
          formData.append("address", payload.address);
        }
        if (payload.latitude !== undefined) {
          formData.append("latitude", String(payload.latitude));
        }
        if (payload.longitude !== undefined) {
          formData.append("longitude", String(payload.longitude));
        }
        if (payload.status !== undefined) {
          formData.append("status", payload.status);
        }
        formData.append("logo", payload.logo as File);

        response = await fetch(`/api/merchant/stores/${storeId}/profile`, {
          method: "PATCH",
          body: formData,
        });
      } else {
        const jsonPayload = { ...payload };
        delete jsonPayload.logo;
        response = await fetch(`/api/merchant/stores/${storeId}/profile`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jsonPayload),
        });
      }

      const data = (await response.json()) as Store & {
        detail?: string;
        logo?: string[];
      };

      if (!response.ok) {
        const fieldError =
          typeof data === "object" && data !== null && "logo" in data
            ? (data.logo as string[] | undefined)?.[0]
            : undefined;
        useUiStore.getState().setError(
          fieldError ?? data.detail ?? "No se pudo guardar la configuración",
        );
        set({ isSaving: false });
        return null;
      }

      set({ profile: data, isSaving: false });
      useUiStore.getState().setSuccess("Configuración de la tienda guardada.");
      return data;
    } catch {
      useUiStore.getState().setError(
        "Error de conexión al guardar la configuración.",
      );
      set({ isSaving: false });
      return null;
    }
  },
}));
