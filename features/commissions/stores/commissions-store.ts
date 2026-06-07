import { create } from "@/lib/stores/create-store";
import type { CommissionsReport } from "@/features/commissions/types";

interface CommissionsState {
  report: CommissionsReport | null;
  days: number;
  isLoading: boolean;
  isExporting: boolean;
  error: string | null;
  setDays: (days: number) => void;
  loadReport: () => Promise<void>;
  exportCsv: () => Promise<void>;
}

export const useCommissionsStore = create<CommissionsState>((set, get) => ({
  report: null,
  days: 30,
  isLoading: false,
  isExporting: false,
  error: null,

  setDays: (days) => set({ days }),

  loadReport: async () => {
    const { days } = get();
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/admin/commissions?days=${days}`);
      const data = (await response.json()) as CommissionsReport & {
        detail?: string;
      };

      if (!response.ok) {
        set({
          error: data.detail ?? "No se pudieron cargar las comisiones",
          isLoading: false,
        });
        return;
      }

      set({ report: data, isLoading: false });
    } catch {
      set({
        error: "Error de conexión al cargar comisiones.",
        isLoading: false,
      });
    }
  },

  exportCsv: async () => {
    const { days } = get();
    set({ isExporting: true, error: null });

    try {
      const response = await fetch(`/api/admin/commissions/export?days=${days}`);

      if (!response.ok) {
        const data = (await response.json()) as { detail?: string };
        set({
          error: data.detail ?? "No se pudo exportar el reporte",
          isExporting: false,
        });
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "commissions_report.csv";
      anchor.click();
      window.URL.revokeObjectURL(url);
      set({ isExporting: false });
    } catch {
      set({
        error: "Error de conexión al exportar.",
        isExporting: false,
      });
    }
  },
}));
