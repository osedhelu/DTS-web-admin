import { NextRequest, NextResponse } from "next/server";

import { api, ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/server";
import type { DeliveryOrder } from "@/features/orders/types";

interface RouteContext {
  params: Promise<{ orderId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const { orderId } = await context.params;
  const body = await request.json();

  try {
    const order = await api<DeliveryOrder>(
      `/orders/${orderId}/`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
      token,
    );

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof ApiError) {
      let detail = error.message;
      try {
        const parsed = JSON.parse(error.message) as { detail?: string };
        detail = parsed.detail ?? detail;
      } catch {
        // keep raw message
      }

      return NextResponse.json({ detail }, { status: error.status });
    }

    return NextResponse.json(
      { detail: "Error al actualizar pedido" },
      { status: 502 },
    );
  }
}
