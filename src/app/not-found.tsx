import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8">
      <EmptyState
        icon={FileQuestion}
        titleAs="h1"
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        action={
          <Link href="/login" className={buttonVariants()}>
            Go to home page
          </Link>
        }
        className="w-full max-w-md"
      />
    </main>
  );
}
