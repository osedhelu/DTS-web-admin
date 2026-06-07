import { NextRequest, NextResponse } from "next/server";

import { api, ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/server";
import type { MerchantDashboardMetrics } from "@/features/merchant-dashboard/types";

interface RouteContext {
  params: Promise<{ storeId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const { storeId } = await context.params;
  const days = request.nextUrl.searchParams.get("days") ?? "30";
  const path = `/stores/${storeId}/merchant-dashboard/?days=${days}`;

  try {
    const data = await api<MerchantDashboardMetrics>(path, undefined, token);
    return NextResponse.json(data);
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
      { detail: "Error al cargar dashboard merchant" },
      { status: 502 },
    );
  }
}
