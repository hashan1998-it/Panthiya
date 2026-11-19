"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { applyTableParamsChange, type TableParamsChange } from "@/lib/table-params";

export function useTableParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function setTableParams(change: TableParamsChange) {
    const next = applyTableParamsChange(new URLSearchParams(searchParams.toString()), change);
    const query = next.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  return { searchParams, setTableParams, isPending };
}
