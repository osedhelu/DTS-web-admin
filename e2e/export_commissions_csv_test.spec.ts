import { test, expect } from "@playwright/test";

import { loginAsSuperAdmin } from "./helpers/auth";

test("export_commissions_csv_test", async ({ page, context }) => {
  await loginAsSuperAdmin(context);

  await page.route("**/api/admin/commissions?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ store_sales: [], driver_commissions: [] }),
    });
  });

  let exportRequested = false;

  await page.route("**/api/admin/commissions/export?**", async (route) => {
    exportRequested = true;
    await route.fulfill({
      status: 200,
      contentType: "text/csv",
      body: "Ventas por comercio\nFecha,Comercio,Pedidos,Ingresos\n",
    });
  });

  await page.goto("/admin/commissions");

  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("commissions-export-csv").click();
  const download = await downloadPromise;

  expect(exportRequested).toBe(true);
  expect(download.suggestedFilename()).toBe("commissions_report.csv");
});
