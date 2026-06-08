import { test, expect } from "@playwright/test";

import { loginAsMerchant } from "./helpers/auth";

const store = { id: 1, name: "Tienda Ropa", owner_id: 10 };

const productDetail = {
  id: 42,
  name: "Camisa básica",
  price: "29990.00",
  store_id: 1,
  product_type: "physical",
  category_id: 10,
  subcategory_id: 11,
  stock: 25,
  description: "Algodón",
  is_active: true,
  requires_on_site_visit: false,
  duration_minutes: null,
  tracks_stock: true,
  dynamic_values: { talla: ["M", "L"] },
  variants: [],
  ingredients: [],
  images: [],
};

test("food_product_with_variants_test", async ({ page, context }) => {
  await loginAsMerchant(context);

  let patchBody: Record<string, unknown> | null = null;

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
      body: JSON.stringify([
        {
          id: 10,
          name: "Ropa",
          field_config: {
            talla: { mode: "multi", options: ["XS", "S", "M", "L", "XL"] },
          },
          subcategories: [
            {
              id: 11,
              name: "Camisas",
              parent_id: 10,
            },
            {
              id: 12,
              name: "Pantalones",
              parent_id: 10,
            },
          ],
        },
      ]),
    });
  });

  await page.route("**/api/merchant/stores/1/products/42", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(productDetail),
      });
      return;
    }

    patchBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...productDetail,
        dynamic_values: patchBody.dynamic_values,
      }),
    });
  });

  await page.goto("/merchant/products/42");

  await expect(page.getByTestId("product-edit-form")).toBeVisible();
  await expect(page.getByTestId("product-dynamic-fields")).toBeVisible();
  await expect(page.getByTestId("product-dynamic-talla-S")).toBeVisible();
  await expect(page.getByTestId("product-dynamic-talla-XL")).toBeVisible();

  await page.getByTestId("product-dynamic-talla-S").click();
  await page.getByTestId("product-dynamic-talla-XL").click();

  await page.getByTestId("product-edit-submit").click();

  await expect(page.getByTestId("product-edit-success-message")).toContainText(
    "actualizado correctamente",
  );

  expect(patchBody).not.toBeNull();
  expect(patchBody?.dynamic_values).toEqual({
    talla: ["M", "L", "S", "XL"],
  });
});
