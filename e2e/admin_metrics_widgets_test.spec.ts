import { test, expect } from "@playwright/test";

import { loginAsSuperAdmin } from "./helpers/auth";

const MOCK_METRICS = {
  sales_series: [
    { date: "2026-05-30", total: "120000.00" },
    { date: "2026-05-31", total: "95000.00" },
    { date: "2026-06-01", total: "150000.00" },
    { date: "2026-06-02", total: "80000.00" },
    { date: "2026-06-03", total: "110000.00" },
    { date: "2026-06-04", total: "130000.00" },
    { date: "2026-06-05", total: "140000.00" },
  ],
  active_stores: 12,
  average_delivery_minutes: 28.5,
};

test("admin_metrics_widgets_test", async ({ page, context }) => {
  await loginAsSuperAdmin(context);

  await page.route("**/api/admin/dashboard", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        detail: "Panel super admin",
        user: "superadmin",
      }),
    });
  });

  await page.route("**/api/admin/metrics", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_METRICS),
    });
  });

  await page.goto("/admin");

  await expect(page.getByTestId("admin-metrics-widgets")).toBeVisible();
  await expect(page.getByTestId("admin-metrics-sales-chart")).toBeVisible();
  await expect(page.getByTestId("admin-metrics-active-stores")).toHaveText("12");
  await expect(page.getByTestId("admin-metrics-delivery-time")).toHaveText(
    "28.5 min",
  );
  await expect(page.getByTestId("admin-metrics-total-sales")).toContainText(
    "825.000",
  );
});
