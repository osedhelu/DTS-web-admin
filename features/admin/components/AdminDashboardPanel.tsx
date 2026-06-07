"use client";

import { useEffect, useState } from "react";

import { AdminMetricsWidgets } from "@/features/admin/components/AdminMetricsWidgets";
import type { AdminDashboardData, AdminMetrics } from "@/features/admin/types";

export function AdminDashboardPanel() {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPanel() {
      try {
        const [dashboardResponse, metricsResponse] = await Promise.all([
          fetch("/api/admin/dashboard"),
          fetch("/api/admin/metrics"),
        ]);

        const dashboardData = (await dashboardResponse.json()) as AdminDashboardData & {
          detail?: string;
        };
        const metricsData = (await metricsResponse.json()) as AdminMetrics & {
          detail?: string;
        };

        if (cancelled) {
          return;
        }

        if (!dashboardResponse.ok) {
          setError(dashboardData.detail ?? "No se pudo cargar el panel");
          return;
        }

        if (!metricsResponse.ok) {
          setError(metricsData.detail ?? "No se pudieron cargar las métricas");
          return;
        }

        setDashboard(dashboardData);
        setMetrics(metricsData);
      } catch {
        if (!cancelled) {
          setError("Error de conexión al cargar el panel.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPanel();

    return () => {
      cancelled = true;
    };
  }, []);

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
