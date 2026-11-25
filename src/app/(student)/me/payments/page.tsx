import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { UnpaidDues } from "@/features/portal/components/unpaid-dues";
import { getMyStudent, listMyUnpaidDues } from "@/features/portal/queries";
import { StudentPaymentsTab } from "@/features/students/components/profile/student-payments-tab";
import { getStudentPayments } from "@/features/students/profile-queries";
import { getToday } from "@/lib/dates";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("me.payments");

  return { title: t("metaTitle") };
}

async function MyPayments() {
  await connection();

  const student = await getMyStudent();
  const [t, payments, unpaid] = await Promise.all([
    getTranslations("me.payments"),
    getStudentPayments(student.id),
    listMyUnpaidDues(student.id, getToday()),
  ]);

  return (
    <>
      <UnpaidDues dues={unpaid} />
      <StudentPaymentsTab payments={payments} emptyDescription={t("emptyDescription")} />
    </>
  );
}

export default function MyPaymentsPage() {
  const t = useTranslations("me.payments");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("title")} description={t("description")} />
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <MyPayments />
      </Suspense>
    </div>
  );
}
