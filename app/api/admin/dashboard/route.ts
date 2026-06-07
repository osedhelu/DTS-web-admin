import { NextResponse } from "next/server";

import { api, ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/server";
import type { AdminDashboardData } from "@/features/admin/types";
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
    const data = await api<AdminDashboardData>(
      "/accounts/admin/dashboard/",
      undefined,
      token,
    );

    return NextResponse.json(data);
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
      { detail: "Error al cargar el panel administrador" },
      { status: 502 },
    );
  }
}
