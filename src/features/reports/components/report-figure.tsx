import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ReportFigureProps = {
  id: string;
  title: string;
  description: string;
  summary: string;
  labelHeader: string;
  valueHeader: string;
  rows: { label: string; value: string }[];
  children: ReactNode;
};

export async function ReportFigure({
  id,
  title,
  description,
  summary,
  labelHeader,
  valueHeader,
  rows,
  children,
}: ReportFigureProps) {
  const t = await getTranslations("reports");

  return (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-4 rounded-xl border border-border p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 id={id} className="text-title-md">
          {title}
        </h2>
        <p className="text-body-sm text-muted-foreground">{description}</p>
      </div>
      <figure className="flex flex-col gap-4">
        <div aria-hidden="true">{children}</div>
        <figcaption className="text-body-sm text-foreground">{summary}</figcaption>
      </figure>
      <details className="text-body-sm">
        <summary className="text-muted-foreground">{t("showTable")}</summary>
        <Table aria-label={title} className="mt-2">
          <TableHeader>
            <TableRow>
              <TableHead>{labelHeader}</TableHead>
              <TableHead className="text-right">{valueHeader}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label}>
                <TableCell>{row.label}</TableCell>
                <TableCell className="text-right tabular-nums">{row.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </details>
    </section>
  );
}
