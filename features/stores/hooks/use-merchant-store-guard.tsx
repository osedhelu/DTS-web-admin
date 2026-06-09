"use client";

import { useMerchantSessionStore } from "@/features/stores/stores/merchant-session-store";

export function useMerchantStoreGuard() {
  const stores = useMerchantSessionStore((state) => state.stores);
  const isLoadingStores = useMerchantSessionStore(
    (state) => state.isLoadingStores,
  );
  const storesLoaded = useMerchantSessionStore((state) => state.storesLoaded);
  const storesError = useMerchantSessionStore((state) => state.storesError);
  const activeStoreId = useMerchantSessionStore((state) => state.activeStoreId);

  if (!storesLoaded || isLoadingStores) {
    return {
      ready: false as const,
      content: <p className="text-sm text-zinc-500">Cargando tienda…</p>,
    };
  }

  if (storesError) {
    return {
      ready: false as const,
      content: (
        <p role="alert" className="text-sm text-red-600">
          {storesError}
        </p>
      ),
    };
  }

  if (stores.length === 0) {
    return {
      ready: false as const,
      content: (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No tienes tiendas registradas. Crea una tienda en el backend para
          continuar.
        </p>
      ),
    };
  }

  const validatedStoreId = stores.some((store) => store.id === activeStoreId)
    ? activeStoreId
    : null;

  if (validatedStoreId === null) {
    return {
      ready: false as const,
      content: <p className="text-sm text-zinc-500">Selecciona una tienda…</p>,
    };
  }

  return { ready: true as const, activeStoreId: validatedStoreId, stores };
}
