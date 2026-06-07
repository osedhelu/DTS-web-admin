import { NextRequest, NextResponse } from "next/server";

import { api, ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/server";
import type { CategoryRecord } from "@/features/categories/types";

interface RouteContext {
  params: Promise<{ storeId: string; categoryId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const { storeId, categoryId } = await context.params;
  const body = await request.json();

  try {
    const category = await api<CategoryRecord>(
      `/stores/${storeId}/categories/${categoryId}/`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
      token,
    );

    return NextResponse.json(category);
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
      { detail: "Error al actualizar categoría" },
      { status: 502 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const { storeId, categoryId } = await context.params;

  try {
    await api(
      `/stores/${storeId}/categories/${categoryId}/`,
      { method: "DELETE" },
      token,
    );

    return new NextResponse(null, { status: 204 });
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
      { detail: "Error al eliminar categoría" },
      { status: 502 },
    );
  }
}
