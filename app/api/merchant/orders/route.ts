import { NextRequest, NextResponse } from "next/server";

import { api } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/types";
import { getAccessToken } from "@/lib/api/server";

interface MerchantOrder {
  id: number;
  order_type: "delivery" | "service";
}

export async function GET(request: NextRequest) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const orderType = searchParams.get("order_type");
  const backendQuery = new URLSearchParams();

  const status = searchParams.get("status");
  if (status) {
    backendQuery.set("status", status);
  }

  const query = backendQuery.toString();
  const path = query ? `/orders/?${query}` : "/orders/";

  try {
    const data = await api<PaginatedResponse<MerchantOrder>>(path, undefined, token);
    let results = data.results;

    if (orderType === "service") {
      results = results.filter((order) => order.order_type === "service");
    } else if (orderType === "delivery") {
      results = results.filter((order) => order.order_type === "delivery");
    }

    return NextResponse.json({
      ...data,
      count: results.length,
      results,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cargar pedidos";
    return NextResponse.json({ detail: message }, { status: 502 });
  }
}
