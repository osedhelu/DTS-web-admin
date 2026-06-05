import { test, expect } from "@playwright/test";

import { loginAsMerchant } from "./helpers/auth";

const store = { id: 2, name: "Limpieza Express", owner_id: 10 };

const serviceProduct = {
  id: 77,
  name: "Limpieza profunda apartamento",
  price: "85000",
  store_id: 2,
  product_type: "service",
  category_id: null,
  subcategory_id: null,
  stock: 0,
  description: "Incluye cocina y baños",
  is_active: true,
  requires_on_site_visit: true,
  duration_minutes: 180,
  tracks_stock: false,
};

test("merchant_cannot_set_stock_on_service_test", async ({ page, context }) => {
  await loginAsMerchant(context);

  await page.route("**/api/merchant/stores", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ results: [store] }),
    });
  });

  await page.route("**/api/merchant/stores/2/products", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        count: 1,
        next: null,
        previous: null,
        results: [serviceProduct],
      }),
    });
  });

  await page.goto("/merchant/inventory");

  await expect(page.getByTestId("inventory-services-section")).toBeVisible();
  await expect(page.getByTestId("inventory-service-row-77")).toBeVisible();
  await expect(
    page.getByText("Los servicios no gestionan inventario ni stock."),
  ).toBeVisible();
  await expect(page.getByTestId("stock-input-77")).toHaveCount(0);
  await expect(page.getByTestId("inventory-empty")).toBeVisible();
});
