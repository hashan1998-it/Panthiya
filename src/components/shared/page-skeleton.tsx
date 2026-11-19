import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  const t = useTranslations("common");

  return (
    <div role="status" className="flex flex-col gap-8">
      <span className="sr-only">{t("loading")}</span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
