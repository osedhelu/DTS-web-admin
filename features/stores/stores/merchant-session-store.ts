import { createJSONStorage, persist } from "zustand/middleware";

import { create } from "@/lib/stores/create-store";
import type { Store } from "@/features/stores/types";

interface MerchantSessionState {
  stores: Store[];
  activeStoreId: number | null;
  isLoadingStores: boolean;
  storesError: string | null;
  loadStores: () => Promise<void>;
  setActiveStoreId: (storeId: number) => void;
  updateStoreInList: (store: Store) => void;
  reset: () => void;
}

const initialState = {
  stores: [] as Store[],
  activeStoreId: null as number | null,
  isLoadingStores: false,
  storesError: null as string | null,
};

export const useMerchantSessionStore = create<MerchantSessionState>()(
  persist(
    (set, get) => ({
      ...initialState,

      loadStores: async () => {
        if (get().isLoadingStores) {
          return;
        }

        set({ isLoadingStores: true, storesError: null });

        try {
          const response = await fetch("/api/merchant/stores");
          const data = (await response.json()) as {
            results: Store[];
            detail?: string;
          };

          if (!response.ok) {
            set({
              stores: [],
              storesError: data.detail ?? "No se pudieron cargar las tiendas",
              isLoadingStores: false,
            });
            return;
          }

          const { activeStoreId } = get();
          const hasActiveStore = data.results.some(
            (store) => store.id === activeStoreId,
          );
          const nextActiveStoreId = hasActiveStore
            ? activeStoreId
            : (data.results[0]?.id ?? null);

          set({
            stores: data.results,
            activeStoreId: nextActiveStoreId,
            isLoadingStores: false,
          });
        } catch {
          set({
            stores: [],
            storesError: "Error de conexión al cargar tiendas.",
            isLoadingStores: false,
          });
        }
      },

      setActiveStoreId: (storeId) => {
        set({ activeStoreId: storeId });
      },

      updateStoreInList: (store) => {
        set({
          stores: get().stores.map((current) =>
            current.id === store.id ? store : current,
          ),
        });
      },

      reset: () => {
        set({ ...initialState });
      },
    }),
    {
      name: "dts-merchant-session",
      partialize: (state) => ({ activeStoreId: state.activeStoreId }),
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export function useActiveStore(): Store | null {
  const stores = useMerchantSessionStore((state) => state.stores);
  const activeStoreId = useMerchantSessionStore((state) => state.activeStoreId);

  if (activeStoreId === null) {
    return null;
  }

  return stores.find((store) => store.id === activeStoreId) ?? null;
}
