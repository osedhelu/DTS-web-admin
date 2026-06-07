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
  images: [],
};

test("product_photo_upload_test", async ({ page, context }) => {
  await loginAsMerchant(context);

  let uploadReceived = false;

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

  await page.route("**/api/merchant/stores/1/products/55/images", async (route) => {
    uploadReceived = true;
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        id: 99,
        url: "/media/products/55/tacos.png",
        is_primary: true,
      }),
    });
  });

  await page.goto("/merchant/products/55");

  await expect(page.getByTestId("product-image-gallery")).toBeVisible();

  await page.getByTestId("product-image-input").setInputFiles({
    name: "tacos.png",
    mimeType: "image/png",
    buffer: Buffer.from("fake-image-bytes"),
  });

  await expect(page.getByTestId("product-image-99")).toBeVisible();
  expect(uploadReceived).toBe(true);
});
