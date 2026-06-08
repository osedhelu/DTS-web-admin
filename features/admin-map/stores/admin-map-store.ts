import { create } from "@/lib/stores/create-store";
import type { AdminOperationsMapData } from "@/features/admin-map/types";

interface AdminMapState {
  data: AdminOperationsMapData | null;
  isLoading: boolean;
  error: string | null;
  loadMap: () => Promise<void>;
}

export const useAdminMapStore = create<AdminMapState>((set) => ({
  data: null,
  isLoading: true,
  error: null,

  loadMap: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/admin/map");
      const payload = (await response.json()) as AdminOperationsMapData & {
        detail?: string;
      };

      if (!response.ok) {
        set({
          error: payload.detail ?? "No se pudo cargar el mapa",
          isLoading: false,
        });
        return;
      }

      set({ data: payload, isLoading: false });
    } catch {
      set({ error: "Error de conexión al cargar el mapa.", isLoading: false });
    }
  },
}));
