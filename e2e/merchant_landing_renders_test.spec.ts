import { test, expect } from "@playwright/test";

test("merchant_landing_renders_test", async ({ page }) => {
  await page.goto("/es");

  await expect(page.getByTestId("marketing-hero")).toBeVisible();
  await expect(page.getByTestId("marketing-merchants")).toBeVisible();
  await expect(page.getByTestId("merchant-landing-cta")).toBeVisible();
  await expect(page.getByTestId("merchant-landing-cta")).toHaveAttribute(
    "href",
    "/registro-comercio",
  );
});

test("marketing_landing_english_renders_test", async ({ page }) => {
  await page.goto("/en");

  await expect(page.getByTestId("marketing-hero")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your business, your products, delivered" }),
  ).toBeVisible();
  await expect(page.getByTestId("locale-switcher")).toBeVisible();
});

test("marketing_locale_switch_test", async ({ page }) => {
  await page.goto("/es");
  await page.getByTestId("locale-en").click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(
    page.getByRole("heading", { name: "Your business, your products, delivered" }),
  ).toBeVisible();
});
