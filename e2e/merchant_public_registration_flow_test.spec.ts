import { test, expect } from "@playwright/test";

test("merchant_public_registration_flow_test", async ({ page, context }) => {
  let registerPayload: Record<string, unknown> | null = null;

  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 4.711, longitude: -74.0721 });

  await page.route("**/api/public/merchant/register", async (route) => {
    registerPayload = route.request().postDataJSON() as Record<string, unknown>;

    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        id: 99,
        email: registerPayload.email,
        store_id: 12,
        detail: "Revisa tu correo para confirmar la cuenta",
      }),
    });
  });

  await page.goto("/registro-comercio");

  await expect(page.getByTestId("registration-wizard-title")).toBeVisible();

  await page.getByTestId("onboarding-first-name").fill("Ana");
  await page.getByTestId("onboarding-last-name").fill("López");
  await page.getByTestId("onboarding-email").fill("ana.nueva@test.com");
  await page.getByTestId("onboarding-password").fill("securepass123");
  await page.getByTestId("onboarding-confirm-password").fill("securepass123");
  await page.getByTestId("onboarding-step1-next").click();

  await expect(page.getByTestId("wizard-step-indicator-2")).toHaveClass(/bg-zinc-900/);

  await page.getByTestId("onboarding-store-name").fill("Tacos Ana");
  await page.getByTestId("onboarding-category-template").selectOption("Comida rápida");
  await page.getByTestId("onboarding-phone").fill("+573001112233");

  await expect(page.getByTestId("onboarding-location-status")).toBeVisible({
    timeout: 15_000,
  });

  await page.getByTestId("onboarding-step2-next").click();

  await expect(page.getByTestId("onboarding-summary")).toContainText("Tacos Ana");
  await expect(page.getByTestId("onboarding-summary")).toContainText("ana.nueva@test.com");
  await expect(page.getByTestId("onboarding-summary")).toContainText("Ubicación:");

  await page.getByTestId("onboarding-accept-terms").check();
  await page.getByTestId("onboarding-submit").click();

  await expect(page).toHaveURL(/\/registro-comercio\/exito/);
  await expect(page.getByTestId("registration-success")).toBeVisible();
  await expect(page.getByTestId("registration-success")).toContainText(
    "ana.nueva@test.com",
  );

  expect(registerPayload).toMatchObject({
    email: "ana.nueva@test.com",
    first_name: "Ana",
    last_name: "López",
    store_name: "Tacos Ana",
    vertical: "FOOD",
    category_template: "Comida rápida",
    phone: "+573001112233",
    latitude: expect.any(Number),
    longitude: expect.any(Number),
  });
});
