import type { Metadata } from "next";
import SignOutButton from "@/app/(auth)/components/sign-out-button";

export const metadata: Metadata = {
  title: "Dashboard · Panthiya",
};

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-300 px-4 py-8 md:px-6">
      <h1 className="text-display-sm">Dashboard</h1>
      <p className="text-body-sm text-muted-foreground">Coming soon.</p>
      <div className="mt-6">
        <SignOutButton />
      </div>
    </main>
  );
}
