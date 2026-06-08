import { test, expect } from "@playwright/test";

import { loginAsMerchant } from "./helpers/auth";

const store = { id: 1, name: "Restaurante Central", owner_id: 10 };

let initialCategories = [
  {
    id: 5,
    name: "Comida",
    subcategories: [] as Array<{ id: number; name: string; parent_id: number }>,
  },
];

test("merchant_edit_category_test", async ({ page, context }) => {
  await loginAsMerchant(context);

  let updated = false;

  await page.route("**/api/merchant/stores", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ results: [store] }),
    });
  });

  await page.route("**/api/merchant/stores/1/categories", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(initialCategories),
      });
      return;
    }

    await route.continue();
  });

  await page.route("**/api/merchant/stores/1/categories/5", async (route) => {
    const body = route.request().postDataJSON() as { name: string };
    updated = true;
    initialCategories = [{ id: 5, name: body.name, subcategories: [] }];
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 5,
        name: body.name,
        store_id: 1,
        parent_id: null,
      }),
    });
  });

  await page.goto("/merchant/categories");

  await expect(page.getByTestId("category-row-5")).toBeVisible();
  await page.getByTestId("category-edit-5").click();

  await expect(page.getByTestId("category-modal")).toBeVisible();
  await expect(page.getByTestId("category-edit-form")).toBeVisible();

  await page.getByTestId("category-edit-input-5").fill("Comida rápida");
  await page.getByTestId("category-save-5").click();

  await expect(page.getByTestId("category-modal")).not.toBeVisible();
  await expect(page.getByTestId("categories-success-message")).toContainText(
    'Categoría "Comida rápida" actualizada correctamente.',
  );
  expect(updated).toBe(true);
});
