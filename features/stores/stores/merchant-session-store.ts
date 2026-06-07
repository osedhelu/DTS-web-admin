import { createJSONStorage, persist } from "zustand/middleware";

import { create } from "@/lib/stores/create-store";
import type { Store } from "@/features/stores/types";

interface MerchantSessionState {
  stores: Store[];
  activeStoreId: number | null;
  isLoadingStores: boolean;
  storesLoaded: boolean;
  storesError: string | null;
  loadStores: (options?: { force?: boolean }) => Promise<void>;
  setActiveStoreId: (storeId: number) => void;
  updateStoreInList: (store: Store) => void;
  reset: () => void;
}

const initialState = {
  stores: [] as Store[],
  activeStoreId: null as number | null,
  isLoadingStores: false,
  storesLoaded: false,
  storesError: null as string | null,
};

export const useMerchantSessionStore = create<MerchantSessionState>()(
  persist(
    (set, get) => ({
      ...initialState,

      loadStores: async (options) => {
        if (get().isLoadingStores) {
          return;
        }

        if (get().storesLoaded && !options?.force) {
          return;
        }

        set({ isLoadingStores: true, storesError: null });

        try {
          const response = await fetch("/api/merchant/stores");
          const data = (await response.json()) as {
            results?: Store[];
            detail?: string;
          };

          if (!response.ok) {
            set({
              stores: [],
              storesError: data.detail ?? "No se pudieron cargar las tiendas",
              isLoadingStores: false,
              storesLoaded: true,
            });
            return;
          }

          const results = data.results ?? [];
          const { activeStoreId } = get();
          const hasActiveStore = results.some((store) => store.id === activeStoreId);
          const nextActiveStoreId = hasActiveStore
            ? activeStoreId
            : (results[0]?.id ?? null);

          set({
            stores: results,
            activeStoreId: nextActiveStoreId,
            isLoadingStores: false,
            storesLoaded: true,
          });
        } catch {
          set({
            stores: [],
            storesError: "Error de conexión al cargar tiendas.",
            isLoadingStores: false,
            storesLoaded: true,
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
