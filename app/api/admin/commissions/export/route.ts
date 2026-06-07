import { NextRequest, NextResponse } from "next/server";

import { getAccessToken } from "@/lib/api/server";
import { decodeJwtPayload } from "@/lib/auth/session";

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function GET(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const claims = decodeJwtPayload(token);
  if (claims?.role !== "super_admin") {
    return NextResponse.json({ detail: "Acceso denegado" }, { status: 403 });
  }

  const days = request.nextUrl.searchParams.get("days") ?? "30";

  try {
    const response = await fetch(
      `${baseUrl}/analytics/commissions/export/?days=${days}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ detail }, { status: response.status });
    }

    const csv = await response.text();
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="commissions_report.csv"',
      },
    });
  } catch {
    return NextResponse.json({ detail: "Error al exportar comisiones" }, { status: 502 });
  }
}
