"use client";

import { useEffect } from "react";

import { AdminMetricsWidgets } from "@/features/admin/components/AdminMetricsWidgets";
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
    return <p className="text-sm text-zinc-500">Cargando panel…</p>;
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600">
        {error}
      </p>
    );
  }

  return (
    <div data-testid="admin-dashboard" className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-zinc-900">
          {dashboard?.detail ?? "Panel super admin"}
        </h3>
        <p className="mt-1 text-sm text-zinc-600">
          Sesión:{" "}
          <span data-testid="admin-dashboard-user">{dashboard?.user}</span>
        </p>
      </div>

      {metrics ? <AdminMetricsWidgets metrics={metrics} /> : null}
    </div>
  );
}
