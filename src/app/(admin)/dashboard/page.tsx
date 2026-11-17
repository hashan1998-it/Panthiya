import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard · Panthiya",
};

export default function DashboardPage() {
  return (
    <>
      <h1 className="text-display-sm">Dashboard</h1>
      <p className="text-body-sm text-muted-foreground">Coming soon.</p>
    </>
  );
}
