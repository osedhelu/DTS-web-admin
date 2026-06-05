import { NextRequest, NextResponse } from "next/server";

import { api, ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/server";
import type {
  CategoryRecord,
  CategoryTreeNode,
} from "@/features/categories/types";

interface RouteContext {
  params: Promise<{ storeId: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const { storeId } = await context.params;

  try {
    const tree = await api<CategoryTreeNode[]>(
      `/stores/${storeId}/categories/`,
      undefined,
      token,
    );

    return NextResponse.json(tree);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cargar categorías";
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
    const category = await api<CategoryRecord>(
      `/stores/${storeId}/categories/`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      token,
    );

    return NextResponse.json(category, { status: 201 });
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
      { detail: "Error al crear categoría" },
      { status: 502 },
    );
  }
}
