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
      className="mt-6 flex h-40 items-end gap-2"
    >
      {series.map((point) => {
        const heightPercent = (Number(point.total) / maxTotal) * 100;

        return (
          <div
            key={point.date}
            className="flex min-w-0 flex-1 flex-col items-center gap-2"
          >
            <div className="flex h-32 w-full items-end">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400"
                style={{ height: `${Math.max(heightPercent, 6)}%` }}
                title={`${point.date}: ${formatCurrency(point.total)}`}
              />
            </div>
            <span className="text-[10px] font-medium text-zinc-500">
              {formatShortDate(point.date)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface KpiCardProps {
  testId: string;
  label: string;
  value: string;
  hint: string;
  accent: "emerald" | "blue" | "amber";
}

function KpiCard({ testId, label, value, hint, accent }: KpiCardProps) {
  const accentClasses = {
    emerald: "from-emerald-500/10 to-emerald-500/5 ring-emerald-200 text-emerald-800",
    blue: "from-blue-500/10 to-blue-500/5 ring-blue-200 text-blue-800",
    amber: "from-amber-500/10 to-amber-500/5 ring-amber-200 text-amber-800",
  }[accent];

  return (
    <article
      data-testid={testId}
      className={`rounded-2xl bg-gradient-to-br p-5 ring-1 ${accentClasses}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-3 text-3xl font-bold text-zinc-900">{value}</p>
      <p className="mt-2 text-xs text-zinc-600">{hint}</p>
    </article>
  );
}

export function AdminMetricsWidgets({ metrics }: { metrics: AdminMetrics }) {
  const totalSales = metrics.sales_series.reduce(
    (sum, point) => sum + Number(point.total),
    0,
  );

  return (
    <div data-testid="admin-metrics-widgets" className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Indicadores clave
        </h3>
        <p className="text-sm text-zinc-600">Resumen operativo de los últimos 7 días.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          testId="admin-kpi-sales"
          label="Ventas (7 días)"
          value={formatCurrency(totalSales)}
          hint="Total facturado en la plataforma"
          accent="emerald"
        />
        <KpiCard
          testId="admin-kpi-stores"
          label="Comercios activos"
          value={String(metrics.active_stores)}
          hint="Tiendas operativas en este momento"
          accent="blue"
        />
        <KpiCard
          testId="admin-kpi-delivery"
          label="Entrega promedio"
          value={
            metrics.average_delivery_minutes !== null
              ? `${metrics.average_delivery_minutes} min`
              : "—"
          }
          hint="Tiempo medio de última milla"
          accent="amber"
        />
      </div>

      <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h4 className="font-semibold text-zinc-900">Ventas diarias</h4>
            <p className="text-sm text-zinc-500">Últimos 7 días en la plataforma</p>
          </div>
          <p
            data-testid="admin-metrics-total-sales"
            className="text-lg font-bold text-emerald-700"
          >
            {formatCurrency(totalSales)}
          </p>
        </div>
        <SalesChart series={metrics.sales_series} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <p className="text-sm text-zinc-600">
            Comercios activos:{" "}
            <span
              data-testid="admin-metrics-active-stores"
              className="font-semibold text-zinc-900"
            >
              {metrics.active_stores}
            </span>
          </p>
          <p className="text-sm text-zinc-600">
            Tiempo promedio entrega:{" "}
            <span
              data-testid="admin-metrics-delivery-time"
              className="font-semibold text-zinc-900"
            >
              {metrics.average_delivery_minutes !== null
                ? `${metrics.average_delivery_minutes} min`
                : "—"}
            </span>
          </p>
        </div>
      </article>
    </div>
  );
}
