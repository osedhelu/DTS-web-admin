export interface AdminDashboardData {
  detail: string;
  user: string;
}

export interface SalesSeriesPoint {
  date: string;
  total: string;
}

export interface AdminMetrics {
  sales_series: SalesSeriesPoint[];
  active_stores: number;
  average_delivery_minutes: number | null;
}
