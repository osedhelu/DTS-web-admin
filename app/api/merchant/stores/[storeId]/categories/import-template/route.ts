import { NextRequest, NextResponse } from "next/server";

import { api, ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/server";

interface RouteContext {
  params: Promise<{ storeId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const { storeId } = await context.params;
  const body = await request.json();

  try {
    const result = await api<{
      template_name: string;
      categories_created: number;
      root_category_id: number;
    }>(
      `/stores/${storeId}/categories/import-template/`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      token,
    );

    return NextResponse.json(result, { status: 201 });
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
      { detail: "Error al importar plantilla" },
      { status: 502 },
    );
  }
}
