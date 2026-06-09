import { NextRequest, NextResponse } from "next/server";

import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/server";
import type { ProductImage } from "@/features/products/types";

interface RouteContext {
  params: Promise<{ storeId: string; productId: string; imageId: string }>;
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

export async function PATCH(request: NextRequest, context: RouteContext) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const { storeId, productId, imageId } = await context.params;
  const formData = await request.formData();

  try {
    const response = await fetch(
      `${baseUrl}/stores/${storeId}/products/${productId}/images/${imageId}/`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      },
    );

    if (!response.ok) {
      const message = await response.text();
      throw new ApiError(response.status, message);
    }

    const image = (await response.json()) as ProductImage;
    return NextResponse.json(image);
  } catch (error) {
    return parseApiError(error, "Error al actualizar imagen");
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const { storeId, productId, imageId } = await context.params;

  try {
    const response = await fetch(
      `${baseUrl}/stores/${storeId}/products/${productId}/images/${imageId}/`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!response.ok) {
      const message = await response.text();
      throw new ApiError(response.status, message);
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return parseApiError(error, "Error al eliminar imagen");
  }
}
