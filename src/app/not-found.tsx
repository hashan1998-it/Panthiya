import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("errors.pageNotFound");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8">
      <EmptyState
        icon={FileQuestion}
        titleAs="h1"
        title={t("title")}
        description={t("description")}
        action={
          <Link href="/login" className={buttonVariants()}>
            {t("goHome")}
          </Link>
        }
        className="w-full max-w-md"
      />
    </main>
  );
}
