"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type VerifyState = "loading" | "success" | "error";

function ConfirmEmailError({ message }: { message: string }) {
  return (
    <>
      <div
        data-testid="confirm-email-error"
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700"
      >
        !
      </div>
      <h1 className="mt-4 text-xl font-semibold text-zinc-900">
        No se pudo confirmar
      </h1>
      <p className="mt-2 text-sm text-red-700">{message}</p>
      <Link
        href="/login"
        className="mt-6 inline-flex text-sm font-medium text-zinc-900 underline"
      >
        Ir a iniciar sesión
      </Link>
    </>
  );
}

function VerifyEmailWithToken({ token }: { token: string }) {
  const router = useRouter();
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      try {
        const response = await fetch("/api/public/merchant/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = (await response.json()) as { detail?: string };

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setState("error");
          setMessage(data.detail ?? "No se pudo confirmar el email.");
          return;
        }

        setState("success");
        setMessage(data.detail ?? "Email verificado correctamente.");

        window.setTimeout(() => {
          router.replace("/login?verified=1");
        }, 2000);
      } catch {
        if (!cancelled) {
          setState("error");
          setMessage("Error de conexión al confirmar el email.");
        }
      }
    }

    void verify();

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  if (state === "loading") {
    return (
      <>
        <h1 className="text-xl font-semibold text-zinc-900">
          Confirmando tu correo…
        </h1>
        <p className="mt-2 text-sm text-zinc-600">Espera un momento.</p>
      </>
    );
  }

  if (state === "success") {
    return (
      <>
        <div
          data-testid="confirm-email-success"
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
        >
          ✓
        </div>
        <h1 className="mt-4 text-xl font-semibold text-zinc-900">
          ¡Correo confirmado!
        </h1>
        <p className="mt-2 text-sm text-zinc-600">{message}</p>
        <p className="mt-2 text-sm text-zinc-500">
          Redirigiendo al inicio de sesión…
        </p>
      </>
    );
  }

  return <ConfirmEmailError message={message} />;
}

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div
      data-testid="confirm-email-panel"
      className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm"
    >
      {!token ? (
        <ConfirmEmailError message="El enlace de confirmación no es válido." />
      ) : (
        <VerifyEmailWithToken token={token} />
      )}
    </div>
  );
}

export function ConfirmEmailPanel() {
  return (
    <Suspense
      fallback={
        <div className="text-center text-sm text-zinc-500">Cargando…</div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
