"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cn } from "@/lib/utils";

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-muted p-1",
        className,
      )}
      {...props}
    />
  );
}

function TabsTab({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-tab"
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md px-3 text-body-sm font-medium whitespace-nowrap text-muted-foreground transition-colors duration-150 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none data-active:bg-background data-active:text-foreground data-active:shadow-sm [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

function TabsPanel({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-panel"
      className={cn("outline-none focus-visible:ring-3 focus-visible:ring-ring/50", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTab, TabsPanel };
