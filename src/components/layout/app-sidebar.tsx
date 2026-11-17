import Link from "next/link";
import { NavList } from "./nav-list";

export function AppSidebar() {
  return (
    <aside className="sticky top-0 hidden h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:w-16 lg:w-60">
      <div className="flex h-14 shrink-0 items-center justify-center px-3 lg:justify-start lg:px-6">
        <Link
          href="/dashboard"
          className="rounded-md text-title-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span aria-hidden className="lg:hidden">
            P
          </span>
          <span className="sr-only lg:not-sr-only">Panthiya</span>
        </Link>
      </div>
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-2 py-4 lg:px-3">
        <NavList variant="sidebar" />
      </nav>
    </aside>
  );
}
