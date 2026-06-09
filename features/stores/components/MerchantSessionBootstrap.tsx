"use client";

import { useEffect } from "react";

import { useMerchantSessionStore } from "@/features/stores/stores/merchant-session-store";

/** Carga las tiendas del merchant al entrar al panel. */
export function MerchantSessionBootstrap() {
  const loadStores = useMerchantSessionStore((state) => state.loadStores);

  useEffect(() => {
    void loadStores({ force: true });
  }, [loadStores]);

  return null;
}
