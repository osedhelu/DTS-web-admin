import { create } from "@/lib/stores/create-store";
import type { AdminDashboardData, AdminMetrics } from "@/features/admin/types";

interface AdminState {
  dashboard: AdminDashboardData | null;
  metrics: AdminMetrics | null;
  isLoading: boolean;
  error: string | null;
  loadPanel: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  dashboard: null,
  metrics: null,
  isLoading: true,
  error: null,

  loadPanel: async () => {
    set({ isLoading: true, error: null });

    try {
      const [dashboardResponse, metricsResponse] = await Promise.all([
        fetch("/api/admin/dashboard"),
        fetch("/api/admin/metrics"),
      ]);

      const dashboardData = (await dashboardResponse.json()) as AdminDashboardData & {
        detail?: string;
      };
      const metricsData = (await metricsResponse.json()) as AdminMetrics & {
        detail?: string;
      };

      if (!dashboardResponse.ok) {
        set({
          error: dashboardData.detail ?? "No se pudo cargar el panel",
          isLoading: false,
        });
        return;
      }

      if (!metricsResponse.ok) {
        set({
          error: metricsData.detail ?? "No se pudieron cargar las métricas",
          isLoading: false,
        });
        return;
      }

      set({
        dashboard: dashboardData,
        metrics: metricsData,
        isLoading: false,
      });
    } catch {
      set({
        error: "Error de conexión al cargar el panel.",
        isLoading: false,
      });
    }
  },
}));
