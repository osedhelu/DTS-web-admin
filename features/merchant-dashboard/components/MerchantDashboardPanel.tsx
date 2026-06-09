"use client";

import { useEffect } from "react";

import { UiFeedback } from "@/components/ui/UiFeedback";
import { MerchantDashboardWidgets } from "@/features/merchant-dashboard/components/MerchantDashboardWidgets";
import { MerchantQuickActions } from "@/features/merchant-dashboard/components/MerchantQuickActions";
import { useMerchantDashboardStore } from "@/features/merchant-dashboard/stores/dashboard-store";
import { useMerchantStoreGuard } from "@/features/stores/hooks/use-merchant-store-guard";

export function MerchantDashboardPanel() {
  const guard = useMerchantStoreGuard();
  const metrics = useMerchantDashboardStore((state) => state.metrics);
  const isLoading = useMerchantDashboardStore((state) => state.isLoading);
  const loadDashboard = useMerchantDashboardStore((state) => state.loadDashboard);
  const resetDashboard = useMerchantDashboardStore((state) => state.reset);

  const activeStore = guard.ready
    ? guard.stores.find((store) => store.id === guard.activeStoreId)
    : null;

  useEffect(() => {
    if (!guard.ready) {
      resetDashboard();
      return;
    }

    void loadDashboard(guard.activeStoreId);
  }, [guard.ready, guard.activeStoreId, loadDashboard, resetDashboard]);

  if (!guard.ready) {
    return guard.content;
  }

  return (
    <div data-testid="merchant-dashboard" className="space-y-8">
      <UiFeedback />

      <section className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-900 via-zinc-800 to-emerald-950 p-6 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
          Bienvenido
        </p>
        <h3 className="mt-2 text-xl font-bold">
          {activeStore ? activeStore.name : "Tu tienda"}
        </h3>
        <p className="mt-2 max-w-2xl text-sm text-zinc-300">
          Desde aquí gestionas catálogo, inventario, pedidos y promociones. Revisa tus métricas
          y toma decisiones con datos en tiempo real.
        </p>
      </section>

      <MerchantQuickActions />

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="h-28 animate-pulse rounded-2xl bg-zinc-200" />
            <div className="h-28 animate-pulse rounded-2xl bg-zinc-200" />
            <div className="h-28 animate-pulse rounded-2xl bg-zinc-200" />
            <div className="h-28 animate-pulse rounded-2xl bg-zinc-200" />
          </div>
          <div className="h-48 animate-pulse rounded-2xl bg-zinc-200" />
        </div>
      ) : metrics ? (
        <MerchantDashboardWidgets metrics={metrics} />
      ) : (
        <p className="text-sm text-zinc-500">
          No hay métricas disponibles para esta tienda.
        </p>
      )}

      <section className="rounded-2xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Áreas bajo tu gestión
        </h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-gradient-to-br from-emerald-500/5 to-transparent p-4 ring-1 ring-emerald-100">
            <dt className="font-semibold text-zinc-900">Catálogo</dt>
            <dd className="mt-1 text-sm text-zinc-600">
              Crea productos, organiza categorías y configura variantes por tipo de negocio.
            </dd>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent p-4 ring-1 ring-blue-100">
            <dt className="font-semibold text-zinc-900">Operaciones</dt>
            <dd className="mt-1 text-sm text-zinc-600">
              Atiende pedidos de entrega y servicios a domicilio desde un solo lugar.
            </dd>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-amber-500/5 to-transparent p-4 ring-1 ring-amber-100">
            <dt className="font-semibold text-zinc-900">Inventario</dt>
            <dd className="mt-1 text-sm text-zinc-600">
              Mantén el stock al día para evitar cancelaciones y mejorar la experiencia.
            </dd>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-violet-500/5 to-transparent p-4 ring-1 ring-violet-100">
            <dt className="font-semibold text-zinc-900">Promociones</dt>
            <dd className="mt-1 text-sm text-zinc-600">
              Lanza descuentos y ofertas para impulsar ventas en tu zona de cobertura.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
