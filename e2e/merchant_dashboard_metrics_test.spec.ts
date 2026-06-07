import { test, expect } from "@playwright/test";

import { loginAsMerchant } from "./helpers/auth";

const store = { id: 1, name: "Restaurante Central", owner_id: 10 };

const MOCK_DASHBOARD = {
  store_id: 1,
  period_days: 30,
  total_sales: "825000.00",
  order_count: 42,
  orders_today: 3,
  orders_this_week: 12,
  average_ticket: "19642.86",
  platform_commission_rate: "0.15",
  platform_commission: "123750.00",
  net_earnings: "701250.00",
  active_products: 18,
  sales_series: [
    { date: "2026-05-30", total: "120000.00" },
    { date: "2026-05-31", total: "95000.00" },
    { date: "2026-06-01", total: "150000.00" },
    { date: "2026-06-02", total: "80000.00" },
    { date: "2026-06-03", total: "110000.00" },
    { date: "2026-06-04", total: "130000.00" },
    { date: "2026-06-05", total: "140000.00" },
  ],
  top_products: [
    {
      product_id: 10,
      product_name: "Hamburguesa clásica",
      quantity_sold: 55,
      revenue: "879450.00",
    },
  ],
};

test("merchant_dashboard_metrics_test", async ({ page, context }) => {
  await loginAsMerchant(context);

  await page.route("**/api/merchant/stores", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ results: [store] }),
    });
  });

  await page.route("**/api/merchant/stores/1/dashboard**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_DASHBOARD),
    });
  });

  await page.goto("/merchant");

  await expect(page.getByTestId("merchant-dashboard")).toBeVisible();
  await expect(page.getByTestId("merchant-dashboard-widgets")).toBeVisible();
  await expect(page.getByTestId("merchant-dashboard-total-sales")).toContainText(
    "825.000",
  );
  await expect(page.getByTestId("merchant-dashboard-order-count")).toHaveText("42");
  await expect(page.getByTestId("merchant-dashboard-net-earnings")).toContainText(
    "701.250",
  );
  await expect(page.getByTestId("merchant-dashboard-active-products")).toHaveText(
    "18",
  );
  await expect(page.getByTestId("merchant-dashboard-sales-chart")).toBeVisible();
  await expect(page.getByTestId("merchant-dashboard-top-products")).toContainText(
    "Hamburguesa clásica",
  );
});
