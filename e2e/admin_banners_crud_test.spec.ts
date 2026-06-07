import { test, expect } from "@playwright/test";

import { loginAsSuperAdmin } from "./helpers/auth";

test("admin_banners_crud_test", async ({ page, context }) => {
  await loginAsSuperAdmin(context);

  let created = false;
  let deleted = false;

  await page.route("**/api/admin/banners", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ count: 0, next: null, previous: null, results: [] }),
      });
      return;
    }

    const body = route.request().postDataJSON() as { title: string };
    created = true;
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        id: 12,
        title: body.title,
        image_url: body.image_url,
        link_url: body.link_url ?? "",
        is_active: true,
        sort_order: 0,
      }),
    });
  });

  await page.route("**/api/admin/banners/12", async (route) => {
    deleted = true;
    await route.fulfill({ status: 204, body: "" });
  });

  await page.goto("/admin/banners");

  await expect(page.getByTestId("banners-manager")).toBeVisible();
  await page.getByTestId("banner-title").fill("Promo verano");
  await page.getByTestId("banner-image-url").fill("https://cdn.example.com/banner.jpg");
  await page.getByTestId("banner-submit").click();

  await expect(page.getByTestId("banners-success-message")).toContainText(
    'Banner "Promo verano" creado correctamente.',
  );
  await expect(page.getByTestId("banner-row-12")).toBeVisible();
  expect(created).toBe(true);

  await page.getByTestId("banner-delete-12").click();
  await expect(page.getByTestId("banners-success-message")).toContainText(
    "Banner eliminado correctamente.",
  );
  expect(deleted).toBe(true);
});
