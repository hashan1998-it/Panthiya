"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";

const PAGING_KEYS = ["page", "pageSize"];

type ExportLinkProps = {
  href: string;
};

function ExportAnchor({ href, query }: ExportLinkProps & { query: string }) {
  const t = useTranslations("common");

  return (
    <a
      href={query ? `${href}?${query}` : href}
      download
      className={buttonVariants({ variant: "outline" })}
    >
      <Download data-icon="inline-start" aria-hidden />
      {t("exportCsv")}
    </a>
  );
}

function ExportWithFilters({ href }: ExportLinkProps) {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  for (const key of PAGING_KEYS) params.delete(key);

  return <ExportAnchor href={href} query={params.toString()} />;
}

export function ExportLink({ href }: ExportLinkProps) {
  return (
    <Suspense fallback={<ExportAnchor href={href} query="" />}>
      <ExportWithFilters href={href} />
    </Suspense>
  );
}
