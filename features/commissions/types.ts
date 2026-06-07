export interface StoreSalesRow {
  report_date: string;
  store_id: number;
  store_name: string;
  order_count: number;
  gross_revenue: string;
}

export interface DriverCommissionRow {
  report_date: string;
  driver_id: number;
  driver_username: string;
  driver_email: string;
  delivery_count: number;
  commission_amount: string;
}

export interface CommissionsReport {
  store_sales: StoreSalesRow[];
  driver_commissions: DriverCommissionRow[];
}
