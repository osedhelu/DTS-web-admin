import { test, expect } from "@playwright/test";

const TEST_TOKEN = "00000000-0000-0000-0000-000000000099";

test("merchant_email_confirmation_flow_test", async ({ page }) => {
  let verifyBody: { token?: string } | null = null;

  await page.route("**/api/public/merchant/verify-email", async (route) => {
    verifyBody = route.request().postDataJSON() as { token?: string };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ detail: "Email verificado correctamente" }),
    });
  });

  await page.goto(`/confirmar-email?token=${TEST_TOKEN}`);

  await expect(page.getByTestId("confirm-email-success")).toBeVisible({
    timeout: 10_000,
  });
  expect(verifyBody?.token).toBe(TEST_TOKEN);

  await expect(page).toHaveURL(/\/login\?verified=1/, { timeout: 10_000 });
  await expect(page.getByTestId("login-verified-banner")).toBeVisible();
});
