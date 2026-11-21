"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

let firstPathname: string | null = null;
let hasNavigatedInApp = false;

export function canGoBackInApp() {
  return hasNavigatedInApp;
}

export function NavigationTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (firstPathname === null) {
      firstPathname = pathname;
    } else if (pathname !== firstPathname) {
      hasNavigatedInApp = true;
    }
  }, [pathname]);

  return null;
}
