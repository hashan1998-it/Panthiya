import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  titleAddon?: ReactNode;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({ title, titleAddon, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-display-sm">{title}</h1>
          {titleAddon}
        </div>
        {description && <p className="text-body-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
    </div>
  );
}
