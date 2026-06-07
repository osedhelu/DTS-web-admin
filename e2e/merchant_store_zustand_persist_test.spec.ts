import { test, expect } from "@playwright/test";

import { loginAsMerchant } from "./helpers/auth";

const stores = [
  { id: 1, name: "Tienda Norte", owner_id: 10 },
  { id: 2, name: "Tienda Sur", owner_id: 10 },
];

test("merchant_store_zustand_persist_test", async ({ page, context }) => {
  await loginAsMerchant(context);

  await page.route("**/api/merchant/stores", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ results: stores }),
    });
  });

  await page.route("**/api/merchant/stores/1/products", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ count: 0, next: null, previous: null, results: [] }),
    });
  });

  await page.route("**/api/merchant/stores/2/products", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ count: 0, next: null, previous: null, results: [] }),
    });
  });

  await page.goto("/merchant/products");

  const headerSelector = page.getByTestId("merchant-store-selector");
  await expect(headerSelector).toBeVisible();
  await headerSelector.selectOption("2");

  await page.getByRole("link", { name: "Inventario" }).click();
  await expect(page).toHaveURL(/\/merchant\/inventory$/);

  await expect(headerSelector).toHaveValue("2");
});
