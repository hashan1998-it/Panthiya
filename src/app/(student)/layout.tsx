import { RoleGate } from "@/components/role-gate";

export default function StudentLayout({ children }: LayoutProps<"/">) {
  return <RoleGate role="student">{children}</RoleGate>;
}
