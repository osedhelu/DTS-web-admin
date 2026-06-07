import { test, expect } from "@playwright/test";

import { loginAsMerchant } from "./helpers/auth";

const store = { id: 1, name: "Restaurante Central", owner_id: 10 };

test("merchant_create_promotion_test", async ({ page, context }) => {
  await loginAsMerchant(context);

  let created = false;

  await page.route("**/api/merchant/stores", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ results: [store] }),
    });
  });

  await page.route("**/api/merchant/stores/1/promotions", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ count: 0, next: null, previous: null, results: [] }),
      });
      return;
    }

    const body = route.request().postDataJSON() as { name: string; discount_value: string };
    created = true;
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        id: 77,
        store_id: 1,
        name: body.name,
        discount_type: "PERCENTAGE",
        discount_value: body.discount_value,
        product_id: null,
        valid_from: null,
        valid_until: null,
        is_active: true,
      }),
    });
  });

  await page.goto("/merchant/promotions");

  await expect(page.getByTestId("promotions-manager")).toBeVisible();
  await page.getByTestId("promotion-name").fill("10% en toda la tienda");
  await page.getByTestId("promotion-discount-value").fill("10");
  await page.getByTestId("promotion-submit").click();

  await expect(page.getByTestId("promotions-success-message")).toContainText(
    'Promoción "10% en toda la tienda" creada correctamente.',
  );
  await expect(page.getByTestId("promotion-row-77")).toBeVisible();
  expect(created).toBe(true);
});
