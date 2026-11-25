"use client";

import { Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  const t = useTranslations("receipt");

  return (
    <Button onClick={() => window.print()}>
      <Printer data-icon="inline-start" aria-hidden />
      {t("print")}
    </Button>
  );
}
