import { test, expect } from "@playwright/test";

test("merchant_landing_renders_test", async ({ page }) => {
  await page.goto("/vender");

  await expect(page.getByTestId("merchant-landing-hero")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Vende en DTS y llega a más clientes" }),
  ).toBeVisible();
  await expect(page.getByTestId("merchant-landing-cta")).toBeVisible();
  await expect(page.getByTestId("merchant-landing-cta")).toHaveAttribute(
    "href",
    "/registro-comercio",
  );
});
