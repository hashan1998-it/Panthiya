import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentsTable } from "@/features/students/components/students-table";
import { parseStudentFilters, STUDENT_SORTABLE_COLUMNS } from "@/features/students/filters";
import { listStudents } from "@/features/students/queries";
import { parseTableParams } from "@/lib/table-params";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("students");

  return { title: t("metaTitle") };
}

async function StudentsResults({ searchParams }: { searchParams: SearchParams }) {
  await connection();

  const raw = await searchParams;
  const params = parseTableParams(raw, STUDENT_SORTABLE_COLUMNS);
  const { students, rowCount } = await listStudents(params, parseStudentFilters(raw));

  return <StudentsTable students={students} rowCount={rowCount} />;
}

export default function StudentsPage({ searchParams }: { searchParams: SearchParams }) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("nav.students")} description={t("students.description")} />
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <StudentsResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
