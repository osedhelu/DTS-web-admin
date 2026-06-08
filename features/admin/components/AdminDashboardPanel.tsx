"use client";

import { useEffect } from "react";

import { AdminMetricsWidgets } from "@/features/admin/components/AdminMetricsWidgets";
import { AdminQuickActions } from "@/features/admin/components/AdminQuickActions";
import { useAdminStore } from "@/features/admin/stores/admin-store";

export function AdminDashboardPanel() {
  const dashboard = useAdminStore((state) => state.dashboard);
  const metrics = useAdminStore((state) => state.metrics);
  const isLoading = useAdminStore((state) => state.isLoading);
  const error = useAdminStore((state) => state.error);
  const loadPanel = useAdminStore((state) => state.loadPanel);

  useEffect(() => {
    void loadPanel();
  }, [loadPanel]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-2xl bg-zinc-200" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-28 animate-pulse rounded-2xl bg-zinc-200" />
          <div className="h-28 animate-pulse rounded-2xl bg-zinc-200" />
          <div className="h-28 animate-pulse rounded-2xl bg-zinc-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {error}
      </div>
    );
  }

  return (
    <div data-testid="admin-dashboard" className="space-y-8">
      <section className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
          Bienvenido
        </p>
        <h3 className="mt-2 text-xl font-bold">{dashboard?.detail ?? "Panel super admin"}</h3>
        <p className="mt-2 max-w-2xl text-sm text-zinc-300">
          Desde aquí controlas comercios, comisiones, cupones y banners de toda la plataforma DTS
          Delivery.
        </p>
        <p className="mt-4 text-sm text-zinc-400">
          Sesión:{" "}
          <span data-testid="admin-dashboard-user" className="font-medium text-white">
            {dashboard?.user}
          </span>
        </p>
      </section>

      <AdminQuickActions />

      {metrics ? <AdminMetricsWidgets metrics={metrics} /> : null}

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Áreas bajo tu gestión
        </h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-zinc-50 p-4">
            <dt className="font-semibold text-zinc-900">Comercios</dt>
            <dd className="mt-1 text-sm text-zinc-600">
              Aprueba registros, verifica correos y suspende tiendas que incumplan políticas.
            </dd>
          </div>
          <div className="rounded-xl bg-zinc-50 p-4">
            <dt className="font-semibold text-zinc-900">Finanzas</dt>
            <dd className="mt-1 text-sm text-zinc-600">
              Consulta comisiones por comercio, exporta CSV y configura cupones de descuento.
            </dd>
          </div>
          <div className="rounded-xl bg-zinc-50 p-4">
            <dt className="font-semibold text-zinc-900">Marketing</dt>
            <dd className="mt-1 text-sm text-zinc-600">
              Publica banners promocionales visibles en la aplicación de clientes.
            </dd>
          </div>
          <div className="rounded-xl bg-zinc-50 p-4">
            <dt className="font-semibold text-zinc-900">Métricas</dt>
            <dd className="mt-1 text-sm text-zinc-600">
              Monitorea ventas de los últimos 7 días, comercios activos y tiempos de entrega.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
