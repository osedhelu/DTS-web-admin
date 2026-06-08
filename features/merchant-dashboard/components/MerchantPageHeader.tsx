interface MerchantPageHeaderProps {
  title: string;
  description: string;
  badge?: string;
}

export function MerchantPageHeader({ title, description, badge }: MerchantPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        {badge ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {badge}
          </p>
        ) : null}
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-600">{description}</p>
      </div>
    </div>
  );
}
