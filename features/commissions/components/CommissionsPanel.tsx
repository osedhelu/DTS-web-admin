"use client";

import { useEffect } from "react";

import { useCommissionsStore } from "@/features/commissions/stores/commissions-store";

function formatCurrency(value: string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function CommissionsPanel() {
  const report = useCommissionsStore((state) => state.report);
  const days = useCommissionsStore((state) => state.days);
  const isLoading = useCommissionsStore((state) => state.isLoading);
  const isExporting = useCommissionsStore((state) => state.isExporting);
  const error = useCommissionsStore((state) => state.error);
  const setDays = useCommissionsStore((state) => state.setDays);
  const loadReport = useCommissionsStore((state) => state.loadReport);
  const exportCsv = useCommissionsStore((state) => state.exportCsv);

  useEffect(() => {
    void loadReport();
  }, [loadReport, days]);

  return (
    <div data-testid="commissions-panel" className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Período (días)
          <input
            data-testid="commissions-days-input"
            type="number"
            min={1}
            max={90}
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
            className="w-28 rounded-lg border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>

        <button
          type="button"
          data-testid="commissions-export-csv"
          disabled={isExporting}
          onClick={() => void exportCsv()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isExporting ? "Exportando…" : "Exportar CSV"}
        </button>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-zinc-500">Cargando reporte…</p>
      ) : (
        <>
          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-zinc-900">
              Ventas por comercio
            </h3>
            <div
              data-testid="commissions-store-table"
              className="mt-3 overflow-x-auto"
            >
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-zinc-600">
                    <th className="py-2 pr-4">Fecha</th>
                    <th className="py-2 pr-4">Comercio</th>
                    <th className="py-2 pr-4">Pedidos</th>
                    <th className="py-2">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {report?.store_sales.map((row) => (
                    <tr
                      key={`${row.report_date}-${row.store_id}`}
                      data-testid={`store-sale-row-${row.store_id}`}
                    >
                      <td className="py-2 pr-4">{row.report_date}</td>
                      <td className="py-2 pr-4">{row.store_name}</td>
                      <td className="py-2 pr-4">{row.order_count}</td>
                      <td className="py-2">{formatCurrency(row.gross_revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(report?.store_sales.length ?? 0) === 0 ? (
                <p className="mt-2 text-sm text-zinc-500">Sin ventas en el período.</p>
              ) : null}
            </div>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-zinc-900">
              Comisiones por conductor
            </h3>
            <div
              data-testid="commissions-driver-table"
              className="mt-3 overflow-x-auto"
            >
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-zinc-600">
                    <th className="py-2 pr-4">Fecha</th>
                    <th className="py-2 pr-4">Conductor</th>
                    <th className="py-2 pr-4">Entregas</th>
                    <th className="py-2">Comisión</th>
                  </tr>
                </thead>
                <tbody>
                  {report?.driver_commissions.map((row) => (
                    <tr
                      key={`${row.report_date}-${row.driver_id}`}
                      data-testid={`driver-commission-row-${row.driver_id}`}
                    >
                      <td className="py-2 pr-4">{row.report_date}</td>
                      <td className="py-2 pr-4">{row.driver_username}</td>
                      <td className="py-2 pr-4">{row.delivery_count}</td>
                      <td className="py-2">
                        {formatCurrency(row.commission_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(report?.driver_commissions.length ?? 0) === 0 ? (
                <p className="mt-2 text-sm text-zinc-500">
                  Sin comisiones en el período.
                </p>
              ) : null}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
