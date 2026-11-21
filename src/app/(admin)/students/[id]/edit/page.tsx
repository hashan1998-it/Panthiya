import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { StudentForm } from "@/features/students/components/student-form";
import { getStudent } from "@/features/students/queries";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  await connection();

  const { id } = await params;
  const student = await getStudent(id);
  if (!student) return {};

  const t = await getTranslations("students.edit");
  return { title: t("metaTitle", { name: student.full_name }) };
}

async function EditStudent({ params }: { params: Params }) {
  await connection();

  const { id } = await params;
  const student = await getStudent(id);
  if (!student) notFound();

  const t = await getTranslations("students.edit");

  return (
    <>
      <PageHeader title={t("title")} description={t("description", { name: student.full_name })} />
      <StudentForm student={student} />
    </>
  );
}

export default function EditStudentPage({ params }: { params: Params }) {
  return (
    <div className="flex flex-col gap-8">
      <Suspense fallback={<PageSkeleton />}>
        <EditStudent params={params} />
      </Suspense>
    </div>
  );
}
