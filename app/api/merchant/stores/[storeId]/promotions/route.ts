import { NextRequest, NextResponse } from "next/server";

import { api, ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/server";
import type { StorePromotion } from "@/features/promotions/types";
import type { PaginatedResponse } from "@/lib/api/types";

interface RouteContext {
  params: Promise<{ storeId: string }>;
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

export async function GET(_request: NextRequest, context: RouteContext) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const { storeId } = await context.params;

  try {
    const data = await api<PaginatedResponse<StorePromotion>>(
      `/stores/${storeId}/promotions/`,
      undefined,
      token,
    );
    return NextResponse.json(data);
  } catch (error) {
    return parseApiError(error, "Error al cargar promociones");
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const { storeId } = await context.params;
  const body = await request.json();

  try {
    const promotion = await api<StorePromotion>(
      `/stores/${storeId}/promotions/`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      token,
    );
    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    return parseApiError(error, "Error al crear promoción");
  }
}
