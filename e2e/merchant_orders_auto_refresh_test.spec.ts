import { test, expect } from "@playwright/test";

import { loginAsMerchant } from "./helpers/auth";

const initialOrder = {
  id: 401,
  customer_id: 5,
  store_id: 1,
  driver_id: null,
  status: "created",
  order_type: "delivery",
  total: "15990.00",
  item_count: 1,
  items: [
    {
      id: 1,
      product_id: 10,
      product_name: "Hamburguesa clásica",
      unit_price: "15990.00",
      quantity: 1,
      subtotal: "15990.00",
    },
  ],
  service_address: null,
  customer_notes: null,
  scheduled_at: null,
  service_latitude: null,
  service_longitude: null,
  duration_minutes: null,
};

const incomingOrder = {
  ...initialOrder,
  id: 402,
  status: "created",
  total: "8500.00",
  items: [
    {
      id: 2,
      product_id: 11,
      product_name: "Papas medianas",
      unit_price: "8500.00",
      quantity: 1,
      subtotal: "8500.00",
    },
  ],
};

test("merchant_orders_auto_refresh_test", async ({ page, context }) => {
  await loginAsMerchant(context);
  await page.clock.install();

  let requestCount = 0;

  await page.route("**/api/merchant/orders?order_type=delivery", async (route) => {
    requestCount += 1;
    const results =
      requestCount === 1 ? [initialOrder] : [initialOrder, incomingOrder];

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        count: results.length,
        next: null,
        previous: null,
        results,
      }),
    });
  });

  await page.goto("/merchant/orders");

  await expect(page.getByTestId("orders-auto-refresh")).toContainText(
    "Actualización automática cada 10 segundos",
  );
  await expect(page.getByTestId("order-row-401")).toBeVisible();
  await expect(page.getByTestId("order-row-402")).toHaveCount(0);
  await expect(page.getByTestId("orders-refresh-count")).toHaveText("1");

  await page.clock.fastForward(10_000);

  await expect(page.getByTestId("order-row-402")).toBeVisible();
  await expect(page.getByTestId("orders-refresh-count")).toHaveText("2");
  expect(requestCount).toBeGreaterThanOrEqual(2);
});
