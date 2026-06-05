import { test, expect } from "@playwright/test";

import { loginAsMerchant } from "./helpers/auth";

const store = { id: 1, name: "Restaurante Central", owner_id: 10 };

const physicalProduct = {
  id: 42,
  name: "Hamburguesa clásica",
  price: "15990",
  store_id: 1,
  product_type: "physical",
  category_id: null,
  subcategory_id: null,
  stock: 10,
  description: "",
  is_active: true,
  requires_on_site_visit: false,
  duration_minutes: null,
  tracks_stock: true,
};

test("merchant_update_stock_flow_test", async ({ page, context }) => {
  await loginAsMerchant(context);

  await page.route("**/api/merchant/stores", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ results: [store] }),
    });
  });

  await page.route("**/api/merchant/stores/1/products", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          count: 1,
          next: null,
          previous: null,
          results: [physicalProduct],
        }),
      });
      return;
    }

    await route.continue();
  });

  await page.route("**/api/merchant/stores/1/products/42", async (route) => {
    if (route.request().method() !== "PATCH") {
      await route.continue();
      return;
    }

    const body = route.request().postDataJSON() as { stock: number };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...physicalProduct,
        stock: body.stock,
      }),
    });
  });

  await page.goto("/merchant/inventory");

  await expect(page.getByRole("heading", { name: "Inventario" })).toBeVisible();
  await expect(page.getByTestId("stock-current-42")).toHaveText("10");

  await page.getByTestId("stock-input-42").fill("25");
  await page.getByTestId("stock-save-42").click();

  await expect(page.getByTestId("inventory-success-message")).toContainText(
    'Stock de "Hamburguesa clásica" actualizado a 25 unidades.',
  );
  await expect(page.getByTestId("stock-current-42")).toHaveText("25");
});
