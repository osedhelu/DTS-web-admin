import { create } from "@/lib/stores/create-store";

interface UiState {
  successMessage: string | null;
  error: string | null;
  setSuccess: (message: string | null) => void;
  setError: (message: string | null) => void;
  clearMessages: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  successMessage: null,
  error: null,
  setSuccess: (message) => set({ successMessage: message, error: null }),
  setError: (message) => set({ error: message, successMessage: null }),
  clearMessages: () => set({ successMessage: null, error: null }),
}));
