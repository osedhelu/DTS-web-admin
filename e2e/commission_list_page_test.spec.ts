import { test, expect } from "@playwright/test";

import { loginAsSuperAdmin } from "./helpers/auth";

const MOCK_COMMISSIONS = {
  store_sales: [
    {
      report_date: "2026-06-01",
      store_id: 1,
      store_name: "Tienda Norte",
      order_count: 12,
      gross_revenue: "450000.00",
    },
  ],
  driver_commissions: [
    {
      report_date: "2026-06-01",
      driver_id: 5,
      driver_username: "driver1",
      driver_email: "driver@test.com",
      delivery_count: 8,
      commission_amount: "32000.00",
    },
  ],
};

test("commission_list_page_test", async ({ page, context }) => {
  await loginAsSuperAdmin(context);

  await page.route("**/api/admin/commissions**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_COMMISSIONS),
    });
  });

  await page.goto("/admin/commissions");

  await expect(page.getByTestId("commissions-panel")).toBeVisible();
  await expect(page.getByTestId("commissions-store-table")).toBeVisible();
  await expect(page.getByTestId("store-sale-row-1")).toContainText("Tienda Norte");
  await expect(page.getByTestId("commissions-driver-table")).toBeVisible();
  await expect(page.getByTestId("driver-commission-row-5")).toContainText("driver1");
});
