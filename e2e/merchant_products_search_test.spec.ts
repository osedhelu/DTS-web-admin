import { test, expect } from "@playwright/test";

import { loginAsMerchant } from "./helpers/auth";

const store = { id: 1, name: "Restaurante Central", owner_id: 10 };

const products = [
  {
    id: 1,
    name: "Hamburguesa clásica",
    price: "15000.00",
    product_type: "physical",
    stock: 10,
    is_active: true,
    primary_image_url: "",
  },
  {
    id: 2,
    name: "Limpieza del hogar",
    price: "80000.00",
    product_type: "service",
    duration_minutes: 120,
    is_active: true,
    primary_image_url: "",
  },
];

test("merchant_products_search_test", async ({ page, context }) => {
  await loginAsMerchant(context);

  await page.route("**/api/merchant/stores", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ results: [store] }),
    });
  });

  await page.route("**/api/merchant/stores/1/products**", async (route) => {
    const url = new URL(route.request().url());
    const search = url.searchParams.get("search") ?? "";
    const type = url.searchParams.get("type");

    let filtered = products;
    if (search) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (type) {
      filtered = filtered.filter((product) => product.product_type === type);
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        count: filtered.length,
        next: null,
        previous: null,
        results: filtered,
      }),
    });
  });

  await page.goto("/merchant/products");

  await expect(page.getByTestId("products-filters")).toBeVisible();
  await expect(page.getByTestId("product-row-1")).toBeVisible();
  await expect(page.getByTestId("product-row-2")).toBeVisible();

  await page.getByTestId("products-search-input").fill("Hamburguesa");
  await expect(page.getByTestId("product-row-1")).toBeVisible();
  await expect(page.getByTestId("product-row-2")).toHaveCount(0);

  await page.getByTestId("products-search-input").fill("");
  await page.getByTestId("products-type-filter").selectOption("service");
  await expect(page.getByTestId("product-row-2")).toBeVisible();
  await expect(page.getByTestId("product-row-1")).toHaveCount(0);
});
