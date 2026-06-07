import { test, expect } from "@playwright/test";

import { loginAsMerchant } from "./helpers/auth";

const createdOrder = {
  id: 101,
  customer_id: 5,
  store_id: 2,
  driver_id: null,
  status: "created",
  order_type: "service",
  total: "85000.00",
  item_count: 1,
  items: [
    {
      id: 1,
      product_id: 77,
      product_name: "Limpieza profunda apartamento",
      unit_price: "85000.00",
      quantity: 1,
      subtotal: "85000.00",
    },
  ],
  service_address: "Calle 100 #15-20, Bogotá",
  customer_notes: "Timbre roto, llamar al llegar",
  scheduled_at: null,
  service_latitude: 4.711,
  service_longitude: -74.0721,
  duration_minutes: 180,
};

test("merchant_service_order_dashboard_test", async ({ page, context }) => {
  await loginAsMerchant(context);

  let currentOrder = { ...createdOrder };

  await page.route("**/api/merchant/orders?order_type=service", async (route) => {
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

  await page.route("**/api/merchant/orders/101", async (route) => {
    const body = route.request().postDataJSON() as { status: string };
    currentOrder = {
      ...currentOrder,
      status: body.status,
      scheduled_at:
        body.status === "scheduled"
          ? "2026-06-10T15:00:00.000Z"
          : currentOrder.scheduled_at,
    };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(currentOrder),
    });
  });

  await page.goto("/merchant/service-orders");

  await expect(
    page.getByRole("heading", { name: "Pedidos de servicio" }),
  ).toBeVisible();
  await expect(page.getByTestId("service-order-101")).toBeVisible();
  await expect(page.getByTestId("service-order-status-101")).toHaveText("Nuevo");
  await expect(page.getByText("Calle 100 #15-20, Bogotá")).toBeVisible();
  await expect(page.getByText("Timbre roto, llamar al llegar")).toBeVisible();

  await page.getByTestId("service-order-action-101").click();
  await expect(page.getByTestId("service-orders-success-message")).toContainText(
    'Pedido #101 actualizado a "Aceptado".',
  );
  await expect(page.getByTestId("service-order-status-101")).toHaveText("Aceptado");

  await page.getByTestId("service-order-action-101").click();
  await expect(page.getByTestId("service-order-status-101")).toHaveText("Agendado");
  await expect(page.getByTestId("service-order-action-101")).toHaveText(
    "Marcar en camino",
  );

  await page.getByTestId("service-order-action-101").click();
  await expect(page.getByTestId("service-order-status-101")).toHaveText(
    "Proveedor en camino",
  );

  await page.getByTestId("service-order-action-101").click();
  await expect(page.getByTestId("service-order-status-101")).toHaveText("En curso");

  await page.getByTestId("service-order-action-101").click();
  await expect(page.getByTestId("service-order-status-101")).toHaveText(
    "Completado",
  );
  await expect(page.getByTestId("service-order-action-101")).toHaveCount(0);
});
