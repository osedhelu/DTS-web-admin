import { NextResponse } from "next/server";

import { api, ApiError } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/types";
import { getAccessToken } from "@/lib/api/server";
import type { Store } from "@/features/stores/types";

export async function GET() {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  try {
    const data = await api<PaginatedResponse<Store>>("/stores/mine/", undefined, token);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Error al cargar tiendas";
    return NextResponse.json({ detail: message }, { status: 502 });
  }
}
