"use client";

import { useEffect } from "react";

import { UiFeedback } from "@/components/ui/UiFeedback";
import { MerchantDashboardWidgets } from "@/features/merchant-dashboard/components/MerchantDashboardWidgets";
import { useMerchantDashboardStore } from "@/features/merchant-dashboard/stores/dashboard-store";
import { useMerchantStoreGuard } from "@/features/stores/hooks/use-merchant-store-guard";
import { useMerchantSessionStore } from "@/features/stores/stores/merchant-session-store";

export function MerchantDashboardPanel() {
  const guard = useMerchantStoreGuard();
  const activeStoreId = useMerchantSessionStore((state) => state.activeStoreId);
  const metrics = useMerchantDashboardStore((state) => state.metrics);
  const isLoading = useMerchantDashboardStore((state) => state.isLoading);
  const loadDashboard = useMerchantDashboardStore((state) => state.loadDashboard);
  const resetDashboard = useMerchantDashboardStore((state) => state.reset);

  useEffect(() => {
    if (activeStoreId === null) {
      resetDashboard();
      return;
    }

    void loadDashboard(activeStoreId);
  }, [activeStoreId, loadDashboard, resetDashboard]);

  if (!guard.ready) {
    return guard.content;
  }

  return (
    <div data-testid="merchant-dashboard" className="space-y-6">
      <UiFeedback />

      {isLoading ? (
        <p className="text-sm text-zinc-500">Cargando métricas…</p>
      ) : metrics ? (
        <MerchantDashboardWidgets metrics={metrics} />
      ) : (
        <p className="text-sm text-zinc-500">
          No hay métricas disponibles para esta tienda.
        </p>
      )}
    </div>
  );
}
