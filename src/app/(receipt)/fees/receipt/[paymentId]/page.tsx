import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PrintButton } from "@/features/fees/components/print-button";
import { getReceipt } from "@/features/fees/queries";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { TIME_ZONE } from "@/lib/dates";
import { getFormatFee } from "@/lib/get-format-fee";
import { LogoWordmark } from "@/components/brand/logo";

type ReceiptParams = Promise<{ paymentId: string }>;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("receipt");

  return { title: t("metaTitle") };
}

async function ReceiptContent({ params }: { params: ReceiptParams }) {
  const formatFee = await getFormatFee();
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { paymentId } = await params;
  const receipt = await getReceipt(paymentId);
  if (!receipt) notFound();

  const [t, tFees, tApp, format] = await Promise.all([
    getTranslations("receipt"),
    getTranslations("fees"),
    getTranslations("metadata"),
    getFormatter(),
  ]);

  const formatDate = (date: string) =>
    format.dateTime(new Date(`${date}T00:00:00Z`), { dateStyle: "long", timeZone: "UTC" });

  const backHref = profile.role === "admin" ? `/fees?month=${receipt.month}` : "/me/payments";

  const details = [
    { label: t("fields.receiptNo"), value: receipt.receipt_no, mono: true },
    { label: t("fields.paidOn"), value: formatDate(receipt.paid_on) },
    { label: t("fields.student"), value: receipt.student.full_name },
    { label: t("fields.admissionNo"), value: receipt.student.admission_no, mono: true },
    {
      label: t("fields.class"),
      value: tFees("classValue", { subject: receipt.class.subject, grade: receipt.class.grade }),
    },
    {
      label: t("fields.month"),
      value: format.dateTime(new Date(`${receipt.month}-01T00:00:00Z`), {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
    },
    { label: t("fields.method"), value: tFees(`payment.methods.${receipt.method}`) },
  ];

  return (
    <>
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link href={backHref} className={buttonVariants({ variant: "outline" })}>
          <ArrowLeft data-icon="inline-start" aria-hidden />
          {t("back")}
        </Link>
        <PrintButton />
      </div>
      <article className="flex flex-col gap-6 rounded-xl border border-border p-6 print:rounded-none print:border-0 print:p-0">
        <header className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div className="flex flex-col gap-1">
            <p>
              <LogoWordmark className="h-7 w-auto" />
              <span className="sr-only">{tApp("title")}</span>
            </p>
            <h1 className="text-body-sm text-muted-foreground">{t("title")}</h1>
          </div>
          {receipt.voided_at && <Badge variant="destructive">{t("voided")}</Badge>}
        </header>
        <dl className="grid gap-3">
          {details.map(({ label, value, mono }) => (
            <div key={label} className="flex items-baseline justify-between gap-4">
              <dt className="text-body-sm text-muted-foreground">{label}</dt>
              <dd className={mono ? "font-mono text-body-sm" : "text-body-sm text-foreground"}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex items-baseline justify-between gap-4 border-t border-border pt-4">
          <span className="text-body-sm text-muted-foreground">{t("fields.amount")}</span>
          <span
            className={
              receipt.voided_at
                ? "text-title-lg text-muted-foreground tabular-nums line-through"
                : "text-title-lg tabular-nums"
            }
          >
            {formatFee(receipt.amount)}
          </span>
        </div>
        {receipt.voided_at && (
          <p className="text-body-sm text-destructive-foreground">
            {t("voidedNote", {
              date: format.dateTime(new Date(receipt.voided_at), {
                dateStyle: "long",
                timeZone: TIME_ZONE,
              }),
            })}
          </p>
        )}
      </article>
    </>
  );
}

export default function ReceiptPage({ params }: { params: ReceiptParams }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8 print:max-w-none print:p-0">
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <ReceiptContent params={params} />
      </Suspense>
    </main>
  );
}
