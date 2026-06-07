import { test, expect } from "@playwright/test";

import { loginAsMerchant } from "./helpers/auth";

const initialProfile = {
  id: 1,
  name: "Restaurante Central",
  owner_id: 10,
  status: "closed",
  vertical: "FOOD",
  latitude: 4.711,
  longitude: -74.0721,
  address: "Calle 100",
  description: "Comida rápida y delivery",
  phone: "+57 300 111 2222",
  logo_url: "",
  is_open: false,
};

test("merchant_update_store_profile_test", async ({ page, context }) => {
  await loginAsMerchant(context);

  let updated = false;

  await page.route("**/api/merchant/stores", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ results: [initialProfile] }),
    });
  });

  await page.route("**/api/merchant/stores/1/profile", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(initialProfile),
      });
      return;
    }

    const body = route.request().postDataJSON() as {
      name?: string;
      description?: string;
    };
    updated = true;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...initialProfile,
        name: body.name ?? initialProfile.name,
        description: body.description ?? initialProfile.description,
      }),
    });
  });

  await page.goto("/merchant/settings");

  await expect(page.getByTestId("store-settings-manager")).toBeVisible();
  await page.getByTestId("store-settings-name").fill("Restaurante Norte");
  await page
    .getByTestId("store-settings-description")
    .fill("Especialidad en comida saludable");
  await page.getByTestId("store-settings-submit").click();

  await expect(page.getByTestId("store-settings-success-message")).toContainText(
    "Configuración de la tienda guardada.",
  );
  expect(updated).toBe(true);
});
