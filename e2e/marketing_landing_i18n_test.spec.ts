import { test, expect } from "@playwright/test";

test("marketing_licenses_page_test", async ({ page }) => {
  await page.goto("/es/licenses");

  await expect(page.getByRole("heading", { name: "Licencias de software" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Next.js" })).toBeVisible();
});

test("marketing_root_redirects_to_locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/(es|en)$/);
  await expect(page.getByTestId("marketing-hero")).toBeVisible();
});
