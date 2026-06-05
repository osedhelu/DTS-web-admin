import { test, expect } from "@playwright/test";

import { loginAsMerchant } from "./helpers/auth";

const store = { id: 1, name: "Restaurante Central", owner_id: 10 };

const rootCategory = {
  id: 10,
  name: "Comida",
  subcategories: [] as Array<{ id: number; name: string; parent_id: number }>,
};

test("merchant_create_subcategory_flow_test", async ({ page, context }) => {
  await loginAsMerchant(context);

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
        body: JSON.stringify([rootCategory]),
      });
      return;
    }

    const body = route.request().postDataJSON() as {
      name: string;
      parent_id: number;
    };

    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        id: 11,
        name: body.name,
        store_id: 1,
        parent_id: body.parent_id,
      }),
    });
  });

  await page.goto("/merchant/categories");

  await page.getByTestId("subcategory-parent").selectOption("10");
  await page.getByTestId("subcategory-name").fill("Hamburguesas");
  await page.getByTestId("subcategory-submit").click();

  await expect(page.getByTestId("categories-success-message")).toContainText(
    'Subcategoría "Hamburguesas" creada correctamente.',
  );
  await expect(page.getByTestId("subcategory-row-11")).toBeVisible();
  await expect(page.getByTestId("subcategory-row-11")).toContainText(
    "Hamburguesas",
  );
  await expect(page.getByTestId("category-row-10")).toContainText("Comida");
});
