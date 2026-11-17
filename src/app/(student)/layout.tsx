import { requireRole } from "@/lib/auth/requireRole";

export default async function StudentLayout({ children }: LayoutProps<"/">) {
  await requireRole("student");

  return children;
}
