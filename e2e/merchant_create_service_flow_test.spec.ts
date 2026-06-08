import { test, expect } from "@playwright/test";

import { loginAsMerchant } from "./helpers/auth";

const store = { id: 2, name: "Limpieza Express", owner_id: 10 };

test("merchant_create_service_flow_test", async ({ page, context }) => {
  await loginAsMerchant(context);

  let createdService: Record<string, unknown> | null = null;

  await page.route("**/api/merchant/stores", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ results: [store] }),
    });
  });

  await page.route("**/api/merchant/stores/2/categories", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route("**/api/merchant/stores/2/products", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ count: 0, next: null, previous: null, results: [] }),
      });
      return;
    }

    const body = route.request().postDataJSON() as Record<string, unknown>;
    createdService = {
      id: 77,
      name: body.name,
      price: String(body.price),
      store_id: 2,
      product_type: "service",
      category_id: null,
      subcategory_id: null,
      stock: 0,
      description: body.description ?? "",
      is_active: true,
      requires_on_site_visit: true,
      duration_minutes: body.duration_minutes ?? null,
      tracks_stock: false,
    };

    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(createdService),
    });
  });

  await page.route("**/api/merchant/stores/2/products/77", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...createdService,
        variants: [],
        ingredients: [],
        images: [],
      }),
    });
  });

  await page.goto("/merchant/products/new");

  await page.getByTestId("product-type-service").check();
  await expect(page.getByTestId("product-duration")).toBeVisible();
  await expect(page.getByTestId("product-stock")).not.toBeVisible();

  await page.getByTestId("product-name").fill("Limpieza profunda apartamento");
  await page.getByTestId("product-price").fill("85000");
  await page.getByTestId("product-duration").fill("180");
  await page.getByTestId("product-description").fill("Incluye cocina y baños");
  await page.getByTestId("product-submit").click();

  await expect(page).toHaveURL(/\/merchant\/products\/77$/);
  await expect(page.getByTestId("product-edit-success-message")).toContainText(
    'Servicio "Limpieza profunda apartamento" creado correctamente.',
  );
  await expect(page.getByTestId("product-edit-form")).toBeVisible();
  expect(createdService?.product_type).toBe("service");
  expect(createdService?.duration_minutes).toBe(180);
});
