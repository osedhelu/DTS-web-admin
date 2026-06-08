import type { MerchantDashboardMetrics, SalesSeriesPoint } from "@/features/merchant-dashboard/types";

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
      data-testid="merchant-dashboard-sales-chart"
      className="mt-6 flex h-40 items-end gap-2 overflow-x-auto"
    >
      {series.slice(-14).map((point) => {
        const heightPercent = (Number(point.total) / maxTotal) * 100;

        return (
          <div
            key={point.date}
            className="flex min-w-[28px] flex-1 flex-col items-center gap-2"
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
  accent: "emerald" | "blue" | "amber" | "violet";
  valueTestId?: string;
}

function KpiCard({ testId, label, value, hint, accent, valueTestId }: KpiCardProps) {
  const accentClasses = {
    emerald: "from-emerald-500/10 to-emerald-500/5 ring-emerald-200",
    blue: "from-blue-500/10 to-blue-500/5 ring-blue-200",
    amber: "from-amber-500/10 to-amber-500/5 ring-amber-200",
    violet: "from-violet-500/10 to-violet-500/5 ring-violet-200",
  }[accent];

  return (
    <article
      data-testid={testId}
      className={`rounded-2xl bg-gradient-to-br p-5 ring-1 ${accentClasses}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p
        data-testid={valueTestId}
        className="mt-3 text-3xl font-bold text-zinc-900"
      >
        {value}
      </p>
      <p className="mt-2 text-xs text-zinc-600">{hint}</p>
    </article>
  );
}

export function MerchantDashboardWidgets({
  metrics,
}: {
  metrics: MerchantDashboardMetrics;
}) {
  return (
    <div data-testid="merchant-dashboard-widgets" className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Indicadores clave
        </h3>
        <p className="text-sm text-zinc-600">
          Resumen de los últimos {metrics.period_days} días de tu tienda.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          testId="merchant-kpi-sales"
          label={`Ventas (${metrics.period_days} días)`}
          value={formatCurrency(metrics.total_sales)}
          hint="Total facturado en el período"
          accent="emerald"
        />
        <KpiCard
          testId="merchant-kpi-orders"
          valueTestId="merchant-dashboard-order-count"
          label="Pedidos completados"
          value={String(metrics.order_count)}
          hint={`Hoy: ${metrics.orders_today} · Semana: ${metrics.orders_this_week}`}
          accent="blue"
        />
        <KpiCard
          testId="merchant-kpi-ticket"
          valueTestId="merchant-dashboard-average-ticket"
          label="Ticket promedio"
          value={formatCurrency(metrics.average_ticket)}
          hint="Valor medio por pedido"
          accent="amber"
        />
        <KpiCard
          testId="merchant-kpi-net"
          valueTestId="merchant-dashboard-net-earnings"
          label="Ganancia neta estimada"
          value={formatCurrency(metrics.net_earnings)}
          hint={`Comisión plataforma: ${formatCurrency(metrics.platform_commission)}`}
          accent="violet"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm lg:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h4 className="font-semibold text-zinc-900">Ventas diarias</h4>
              <p className="text-sm text-zinc-500">Últimos 14 días</p>
            </div>
            <p
              data-testid="merchant-dashboard-total-sales"
              className="text-lg font-bold text-emerald-700"
            >
              {formatCurrency(metrics.total_sales)}
            </p>
          </div>
          <SalesChart series={metrics.sales_series} />
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
          <h4 className="font-semibold text-zinc-900">Productos activos</h4>
          <p
            data-testid="merchant-dashboard-active-products"
            className="mt-2 text-3xl font-bold text-zinc-900"
          >
            {metrics.active_products}
          </p>

          <h4 className="mt-6 text-sm font-semibold text-zinc-900">Top productos</h4>
          {metrics.top_products.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">Sin ventas en el período.</p>
          ) : (
            <ul
              data-testid="merchant-dashboard-top-products"
              className="mt-2 space-y-2 text-sm"
            >
              {metrics.top_products.map((product) => (
                <li
                  key={`${product.product_id}-${product.product_name}`}
                  className="flex items-center justify-between gap-2 rounded-lg bg-zinc-50/80 px-2 py-1.5"
                >
                  <span className="truncate text-zinc-700">{product.product_name}</span>
                  <span className="shrink-0 font-medium text-zinc-900">
                    {formatCurrency(product.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </div>
  );
}
