import { NextRequest, NextResponse } from "next/server";

import { api } from "@/lib/api/client";
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
    const message =
      error instanceof Error ? error.message : "Error al actualizar producto";
    return NextResponse.json({ detail: message }, { status: 400 });
  }
}
