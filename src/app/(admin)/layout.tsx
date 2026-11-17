import { requireRole } from "@/lib/auth/requireRole";

export default async function AdminLayout({ children }: LayoutProps<"/">) {
  await requireRole("admin");

  return children;
}
