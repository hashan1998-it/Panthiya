"use client";

import type { ComponentProps } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { BarReport as BarReportComponent } from "./bar-report";
import { chartHeight } from "./chart-height";

const BarReport = dynamic(() => import("./bar-report").then((module) => module.BarReport), {
  ssr: false,
  loading: () => <Skeleton className="size-full" />,
});

export function LazyBarReport(props: ComponentProps<typeof BarReportComponent>) {
  return (
    <div style={{ height: chartHeight(props.layout, props.data.length) }}>
      <BarReport {...props} />
    </div>
  );
}
