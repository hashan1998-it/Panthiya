"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS, isActivePath } from "./nav-items";

type NavListProps = {
  variant: "sidebar" | "drawer";
  onNavigate?: () => void;
};

const linkClass =
  "flex h-10 items-center gap-3 rounded-lg px-3 text-body-sm font-medium text-muted-foreground transition-colors duration-150 ease-out outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:bg-secondary aria-[current=page]:text-foreground motion-reduce:transition-none [&_svg]:size-5 [&_svg]:shrink-0";

function NavLinks({ variant, onNavigate, pathname }: NavListProps & { pathname: string | null }) {
  const isSidebar = variant === "sidebar";

  return (
    <ul className="flex flex-col gap-1">
      {ADMIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const current = isActivePath(pathname, href) ? "page" : undefined;

        if (!isSidebar) {
          return (
            <li key={href}>
              <Link href={href} aria-current={current} onClick={onNavigate} className={linkClass}>
                <Icon aria-hidden />
                <span>{label}</span>
              </Link>
            </li>
          );
        }

        return (
          <li key={href}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href={href}
                    aria-current={current}
                    className={cn(linkClass, "justify-center px-0 lg:justify-start lg:px-3")}
                  />
                }
              >
                <Icon aria-hidden />
                <span className="sr-only lg:not-sr-only">{label}</span>
              </TooltipTrigger>
              <TooltipContent side="right" className="lg:hidden">
                {label}
              </TooltipContent>
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
}

function ActiveNavLinks(props: NavListProps) {
  const pathname = usePathname();
  return <NavLinks {...props} pathname={pathname} />;
}

export function NavList(props: NavListProps) {
  return (
    <Suspense fallback={<NavLinks {...props} pathname={null} />}>
      <ActiveNavLinks {...props} />
    </Suspense>
  );
}
