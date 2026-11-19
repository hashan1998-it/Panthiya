import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getPageInfo, parseTableParams } from "@/lib/table-params";
import { DEMO_SORTABLE_COLUMNS, SAMPLE_STUDENTS, sortStudents } from "./sample-students";
import { StudentsTable } from "./students-table";

export const metadata: Metadata = {
  title: "Data table · Styleguide · Panthiya",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function StudentsResults({ searchParams }: { searchParams: SearchParams }) {
  const params = parseTableParams(await searchParams, DEMO_SORTABLE_COLUMNS);
  const sorted = sortStudents(SAMPLE_STUDENTS, params.sort);
  const { offset } = getPageInfo(sorted.length, params.page, params.pageSize);
  const students = sorted.slice(offset, offset + params.pageSize);

  return <StudentsTable students={students} rowCount={sorted.length} />;
}

export default function DataTableDemoPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto flex w-full max-w-300 flex-col gap-8 px-4 py-8 md:px-6">
      <PageHeader
        title="Data table"
        description="Sample students, sorted and paginated on the server from the URL."
      />
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <StudentsResults searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
