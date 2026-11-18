import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Dashboard · Panthiya",
};

export default function DashboardPage() {
  return <PageHeader title="Dashboard" description="Coming soon." />;
}
