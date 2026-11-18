"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

type AdminErrorProps = {
  error: unknown;
  retry: () => void;
};

function getDigest(error: unknown) {
  if (error instanceof Error && "digest" in error && typeof error.digest === "string") {
    return error.digest;
  }
  return null;
}

export default function AdminError({ error, retry }: AdminErrorProps) {
  const digest = getDigest(error);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert">
      <EmptyState
        icon={TriangleAlert}
        title="Something went wrong"
        description="We couldn't load this page. Please try again."
        action={
          <div className="flex flex-col items-center gap-3">
            <Button onClick={() => retry()}>Try again</Button>
            {digest && (
              <p className="font-mono text-caption text-muted-foreground">Error ID: {digest}</p>
            )}
          </div>
        }
      />
    </div>
  );
}
