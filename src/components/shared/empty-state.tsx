import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-secondary px-6 py-12 text-center",
        className,
      )}
    >
      <Icon aria-hidden className="size-10 text-muted-foreground" />
      <div className="flex max-w-sm flex-col gap-1">
        <h2 className="text-title-md">{title}</h2>
        {description && <p className="text-body-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
