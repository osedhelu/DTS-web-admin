import { test, expect } from "@playwright/test";

import { loginAsMerchant } from "./helpers/auth";

const store = { id: 1, name: "Restaurante Central", owner_id: 10 };

test("merchant_create_category_flow_test", async ({ page, context }) => {
  await loginAsMerchant(context);

  await page.route("**/api/merchant/stores", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ results: [store] }),
    });
  });

  const categories: Array<{
    id: number;
    name: string;
    subcategories: [];
  }> = [];

  await page.route("**/api/merchant/stores/1/category-templates**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        vertical: "food",
        templates: [
          {
            name: "Restaurante",
            subcategories: ["Entradas", "Platos fuertes", "Bebidas"],
            already_imported: false,
          },
        ],
      }),
    });
  });

  await page.route("**/api/merchant/stores/1/categories", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(categories),
      });
      return;
    }

    const body = route.request().postDataJSON() as { name: string };
    categories.push({ id: 5, name: body.name, subcategories: [] });

    await route.fulfill({
      status: 201,
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

  await expect(page.getByTestId("categories-empty")).toBeVisible();
  await page.getByTestId("categories-create-link").click();

  await expect(page.getByTestId("category-modal")).toBeVisible();
  await expect(page.getByTestId("category-template-picker")).toBeVisible();
  await page.getByTestId("category-create-manual").click();
  await expect(page.getByTestId("create-category-form")).toBeVisible();

  await page.getByTestId("category-name").fill("Comida");
  await page.getByTestId("category-submit").click();

  await expect(page.getByTestId("category-modal")).not.toBeVisible();
  await expect(page.getByTestId("categories-success-message")).toContainText(
    'Categoría "Comida" creada correctamente.',
  );
  await expect(page.getByTestId("category-row-5")).toBeVisible();
  await expect(page.getByTestId("category-row-5")).toContainText("Comida");
});
