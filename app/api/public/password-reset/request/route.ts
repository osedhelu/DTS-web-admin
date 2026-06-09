import { NextRequest, NextResponse } from "next/server";

interface PasswordResetRequestBody {
  email: string;
}

export async function POST(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { detail: "NEXT_PUBLIC_API_URL no configurada" },
      { status: 500 },
    );
  }

  const body = (await request.json()) as PasswordResetRequestBody;

  const upstream = await fetch(`${apiUrl}/accounts/password-reset/request/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.email }),
  });

  const data = await upstream.json().catch(() => ({
    detail: "Error al solicitar recuperación de contraseña",
  }));

  return NextResponse.json(data, { status: upstream.status });
}
