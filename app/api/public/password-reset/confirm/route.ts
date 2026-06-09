import { NextRequest, NextResponse } from "next/server";

interface PasswordResetConfirmBody {
  token: string;
  password: string;
}

export async function POST(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { detail: "NEXT_PUBLIC_API_URL no configurada" },
      { status: 500 },
    );
  }

  const body = (await request.json()) as PasswordResetConfirmBody;

  const upstream = await fetch(`${apiUrl}/accounts/password-reset/confirm/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: body.token, password: body.password }),
  });

  const data = await upstream.json().catch(() => ({
    detail: "Error al restablecer contraseña",
  }));

  return NextResponse.json(data, { status: upstream.status });
}
