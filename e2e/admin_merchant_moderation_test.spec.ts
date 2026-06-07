import { test, expect } from "@playwright/test";

import { loginAsSuperAdmin } from "./helpers/auth";

test("admin_merchant_moderation_test", async ({ page, context }) => {
  await loginAsSuperAdmin(context);

  let suspended = false;

  await page.route("**/api/admin/merchants**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            user_id: 42,
            email: "ana.nueva@test.com",
            first_name: "Ana",
            last_name: "López",
            email_verified: false,
            user_is_active: false,
            business_name: "Tacos Ana",
            phone: "+573001112233",
            store_id: 12,
            store_name: "Tacos Ana",
            store_vertical: "FOOD",
            store_is_active: true,
            registered_at: "2026-06-05T10:00:00Z",
          },
        ],
      }),
    });
  });

  await page.route("**/api/admin/stores/12/moderation", async (route) => {
    suspended = true;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: 12, is_active: false }),
    });
  });

  await page.goto("/admin/merchants");

  await expect(page.getByTestId("merchants-manager")).toBeVisible();
  await expect(page.getByTestId("merchant-row-12")).toBeVisible();
  await expect(page.getByTestId("merchant-verification-12")).toContainText("Pendiente");
  await expect(page.getByTestId("merchant-row-12")).toContainText("ana.nueva@test.com");
  await expect(page.getByTestId("merchant-row-12")).toContainText("Tacos Ana");

  await page.getByTestId("merchants-filter-email-verified").selectOption("false");
  await expect(page.getByTestId("merchant-row-12")).toBeVisible();

  await page.getByTestId("merchant-suspend-12").click();
  await expect(page.getByTestId("merchants-success-message")).toContainText(
    "Tienda suspendida correctamente.",
  );
  await expect(page.getByTestId("merchant-store-status-12")).toContainText("Suspendida");
  expect(suspended).toBe(true);
});
