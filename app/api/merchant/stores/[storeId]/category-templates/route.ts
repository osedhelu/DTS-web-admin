import { NextRequest, NextResponse } from "next/server";

import { api, ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/server";
import type { CategoryTemplateListResponse } from "@/features/categories/types";

interface RouteContext {
  params: Promise<{ storeId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const { storeId } = await context.params;
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const suffix = query ? `?q=${encodeURIComponent(query)}` : "";

  try {
    const payload = await api<CategoryTemplateListResponse>(
      `/stores/${storeId}/category-templates${suffix}`,
      undefined,
      token,
    );

    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { detail: "Error al cargar plantillas de categorías" },
      { status: 502 },
    );
  }
}
