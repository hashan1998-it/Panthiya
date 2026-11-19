import type { ComponentProps } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function NativeSelect({ className, ...props }: ComponentProps<"select">) {
  return (
    <span data-slot="native-select-wrapper" className="relative inline-flex">
      <select
        data-slot="native-select"
        className={cn(
          "h-10 cursor-pointer appearance-none rounded-lg border border-input bg-background pr-9 pl-3 text-body-sm text-foreground tabular-nums transition-colors duration-150 outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none dark:scheme-dark",
          className,
        )}
        {...props}
      />
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </span>
  );
}

export { NativeSelect };
