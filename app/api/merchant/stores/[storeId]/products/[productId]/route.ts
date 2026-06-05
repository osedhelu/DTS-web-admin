import { NextRequest, NextResponse } from "next/server";

import { api, ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/server";
import type { Product } from "@/features/products/types";

interface RouteContext {
  params: Promise<{ storeId: string; productId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const { storeId, productId } = await context.params;
  const body = await request.json();

  try {
    const product = await api<Product>(
      `/stores/${storeId}/products/${productId}/`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
      token,
    );

    return NextResponse.json(product);
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
      { detail: "Error al actualizar producto" },
      { status: 502 },
    );
  }
}
