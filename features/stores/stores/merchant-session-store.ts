import { createJSONStorage, persist } from "zustand/middleware";

import { create } from "@/lib/stores/create-store";
import { useUiStore } from "@/lib/stores/ui-store";
import type { Store } from "@/features/stores/types";

interface MerchantSessionState {
  stores: Store[];
  activeStoreId: number | null;
  preferredStoreId: number | null;
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
  preferredStoreId: null as number | null,
  isLoadingStores: false,
  storesLoaded: false,
  storesError: null as string | null,
};

function resolveActiveStoreId(
  stores: Store[],
  preferredStoreId: number | null,
): number | null {
  if (stores.length === 0) {
    return null;
  }

  if (
    preferredStoreId !== null &&
    stores.some((store) => store.id === preferredStoreId)
  ) {
    return preferredStoreId;
  }

  return stores[0]?.id ?? null;
}

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

        set({ isLoadingStores: true, storesError: null, activeStoreId: null });

        try {
          const response = await fetch("/api/merchant/stores");
          const data = (await response.json()) as {
            results?: Store[];
            detail?: string;
          };

          if (!response.ok) {
            set({
              stores: [],
              activeStoreId: null,
              isLoadingStores: false,
              storesLoaded: true,
              storesError: data.detail ?? "No se pudieron cargar las tiendas",
            });
            return;
          }

          const results = data.results ?? [];
          const nextActiveStoreId = resolveActiveStoreId(
            results,
            get().preferredStoreId,
          );

          set({
            stores: results,
            activeStoreId: nextActiveStoreId,
            preferredStoreId: nextActiveStoreId,
            isLoadingStores: false,
            storesLoaded: true,
          });
        } catch {
          set({
            stores: [],
            activeStoreId: null,
            storesError: "Error de conexión al cargar tiendas.",
            isLoadingStores: false,
            storesLoaded: true,
          });
        }
      },

      setActiveStoreId: (storeId) => {
        set({ activeStoreId: storeId, preferredStoreId: storeId });
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
      partialize: (state) => ({
        preferredStoreId: state.preferredStoreId ?? state.activeStoreId,
      }),
      storage: createJSONStorage(() => sessionStorage),
      merge: (persisted, current) => {
        const saved = persisted as Partial<MerchantSessionState> | undefined;
        return {
          ...current,
          preferredStoreId: saved?.preferredStoreId ?? null,
          activeStoreId: null,
          stores: [],
          storesLoaded: false,
        };
      },
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

export function resetMerchantSession(): void {
  useMerchantSessionStore.getState().reset();
  useUiStore.getState().clearMessages();
  sessionStorage.removeItem("dts-merchant-session");
}
