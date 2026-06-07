import { test, expect } from "@playwright/test";

import { loginAsSuperAdmin } from "./helpers/auth";

test("admin_create_coupon_flow_test", async ({ page, context }) => {
  await loginAsSuperAdmin(context);

  let created = false;

  await page.route("**/api/admin/coupons", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ count: 0, next: null, previous: null, results: [] }),
      });
      return;
    }

    const body = route.request().postDataJSON() as { code: string };
    created = true;
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        id: 99,
        code: body.code,
        discount_type: "percentage",
        discount_value: "15.00",
        min_order_total: "0.00",
        max_uses: null,
        used_count: 0,
        valid_from: "2026-06-01",
        valid_until: "2026-07-01",
        is_active: true,
        created_at: "2026-06-01T00:00:00Z",
        updated_at: "2026-06-01T00:00:00Z",
      }),
    });
  });

  await page.goto("/admin/coupons");

  await expect(page.getByTestId("coupons-manager")).toBeVisible();
  await page.getByTestId("coupon-code").fill("VERANO15");
  await page.getByTestId("coupon-discount-value").fill("15");
  await page.getByTestId("coupon-submit").click();

  await expect(page.getByTestId("coupons-success-message")).toContainText(
    'Cupón "VERANO15" creado correctamente.',
  );
  await expect(page.getByTestId("coupon-row-99")).toBeVisible();
  expect(created).toBe(true);
});
