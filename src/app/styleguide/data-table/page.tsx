import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getPageInfo, parseTableParams } from "@/lib/table-params";
import {
  DEMO_SORTABLE_COLUMNS,
  filterStudents,
  parseDemoFilters,
  SAMPLE_STUDENTS,
  searchStudents,
  sortStudents,
} from "./sample-students";
import { StudentsTable } from "./students-table";

export const metadata: Metadata = {
  title: "Data table · Styleguide · Panthiya",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function StudentsResults({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const params = parseTableParams(raw, DEMO_SORTABLE_COLUMNS);
  const filtered = filterStudents(SAMPLE_STUDENTS, parseDemoFilters(raw));
  const matching = searchStudents(filtered, params.q);
  const sorted = sortStudents(matching, params.sort);
  const { offset } = getPageInfo(sorted.length, params.page, params.pageSize);
  const students = sorted.slice(offset, offset + params.pageSize);

  return <StudentsTable students={students} rowCount={sorted.length} />;
}

export default function DataTableDemoPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto flex w-full max-w-300 flex-col gap-8 px-4 py-8 md:px-6">
      <PageHeader
        title="Data table"
        description="Sample students, filtered, searched, sorted and paginated on the server from the URL."
      />
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <StudentsResults searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
