"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Keep the document language correct when navigating between static exports. */
export function DocumentLanguage() {
  const pathname = usePathname();

  useEffect(() => {
    const locale = pathname.match(/^\/elevenward\/(es|fr|pt-br)(?:\/|$)/)?.[1];
    document.documentElement.lang = locale === "pt-br" ? "pt-BR" : locale || "en";
  }, [pathname]);

  return null;
}
