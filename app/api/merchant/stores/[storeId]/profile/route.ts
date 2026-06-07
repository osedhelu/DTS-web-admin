import { NextRequest, NextResponse } from "next/server";

import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/server";
import type { Store } from "@/features/stores/types";

interface RouteContext {
  params: Promise<{ storeId: string }>;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

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
    const response = await fetch(`${baseUrl}/stores/${storeId}/profile/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const message = await response.text();
      throw new ApiError(response.status, message);
    }

    const profile = (await response.json()) as Store;
    return NextResponse.json(profile);
  } catch (error) {
    return parseApiError(error, "Error al cargar perfil de tienda");
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const { storeId } = await context.params;
  const contentType = request.headers.get("content-type") ?? "";

  try {
    const response = contentType.includes("multipart/form-data")
      ? await fetch(`${baseUrl}/stores/${storeId}/profile/`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: await request.formData(),
        })
      : await fetch(`${baseUrl}/stores/${storeId}/profile/`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(await request.json()),
        });

    if (!response.ok) {
      const message = await response.text();
      throw new ApiError(response.status, message);
    }

    const profile = (await response.json()) as Store;
    return NextResponse.json(profile);
  } catch (error) {
    return parseApiError(error, "Error al actualizar perfil de tienda");
  }
}
