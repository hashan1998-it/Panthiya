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

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Students", icon: Users },
  { href: "/classes", label: "Classes", icon: BookOpen },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/fees", label: "Fees", icon: Wallet },
  { href: "/timetable", label: "Timetable", icon: CalendarDays },
  { href: "/reports", label: "Reports", icon: ChartColumn },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}
