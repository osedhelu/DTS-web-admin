import { test, expect } from "@playwright/test";

import { loginAsSuperAdmin } from "./helpers/auth";

const existingCoupon = {
  id: 99,
  code: "VERANO15",
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
};

test("admin_edit_coupon_test", async ({ page, context }) => {
  await loginAsSuperAdmin(context);

  let updated = false;
  let deleted = false;

  await page.route(/\/api\/admin\/coupons\/?$/, async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        count: 1,
        next: null,
        previous: null,
        results: [existingCoupon],
      }),
    });
  });

  await page.route(/\/api\/admin\/coupons\/99\/?$/, async (route) => {
    if (route.request().method() === "PATCH") {
      const body = route.request().postDataJSON() as { discount_value?: string };
      updated = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...existingCoupon,
          discount_value: body.discount_value ?? existingCoupon.discount_value,
        }),
      });
      return;
    }

    deleted = true;
    await route.fulfill({ status: 204, body: "" });
  });

  await page.goto("/admin/coupons");

  await expect(page.getByTestId("coupon-row-99")).toBeVisible();
  await page.getByTestId("coupon-edit-99").click();
  await page.getByTestId("coupon-discount-value").fill("20");
  await page.getByTestId("coupon-submit").click();

  await expect(page.getByTestId("coupons-success-message")).toContainText(
    'Cupón "VERANO15" actualizado correctamente.',
  );
  expect(updated).toBe(true);

  await page.getByTestId("coupon-delete-99").click();
  await expect(page.getByTestId("coupons-success-message")).toContainText(
    "Cupón eliminado correctamente.",
  );
  expect(deleted).toBe(true);
});
