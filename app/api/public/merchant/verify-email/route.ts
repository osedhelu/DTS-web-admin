import { NextRequest, NextResponse } from "next/server";

interface VerifyEmailBody {
  token: string;
}

export async function POST(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { detail: "NEXT_PUBLIC_API_URL no configurada" },
      { status: 500 },
    );
  }

  const body = (await request.json()) as VerifyEmailBody;

  const upstream = await fetch(`${apiUrl}/accounts/verify-email/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: body.token }),
  });

  const data = await upstream.json().catch(() => ({
    detail: "Error al verificar email",
  }));

  return NextResponse.json(data, { status: upstream.status });
}
