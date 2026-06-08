import Link from "next/link";

interface CategoryFormScreenProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}

export function CategoryFormScreen({
  title,
  subtitle,
  backHref = "/merchant/categories",
  backLabel = "← Volver a categorías",
  children,
}: CategoryFormScreenProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {subtitle ? (
            <p className="text-sm text-zinc-500">{subtitle}</p>
          ) : null}
          <h2 className="text-2xl font-semibold text-zinc-900">{title}</h2>
        </div>
        <Link
          href={backHref}
          data-testid="category-form-back"
          className="inline-flex shrink-0 items-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          {backLabel}
        </Link>
      </div>
      {children}
    </div>
  );
}
