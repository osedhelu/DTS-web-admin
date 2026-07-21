"use client";

import { useEffect } from "react";

import { OperationsMapPanel } from "@/features/operations-map/components/OperationsMapPanel";
import { useMerchantMapStore } from "@/features/merchant-map/stores/merchant-map-store";

const REFRESH_MS = 10_000;

export function MerchantOperationsMapPanel() {
  const data = useMerchantMapStore((state) => state.data);
  const isLoading = useMerchantMapStore((state) => state.isLoading);
  const error = useMerchantMapStore((state) => state.error);
  const loadMap = useMerchantMapStore((state) => state.loadMap);

  useEffect(() => {
    void loadMap();
  }, [loadMap]);

  return (
    <OperationsMapPanel
      data={data}
      isLoading={isLoading}
      error={error}
      onRefresh={() => void loadMap()}
      refreshMs={REFRESH_MS}
      testId="merchant-operations-map"
      storesTitle="Mis tiendas"
      deliveriesTitle="Conductores en ruta"
      emptyStoresMessage="Aún no tienes tiendas con ubicación."
      emptyDeliveriesMessage="No hay conductores en camino ahora. Cuando un pedido salga en delivery, lo verás aquí."
    />
  );
}
