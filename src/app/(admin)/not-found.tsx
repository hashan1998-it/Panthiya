import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";

export default function AdminNotFound() {
  const t = useTranslations("errors.notFound");

  return (
    <EmptyState
      icon={FileQuestion}
      titleAs="h1"
      title={t("title")}
      description={t("description")}
      action={
        <Link href="/dashboard" className={buttonVariants()}>
          {t("backToDashboard")}
        </Link>
      }
    />
  );
}
