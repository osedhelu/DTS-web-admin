import { test, expect } from "@playwright/test";

import { loginAsMerchant } from "./helpers/auth";

const createdOrder = {
  id: 301,
  customer_id: 5,
  store_id: 1,
  driver_id: null,
  status: "created",
  order_type: "delivery",
  total: "31980.00",
  item_count: 1,
  items: [
    {
      id: 1,
      product_id: 10,
      product_name: "Hamburguesa clásica",
      unit_price: "31980.00",
      quantity: 1,
      subtotal: "31980.00",
    },
  ],
  service_address: null,
  customer_notes: null,
  scheduled_at: null,
  service_latitude: null,
  service_longitude: null,
  duration_minutes: null,
};

test("merchant_accept_order_action_test", async ({ page, context }) => {
  await loginAsMerchant(context);

  let currentOrder = { ...createdOrder };

  await page.route("**/api/merchant/orders?order_type=delivery", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          count: 1,
          next: null,
          previous: null,
          results: [currentOrder],
        }),
      });
      return;
    }

    await route.continue();
  });

  await page.route("**/api/merchant/orders/301", async (route) => {
    const body = route.request().postDataJSON() as { status: string };
    currentOrder = {
      ...currentOrder,
      status: body.status,
    };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(currentOrder),
    });
  });

  await page.goto("/merchant/orders");

  await expect(page.getByTestId("order-status-301")).toHaveText("Nuevo");
  await expect(page.getByTestId("order-action-301")).toHaveText("Aceptar");

  await page.getByTestId("order-action-301").click();

  await expect(page.getByTestId("orders-success-message")).toContainText(
    'Pedido #301 actualizado a "Aceptado".',
  );
  await expect(page.getByTestId("order-status-301")).toHaveText("Aceptado");
  await expect(page.getByTestId("order-action-301")).toHaveText("En preparación");

  await page.getByTestId("order-action-301").click();
  await expect(page.getByTestId("order-status-301")).toHaveText("En preparación");
  await expect(page.getByTestId("order-action-301")).toHaveText("Preparado");

  await page.getByTestId("order-action-301").click();
  await expect(page.getByTestId("orders-success-message")).toContainText(
    'Pedido #301 actualizado a "Listo para recoger".',
  );
  await expect(page.getByTestId("order-status-301")).toHaveText(
    "Listo para recoger",
  );
  await expect(page.getByTestId("order-action-301")).toHaveCount(0);
});
