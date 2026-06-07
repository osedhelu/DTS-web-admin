import { test, expect } from "@playwright/test";

import { loginAsMerchant } from "./helpers/auth";

const deliveryOrders = [
  {
    id: 201,
    customer_id: 5,
    store_id: 1,
    driver_id: null,
    status: "created",
    order_type: "delivery",
    total: "31980.00",
    item_count: 2,
    items: [
      {
        id: 1,
        product_id: 10,
        product_name: "Hamburguesa clásica",
        unit_price: "15990.00",
        quantity: 2,
        subtotal: "31980.00",
      },
    ],
    service_address: null,
    customer_notes: null,
    scheduled_at: null,
    service_latitude: null,
    service_longitude: null,
    duration_minutes: null,
  },
  {
    id: 202,
    customer_id: 6,
    store_id: 1,
    driver_id: 42,
    status: "in_preparation",
    order_type: "delivery",
    total: "8500.00",
    item_count: 1,
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
    service_address: null,
    customer_notes: null,
    scheduled_at: null,
    service_latitude: null,
    service_longitude: null,
    duration_minutes: null,
  },
];

test("merchant_orders_list_test", async ({ page, context }) => {
  await loginAsMerchant(context);

  await page.route("**/api/merchant/orders?order_type=delivery", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        count: deliveryOrders.length,
        next: null,
        previous: null,
        results: deliveryOrders,
      }),
    });
  });

  await page.goto("/merchant/orders");

  await expect(
    page.getByRole("heading", { name: "Pedidos entrantes" }),
  ).toBeVisible();
  await expect(page.getByTestId("orders-table")).toBeVisible();
  await expect(page.getByTestId("order-row-201")).toBeVisible();
  await expect(page.getByTestId("order-row-202")).toBeVisible();
  await expect(page.getByTestId("order-status-201")).toHaveText("Nuevo");
  await expect(page.getByTestId("order-status-202")).toHaveText("En preparación");
  await expect(page.getByTestId("order-row-201")).toContainText(
    "2x Hamburguesa clásica",
  );

  await page.getByTestId("orders-filter-created").click();
  await expect(page.getByTestId("order-row-201")).toBeVisible();
  await expect(page.getByTestId("order-row-202")).toHaveCount(0);
  await expect(page.getByTestId("orders-empty")).toHaveCount(0);

  await page.getByTestId("orders-filter-in_preparation").click();
  await expect(page.getByTestId("order-row-202")).toBeVisible();
  await expect(page.getByTestId("order-row-201")).toHaveCount(0);
  await expect(page.getByTestId("order-row-202")).toContainText("#42");
});
