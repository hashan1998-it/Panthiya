import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My classes · Panthiya",
};

export default function MePage() {
  return (
    <main className="mx-auto w-full max-w-300 px-4 py-8 md:px-6">
      <h1 className="text-display-sm">My classes</h1>
      <p className="text-body-sm text-muted-foreground">Coming soon.</p>
    </main>
  );
}
