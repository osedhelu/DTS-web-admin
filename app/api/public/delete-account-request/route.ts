import { NextRequest, NextResponse } from "next/server";

const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL?.trim() || "soporte@dtsdrop.com";

interface DeleteAccountBody {
  name?: string;
  email?: string;
  app?: string;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  let body: DeleteAccountBody;
  try {
    body = (await request.json()) as DeleteAccountBody;
  } catch {
    return NextResponse.json({ detail: "JSON inválido" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const app = (body.app ?? "").trim().toLowerCase();

  if (!name || name.length > 150) {
    return NextResponse.json({ detail: "Nombre inválido" }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ detail: "Email inválido" }, { status: 400 });
  }
  if (!["customer", "driver", "merchant"].includes(app)) {
    return NextResponse.json({ detail: "App/rol inválido" }, { status: 400 });
  }

  const payload = {
    type: "delete_account_request",
    name,
    email,
    app,
    supportEmail: SUPPORT_EMAIL,
    receivedAt: new Date().toISOString(),
  };

  // Registro operativo (Railway / Vercel logs). Sin SMTP en web-admin: el equipo
  // procesa desde logs o correo entrante a SUPPORT_EMAIL.
  console.info("[delete-account-request]", JSON.stringify(payload));

  const webhook = process.env.SUPPORT_WEBHOOK_URL?.trim();
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("[delete-account-request] webhook failed", error);
    }
  }

  return NextResponse.json(
    {
      detail: "ok",
      supportEmail: SUPPORT_EMAIL,
    },
    { status: 200 },
  );
}
