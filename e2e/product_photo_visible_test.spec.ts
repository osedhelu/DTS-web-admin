import { test, expect } from "@playwright/test";

import { loginAsMerchant } from "./helpers/auth";

const store = { id: 1, name: "Restaurante Central", owner_id: 10 };

const productDetail = {
  id: 55,
  name: "Tacos al pastor",
  price: "12000.00",
  store_id: 1,
  product_type: "physical",
  category_id: null,
  subcategory_id: null,
  stock: 20,
  description: "",
  is_active: true,
  requires_on_site_visit: false,
  duration_minutes: null,
  tracks_stock: true,
  variants: [],
  ingredients: [],
  images: [
    {
      id: 101,
      url: "http://extreme.local:8000/media/products/55/tacos-visible.png",
      is_primary: true,
    },
  ],
};

test("product_photo_visible_test", async ({ page, context }) => {
  await loginAsMerchant(context);

  let mediaRequestCount = 0;

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

  await page.route("**/api/merchant/stores/1/products/55", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(productDetail),
    });
  });

  await page.route(
    "http://extreme.local:8000/media/products/55/tacos-visible.png",
    async (route) => {
      mediaRequestCount += 1;
      await route.fulfill({
        status: 200,
        contentType: "image/png",
        body: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMBgJ2fN3kAAAAASUVORK5CYII=",
          "base64",
        ),
      });
    },
  );

  await page.goto("/merchant/products/55");

  const image = page.locator('[data-testid="product-image-101"] img');
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute(
    "src",
    "http://extreme.local:8000/media/products/55/tacos-visible.png",
  );

  await expect
    .poll(async () => mediaRequestCount, { timeout: 5000 })
    .toBeGreaterThan(0);
});
