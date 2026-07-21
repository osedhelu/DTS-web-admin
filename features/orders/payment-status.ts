export type PaymentStatus = "pending" | "paid" | "cash_on_delivery" | "failed";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  cash_on_delivery: "Contra entrega",
  failed: "Fallido",
};

export const PAYMENT_STATUS_BADGE_CLASSES: Record<PaymentStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  cash_on_delivery: "bg-sky-100 text-sky-800",
  failed: "bg-red-100 text-red-800",
};

export function formatPaymentStatus(status: string | null | undefined): string {
  if (!status) return "—";
  return PAYMENT_STATUS_LABELS[status as PaymentStatus] ?? status;
}

export function paymentStatusBadgeClass(status: string | null | undefined): string {
  if (!status) return "bg-zinc-100 text-zinc-600";
  return (
    PAYMENT_STATUS_BADGE_CLASSES[status as PaymentStatus] ??
    "bg-zinc-100 text-zinc-600"
  );
}
