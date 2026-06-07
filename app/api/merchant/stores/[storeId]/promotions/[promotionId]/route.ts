import { NextRequest, NextResponse } from "next/server";

import { api, ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/server";
import type { StorePromotion } from "@/features/promotions/types";

interface RouteContext {
  params: Promise<{ storeId: string; promotionId: string }>;
}

function parseApiError(error: unknown, fallback: string) {
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

  return NextResponse.json({ detail: fallback }, { status: 502 });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const { storeId, promotionId } = await context.params;
  const body = await request.json();

  try {
    const promotion = await api<StorePromotion>(
      `/stores/${storeId}/promotions/${promotionId}/`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
      token,
    );
    return NextResponse.json(promotion);
  } catch (error) {
    return parseApiError(error, "Error al actualizar promoción");
  }
}
