import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <EmptyState
      icon={FileQuestion}
      titleAs="h1"
      title="Not found"
      description="We couldn't find what you're looking for. It may have been removed."
      action={
        <Link href="/dashboard" className={buttonVariants()}>
          Back to dashboard
        </Link>
      }
    />
  );
}
