import { NextResponse } from "next/server";

import { api, ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/server";
import type { AdminOperationsMapData } from "@/features/admin-map/types";
import { decodeJwtPayload } from "@/lib/auth/session";

export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const claims = decodeJwtPayload(token);
  if (claims?.role !== "super_admin") {
    return NextResponse.json({ detail: "Acceso denegado" }, { status: 403 });
  }

  try {
    const data = await api<AdminOperationsMapData>(
      "/accounts/admin/map/",
      undefined,
      token,
    );
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "Error al cargar mapa operativo" }, { status: 502 });
  }
}
