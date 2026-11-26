"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useFormatFee } from "@/lib/use-format-fee";

export type BarReportFormat = "fee" | "percent" | "count";

export type BarReportPoint = {
  label: string;
  value: number;
};

type BarReportProps = {
  data: BarReportPoint[];
  seriesLabel: string;
  format: BarReportFormat;
  layout: "columns" | "rows";
};

const ROW_HEIGHT = 40;

const percentFormat = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 0,
});
const countFormat = new Intl.NumberFormat("en-US");
const compactFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function BarReport({ data, seriesLabel, format, layout }: BarReportProps) {
  const formatFee = useFormatFee();

  const config = {
    value: { label: seriesLabel, color: "var(--chart-1)" },
  } satisfies ChartConfig;

  const formatValue = (value: number) =>
    format === "fee"
      ? formatFee(value)
      : format === "percent"
        ? percentFormat.format(value)
        : countFormat.format(value);

  const formatTick = (value: number) =>
    format === "fee" ? compactFormat.format(value) : formatValue(value);

  const tooltip = (
    <ChartTooltip
      cursor={false}
      content={
        <ChartTooltipContent
          formatter={(value) => (
            <span className="flex w-full justify-between gap-4">
              <span className="text-muted-foreground">{seriesLabel}</span>
              <span className="font-medium text-foreground tabular-nums">
                {formatValue(Number(value))}
              </span>
            </span>
          )}
        />
      }
    />
  );

  if (layout === "rows") {
    return (
      <ChartContainer
        config={config}
        className="aspect-auto w-full"
        style={{ height: data.length * ROW_HEIGHT + 32 }}
      >
        <BarChart
          accessibilityLayer={false}
          data={data}
          layout="vertical"
          margin={{ left: 8, right: 16 }}
        >
          <CartesianGrid horizontal={false} />
          <YAxis type="category" dataKey="label" width={140} tickLine={false} axisLine={false} />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tickFormatter={formatTick}
            domain={format === "percent" ? [0, 1] : [0, "auto"]}
            allowDecimals={format !== "count"}
          />
          {tooltip}
          <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} maxBarSize={24} />
        </BarChart>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer config={config} className="aspect-auto h-72 w-full">
      <BarChart accessibilityLayer={false} data={data} margin={{ top: 8, left: 8, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={formatTick} />
        {tooltip}
        <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ChartContainer>
  );
}
