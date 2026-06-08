import { test, expect } from "@playwright/test";

import { loginAsMerchant } from "./helpers/auth";

const store = { id: 1, name: "Restaurante Central", owner_id: 10 };

test("merchant_create_product_flow_test", async ({ page, context }) => {
  await loginAsMerchant(context);

  let createdProduct: Record<string, unknown> | null = null;

  await page.route("**/api/merchant/stores", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ results: [store] }),
    });
  });

  await page.route("**/api/merchant/stores/1/categories", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route("**/api/merchant/stores/1/products", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ count: 0, next: null, previous: null, results: [] }),
      });
      return;
    }

    const body = route.request().postDataJSON() as Record<string, unknown>;
    createdProduct = {
      id: 42,
      name: body.name,
      price: String(body.price),
      store_id: 1,
      product_type: "physical",
      category_id: null,
      subcategory_id: null,
      stock: body.stock ?? 0,
      description: body.description ?? "",
      is_active: true,
      requires_on_site_visit: false,
      duration_minutes: null,
      tracks_stock: true,
    };

    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(createdProduct),
    });
  });

  await page.route("**/api/merchant/stores/1/products/42", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...createdProduct,
        variants: [],
        ingredients: [],
        images: [],
      }),
    });
  });

  await page.goto("/merchant/products/new");

  await expect(page.getByTestId("product-form")).toBeVisible();
  await expect(page.getByTestId("product-form-back")).toBeVisible();
  await expect(page.getByTestId("product-type-physical")).toBeChecked();
  await expect(page.getByTestId("product-stock")).toBeVisible();
  await expect(page.getByTestId("product-duration")).not.toBeVisible();

  await page.getByTestId("product-name").fill("Hamburguesa clásica");
  await page.getByTestId("product-price").fill("15990");
  await page.getByTestId("product-stock").fill("25");
  await page.getByTestId("product-description").fill("Carne 150g, queso y vegetales");
  await page.getByTestId("product-submit").click();

  await expect(page).toHaveURL(/\/merchant\/products\/42$/);
  await expect(page.getByTestId("product-edit-success-message")).toContainText(
    'Producto "Hamburguesa clásica" creado correctamente.',
  );
  await expect(page.getByTestId("product-edit-form")).toBeVisible();
  expect(createdProduct?.product_type).toBe("physical");
});
