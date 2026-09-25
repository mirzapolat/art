"use client";

import { useEffect } from "react";
import { detectLocale, localeNames, localePath, locales } from "@/i18n/config";

/**
 * Sends the visitor to their language. A static site has no server to read
 * the Accept-Language header, so this happens in the browser, before any
 * content is shown. The links are the fallback without JavaScript.
 */
export default function LocaleRedirect() {
  useEffect(() => {
    window.location.replace(localePath(detectLocale()));
  }, []);

  return (
    <noscript>
      <nav className="flex h-full items-center justify-center gap-8 text-2xl font-light">
        {locales.map((l) => (
          <a key={l} href={localePath(l)} hrefLang={l} lang={l} className="underline underline-offset-8">
            {localeNames[l]}
          </a>
        ))}
      </nav>
    </noscript>
  );
}
