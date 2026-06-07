import { NextRequest, NextResponse } from "next/server";

import { api, ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/server";
import type { CommissionsReport } from "@/features/commissions/types";
import { decodeJwtPayload } from "@/lib/auth/session";

function unauthorized() {
  return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ detail: "Acceso denegado" }, { status: 403 });
}

export async function GET(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return unauthorized();
  }

  const claims = decodeJwtPayload(token);
  if (claims?.role !== "super_admin") {
    return forbidden();
  }

  const days = request.nextUrl.searchParams.get("days") ?? "30";

  try {
    const data = await api<CommissionsReport>(
      `/analytics/commissions/?days=${days}`,
      undefined,
      token,
    );
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "Error al cargar comisiones" }, { status: 502 });
  }
}
