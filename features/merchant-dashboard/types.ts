export interface SalesSeriesPoint {
  date: string;
  total: string;
}

export interface TopProductSummary {
  product_id: number | null;
  product_name: string;
  quantity_sold: number;
  revenue: string;
}

export interface MerchantDashboardMetrics {
  store_id: number;
  period_days: number;
  total_sales: string;
  order_count: number;
  orders_today: number;
  orders_this_week: number;
  average_ticket: string;
  platform_commission_rate: string;
  platform_commission: string;
  net_earnings: string;
  active_products: number;
  sales_series: SalesSeriesPoint[];
  top_products: TopProductSummary[];
}
