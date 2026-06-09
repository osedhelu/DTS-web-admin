import { TagIcon } from "@/components/ui/icons";

interface DiscountBadgeProps {
  label: string;
  className?: string;
  testId?: string;
}

export function DiscountBadge({
  label,
  className = "",
  testId,
}: DiscountBadgeProps) {
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
