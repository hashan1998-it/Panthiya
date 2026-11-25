"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/me", labelKey: "overview" },
  { href: "/me/attendance", labelKey: "attendance" },
  { href: "/me/payments", labelKey: "payments" },
  { href: "/me/settings", labelKey: "settings" },
] as const;

export function PortalNav() {
  const t = useTranslations("me.nav");
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")} className="-mx-4 overflow-x-auto px-4">
      <ul className="flex gap-1">
        {LINKS.map(({ href, labelKey }) => {
          const current = pathname === href;

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center rounded-full px-3 text-body-sm whitespace-nowrap text-muted-foreground hover:text-foreground sm:px-4",
                  current && "bg-muted font-medium text-foreground",
                )}
              >
                {t(labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
