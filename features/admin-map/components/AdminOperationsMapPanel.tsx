"use client";

import { useEffect } from "react";

import { OperationsMapPanel } from "@/features/operations-map/components/OperationsMapPanel";
import { useAdminMapStore } from "@/features/admin-map/stores/admin-map-store";

const REFRESH_MS = 30_000;

export function AdminOperationsMapPanel() {
  const data = useAdminMapStore((state) => state.data);
  const isLoading = useAdminMapStore((state) => state.isLoading);
  const error = useAdminMapStore((state) => state.error);
  const loadMap = useAdminMapStore((state) => state.loadMap);

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
      testId="admin-operations-map"
      deliveriesTitle="Deliveries activos"
      emptyDeliveriesMessage="No hay entregas en curso."
    />
  );
}
