import { NextRequest, NextResponse } from "next/server";

import type { MerchantRegisterPayload } from "@/features/onboarding/types";

export async function POST(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { detail: "NEXT_PUBLIC_API_URL no configurada" },
      { status: 500 },
    );
  }

  const body = (await request.json()) as MerchantRegisterPayload;

  const upstream = await fetch(`${apiUrl}/accounts/merchant/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await upstream.json().catch(() => ({
    detail: "Error al registrar comercio",
  }));

  return NextResponse.json(data, { status: upstream.status });
}
