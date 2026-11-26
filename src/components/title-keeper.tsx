"use client";

import { useEffect } from "react";

export function TitleKeeper() {
  useEffect(() => {
    let lastTitle = document.title;
    let placeholder: HTMLTitleElement | null = null;

    const observer = new MutationObserver(() => {
      const realTitle = [...document.head.querySelectorAll("title")].find(
        (title) => title !== placeholder,
      );

      if (realTitle) {
        placeholder?.remove();
        placeholder = null;
        lastTitle = realTitle.textContent || lastTitle;
        return;
      }

      if (!placeholder && lastTitle) {
        placeholder = document.createElement("title");
        placeholder.textContent = lastTitle;
        document.head.append(placeholder);
      }
    });

    observer.observe(document.head, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
      placeholder?.remove();
    };
  }, []);

  return null;
}
