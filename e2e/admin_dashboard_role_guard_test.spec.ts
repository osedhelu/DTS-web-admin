import { test, expect } from "@playwright/test";

import { loginAsMerchant, loginAsSuperAdmin } from "./helpers/auth";

test("admin_dashboard_role_guard_test", async ({ page, context }) => {
  await loginAsMerchant(context);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/merchant$/);

  await context.clearCookies();
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
      body: JSON.stringify({
        sales_series: [{ date: "2026-06-05", total: "100000.00" }],
        active_stores: 5,
        average_delivery_minutes: 25,
      }),
    });
  });

  await page.goto("/admin");

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByTestId("admin-sidebar")).toBeVisible();
  await expect(page.getByTestId("admin-dashboard")).toBeVisible();
  await expect(page.getByText("Panel super admin")).toBeVisible();
  await expect(page.getByTestId("admin-dashboard-user")).toHaveText("superadmin");
  await expect(page.getByTestId("admin-kpi-sales")).toBeVisible();
});
