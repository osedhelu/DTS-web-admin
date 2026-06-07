import Link from "next/link";

export interface NavItem {
  href: string;
  label: string;
}

interface AppShellProps {
  title: string;
  sidebarTestId: string;
  navItems: NavItem[];
  userEmail?: string;
  headerSlot?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({
  title,
  sidebarTestId,
  navItems,
  userEmail,
  headerSlot,
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900">
      <aside
        data-testid={sidebarTestId}
        className="flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-white"
      >
        <div className="border-b border-zinc-200 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            DTS
          </p>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {userEmail ? (
          <div className="border-t border-zinc-200 px-6 py-4 text-sm text-zinc-600">
            {userEmail}
          </div>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {headerSlot}
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
