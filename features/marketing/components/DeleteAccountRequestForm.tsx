"use client";

import { useState, type FormEvent } from "react";

export interface DeleteAccountFormCopy {
  nameLabel: string;
  emailLabel: string;
  appLabel: string;
  appCustomer: string;
  appDriver: string;
  appMerchant: string;
  confirmLabel: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
  supportHint: string;
}

interface DeleteAccountRequestFormProps {
  copy: DeleteAccountFormCopy;
  supportEmail: string;
}

export function DeleteAccountRequestForm({
  copy,
  supportEmail,
}: DeleteAccountRequestFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [app, setApp] = useState<"customer" | "driver" | "merchant">("customer");
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!confirmed) return;

    setStatus("loading");
    setErrorDetail(null);

    try {
      const response = await fetch("/api/public/delete-account-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          app,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          detail?: string;
        } | null;
        throw new Error(data?.detail || copy.error);
      }

      setStatus("success");
      setName("");
      setEmail("");
      setConfirmed(false);
    } catch (err) {
      setStatus("error");
      setErrorDetail(err instanceof Error ? err.message : copy.error);
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-200"
      >
        <p>{copy.success}</p>
        <p className="mt-2 text-zinc-400">
          {copy.supportHint.replace("{email}", supportEmail)}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block text-sm text-zinc-300">
        {copy.nameLabel}
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-emerald-500"
        />
      </label>

      <label className="block text-sm text-zinc-300">
        {copy.emailLabel}
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-emerald-500"
        />
      </label>

      <label className="block text-sm text-zinc-300">
        {copy.appLabel}
        <select
          value={app}
          onChange={(e) =>
            setApp(e.target.value as "customer" | "driver" | "merchant")
          }
          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-emerald-500"
        >
          <option value="customer">{copy.appCustomer}</option>
          <option value="driver">{copy.appDriver}</option>
          <option value="merchant">{copy.appMerchant}</option>
        </select>
      </label>

      <label className="flex items-start gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-1 accent-emerald-500"
          required
        />
        <span>{copy.confirmLabel}</span>
      </label>

      {status === "error" ? (
        <p role="alert" className="text-sm text-red-400">
          {errorDetail ?? copy.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading" || !confirmed}
        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50"
      >
        {status === "loading" ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
