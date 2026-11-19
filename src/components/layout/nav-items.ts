import {
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ChartColumn,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Messages } from "next-intl";

export type NavItem = {
  href: string;
  // A key in the "nav" messages. This file is not a component, so it can't call `t()`.
  labelKey: keyof Messages["nav"];
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/students", labelKey: "students", icon: Users },
  { href: "/classes", labelKey: "classes", icon: BookOpen },
  { href: "/attendance", labelKey: "attendance", icon: CalendarCheck },
  { href: "/fees", labelKey: "fees", icon: Wallet },
  { href: "/timetable", labelKey: "timetable", icon: CalendarDays },
  { href: "/reports", labelKey: "reports", icon: ChartColumn },
  { href: "/settings", labelKey: "settings", icon: Settings },
];

export function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}
