"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const themes = ["light", "dark", "system"] as const;

const subscribe = () => () => {};

// Temporary switch for the styleguide. The real header switch comes in T-081.
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  // The theme is only known in the browser, so render neutral buttons on the server.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return (
    <div role="group" aria-label="Theme" className="flex gap-2">
      {themes.map((t) => (
        <Button
          key={t}
          variant={mounted && theme === t ? "default" : "outline"}
          aria-pressed={mounted && theme === t}
          onClick={() => setTheme(t)}
          className="capitalize"
        >
          {t}
        </Button>
      ))}
    </div>
  );
}
