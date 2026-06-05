import { test, expect } from "@playwright/test";

import { loginAsMerchant } from "./helpers/auth";

test("merchant_layout_renders_test", async ({ page, context }) => {
  await loginAsMerchant(context);

  await page.goto("/merchant");

  await expect(page.getByTestId("merchant-sidebar")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Panel comercio" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Resumen" })).toBeVisible();
  await expect(page.getByText("merchant@test.com")).toBeVisible();
  await expect(
    page.getByText("Gestiona productos, inventario y pedidos desde este panel."),
  ).toBeVisible();
});
