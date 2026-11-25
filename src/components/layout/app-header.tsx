import { Suspense } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";

async function HeaderUser() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  return <UserMenu fullName={profile.fullName} />;
}

function HeaderUserSkeleton() {
  return (
    <div aria-hidden className="flex h-10 items-center gap-2 px-2">
      <div className="size-8 rounded-full bg-muted motion-safe:animate-pulse" />
      <div className="hidden h-4 w-24 rounded-md bg-muted motion-safe:animate-pulse sm:block" />
    </div>
  );
}

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4 md:px-6">
      <MobileNav />
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <Suspense fallback={<HeaderUserSkeleton />}>
          <HeaderUser />
        </Suspense>
      </div>
    </header>
  );
}
