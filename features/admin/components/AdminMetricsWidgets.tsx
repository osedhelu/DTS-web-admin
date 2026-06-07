import type { AdminMetrics, SalesSeriesPoint } from "@/features/admin/types";

function formatCurrency(value: string | number): string {
  const amount = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return `${day}/${month}`;
}

function SalesChart({ series }: { series: SalesSeriesPoint[] }) {
  const maxTotal = Math.max(...series.map((point) => Number(point.total)), 1);

  return (
    <div
      data-testid="admin-metrics-sales-chart"
      className="mt-4 flex h-36 items-end gap-2"
    >
      {series.map((point) => {
        const heightPercent = (Number(point.total) / maxTotal) * 100;

        return (
          <div
            key={point.date}
            className="flex min-w-0 flex-1 flex-col items-center gap-1"
          >
            <div
              className="w-full rounded-t bg-blue-600"
              style={{ height: `${Math.max(heightPercent, 4)}%` }}
              title={`${point.date}: ${formatCurrency(point.total)}`}
            />
            <span className="text-[10px] text-zinc-500">
              {formatShortDate(point.date)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function AdminMetricsWidgets({ metrics }: { metrics: AdminMetrics }) {
  const totalSales = metrics.sales_series.reduce(
    (sum, point) => sum + Number(point.total),
    0,
  );

  return (
    <div data-testid="admin-metrics-widgets" className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <article
          data-testid="admin-kpi-sales"
          className="rounded-xl border border-zinc-200 bg-white p-4 sm:col-span-1"
        >
          <p className="text-sm text-zinc-600">Ventas (7 días)</p>
          <p
            data-testid="admin-metrics-total-sales"
            className="mt-2 text-2xl font-semibold text-zinc-900"
          >
            {formatCurrency(totalSales)}
          </p>
        </article>

        <article
          data-testid="admin-kpi-stores"
          className="rounded-xl border border-zinc-200 bg-white p-4"
        >
          <p className="text-sm text-zinc-600">Comercios activos</p>
          <p
            data-testid="admin-metrics-active-stores"
            className="mt-2 text-2xl font-semibold text-zinc-900"
          >
            {metrics.active_stores}
          </p>
        </article>

        <article
          data-testid="admin-kpi-delivery"
          className="rounded-xl border border-zinc-200 bg-white p-4"
        >
          <p className="text-sm text-zinc-600">Tiempo promedio entrega</p>
          <p
            data-testid="admin-metrics-delivery-time"
            className="mt-2 text-2xl font-semibold text-zinc-900"
          >
            {metrics.average_delivery_minutes !== null
              ? `${metrics.average_delivery_minutes} min`
              : "—"}
          </p>
        </article>
      </div>

      <article className="rounded-xl border border-zinc-200 bg-white p-4">
        <h4 className="text-sm font-medium text-zinc-900">
          Ventas diarias (últimos 7 días)
        </h4>
        <SalesChart series={metrics.sales_series} />
      </article>
    </div>
  );
}
