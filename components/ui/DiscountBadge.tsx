import { TagIcon } from "@/components/ui/icons";

interface DiscountBadgeProps {
  label: string;
  className?: string;
  testId?: string;
  /** inline: junto al contenido · overlay: esquina superpuesta (compacto) */
  variant?: "inline" | "overlay";
}

export function DiscountBadge({
  label,
  className = "",
  testId,
  variant = "inline",
}: DiscountBadgeProps) {
  if (variant === "overlay") {
    return (
      <span
        data-testid={testId}
        title={`Descuento: ${label}`}
        className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-violet-500 px-1 py-0.5 text-[9px] font-bold leading-none text-white shadow-md ring-2 ring-white ${className}`}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      data-testid={testId}
      title={`Descuento: ${label}`}
      className={`inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-200 ${className}`}
    >
      <TagIcon className="h-3 w-3 shrink-0" />
      {label}
    </span>
  );
}
