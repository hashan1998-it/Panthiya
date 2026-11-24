"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type UnsavedChanges = {
  setDirty: (dirty: boolean) => void;
  confirmLeave: () => boolean;
};

const UnsavedChangesContext = createContext<UnsavedChanges | null>(null);

function isPlainLeftClick(event: MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function leavesPage(link: HTMLAnchorElement) {
  if (link.target === "_blank" || link.hasAttribute("download")) return false;
  const url = new URL(link.href, window.location.href);
  return url.pathname !== window.location.pathname || url.search !== window.location.search;
}

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("common");
  const [dirty, setDirty] = useState(false);
  const message = t("unsavedChanges");

  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || !isPlainLeftClick(event)) return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!link || !leavesPage(link)) return;
      if (window.confirm(message)) return;

      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty, message]);

  const confirmLeave = () => !dirty || window.confirm(message);

  return (
    <UnsavedChangesContext value={{ setDirty, confirmLeave }}>{children}</UnsavedChangesContext>
  );
}

export function useUnsavedChanges() {
  const context = useContext(UnsavedChangesContext);
  if (!context) throw new Error("useUnsavedChanges needs an UnsavedChangesProvider");
  return context;
}
