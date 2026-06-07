"use client";

import { useEffect } from "react";

import { useMerchantSessionStore } from "@/features/stores/stores/merchant-session-store";

/** Carga las tiendas del merchant una vez por sesión de navegación. */
export function MerchantSessionBootstrap() {
  const loadStores = useMerchantSessionStore((state) => state.loadStores);
  const stores = useMerchantSessionStore((state) => state.stores);
  const isLoadingStores = useMerchantSessionStore(
    (state) => state.isLoadingStores,
  );

  useEffect(() => {
    if (stores.length === 0 && !isLoadingStores) {
      void loadStores();
    }
  }, [stores.length, isLoadingStores, loadStores]);

  return null;
}
