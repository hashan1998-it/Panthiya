import { RoleGate } from "@/components/role-gate";

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return <RoleGate role="admin">{children}</RoleGate>;
}
