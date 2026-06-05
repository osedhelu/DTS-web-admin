import { NextRequest, NextResponse } from "next/server";

import { api } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/types";
import { getAccessToken } from "@/lib/api/server";
import type { Product } from "@/features/products/types";

interface RouteContext {
  params: Promise<{ storeId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const { storeId } = await context.params;
  const query = request.nextUrl.searchParams.toString();
  const path = query
    ? `/stores/${storeId}/products/?${query}`
    : `/stores/${storeId}/products/`;

  try {
    const data = await api<PaginatedResponse<Product>>(path, undefined, token);
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cargar productos";
    return NextResponse.json({ detail: message }, { status: 502 });
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
    const product = await api<Product>(
      `/stores/${storeId}/products/`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      token,
    );

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear producto";
    return NextResponse.json({ detail: message }, { status: 400 });
  }
}
