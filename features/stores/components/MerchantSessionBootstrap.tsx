"use client";

import { useEffect } from "react";

import { useMerchantSessionStore } from "@/features/stores/stores/merchant-session-store";

/** Carga las tiendas del merchant una vez por sesión de navegación. */
export function MerchantSessionBootstrap() {
  const loadStores = useMerchantSessionStore((state) => state.loadStores);
  const storesLoaded = useMerchantSessionStore((state) => state.storesLoaded);
  const isLoadingStores = useMerchantSessionStore(
    (state) => state.isLoadingStores,
  );

  useEffect(() => {
    if (!storesLoaded && !isLoadingStores) {
      void loadStores();
    }
  }, [storesLoaded, isLoadingStores, loadStores]);

  return null;
}
