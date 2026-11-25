import { useTranslations } from "next-intl";
import SignOutButton from "@/app/(auth)/components/sign-out-button";
import { RoleGate } from "@/components/role-gate";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { PortalNav } from "@/features/portal/components/portal-nav";

export default function StudentLayout({ children }: LayoutProps<"/">) {
  const t = useTranslations("metadata");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-300 flex-col gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center justify-between gap-4">
            <span className="text-title-md">{t("title")}</span>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <SignOutButton />
            </div>
          </div>
          <PortalNav />
        </div>
      </header>
      <main className="mx-auto w-full max-w-300 flex-1 px-4 py-8 md:px-6">
        <RoleGate role="student" fallback={<PageSkeleton />}>
          {children}
        </RoleGate>
      </main>
    </div>
  );
}
