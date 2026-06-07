import { test, expect } from "@playwright/test";

import { loginAsMerchant } from "./helpers/auth";

const store = { id: 1, name: "Restaurante Central", owner_id: 10 };

const productDetail = {
  id: 42,
  name: "Hamburguesa clásica",
  price: "15990.00",
  store_id: 1,
  product_type: "physical",
  category_id: null,
  subcategory_id: null,
  stock: 25,
  description: "Carne 150g",
  is_active: true,
  requires_on_site_visit: false,
  duration_minutes: null,
  tracks_stock: true,
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
          name: "Comida rápida",
          subcategories: [{ id: 11, name: "Hamburguesas", parent_id: 10 }],
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
        variants: patchBody.variants,
        ingredients: patchBody.ingredients,
      }),
    });
  });

  await page.goto("/merchant/products/42");

  await expect(page.getByTestId("product-edit-form")).toBeVisible();
  await page.getByTestId("add-default-variants").click();

  await page.getByTestId("variant-price-0").fill("12990");
  await page.getByTestId("variant-price-1").fill("15990");
  await page.getByTestId("variant-price-2").fill("18990");
  await page.getByTestId("variant-price-3").fill("21990");

  await page.getByTestId("add-ingredient").click();
  await page.getByTestId("ingredient-name-0").fill("Queso cheddar");
  await page.getByTestId("add-ingredient").click();
  await page.getByTestId("ingredient-name-1").fill("Maní");
  await page.getByTestId("ingredient-allergen-1").check();

  await page.getByTestId("product-edit-submit").click();

  await expect(page.getByTestId("product-edit-success-message")).toContainText(
    "actualizado correctamente",
  );

  expect(patchBody).not.toBeNull();
  expect(patchBody?.variants).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: "S", price: "12990" }),
      expect.objectContaining({ name: "XL", price: "21990" }),
    ]),
  );
  expect(patchBody?.ingredients).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: "Queso cheddar", is_allergen: false }),
      expect.objectContaining({ name: "Maní", is_allergen: true }),
    ]),
  );
});
