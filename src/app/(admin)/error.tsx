"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("errors.generic");
  const digest = getDigest(error);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert">
      <EmptyState
        icon={TriangleAlert}
        title={t("title")}
        description={t("description")}
        action={
          <div className="flex flex-col items-center gap-3">
            <Button onClick={() => retry()}>{t("retry")}</Button>
            {digest && (
              <p className="font-mono text-caption text-muted-foreground">
                {t("errorId", { digest })}
              </p>
            )}
          </div>
        }
      />
    </div>
  );
}
