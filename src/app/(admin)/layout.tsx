import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { NavigationTracker } from "@/components/navigation-tracker";
import { RoleGate } from "@/components/role-gate";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <TooltipProvider>
      <div className="flex min-h-full flex-1">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <main className="mx-auto w-full max-w-300 flex-1 px-4 py-8 md:px-6">
            <RoleGate role="admin" fallback={<PageSkeleton />}>
              {children}
            </RoleGate>
          </main>
        </div>
      </div>
      <Suspense>
        <NavigationTracker />
      </Suspense>
    </TooltipProvider>
  );
}
