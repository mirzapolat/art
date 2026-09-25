import type { Metadata } from "next";
import "@fontsource-variable/jost";
import "./globals.css";
import { localePath } from "@/i18n/config";

export const metadata: Metadata = {
  title: "404 — Mirza Polat",
};

/** Unknown URLs, in both languages (there is no language to go by here). */
export default function GlobalNotFound() {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex h-full flex-col items-center justify-center gap-6 text-center">
        <p className="text-7xl font-extralight tracking-tight">404</p>
        <p className="text-lg font-light">
          <span lang="de">Diese Seite gibt es nicht.</span>
          <br />
          This page doesn’t exist.
        </p>
        <p className="flex gap-6 text-sm tracking-[0.18em] uppercase">
          <a href={localePath("de")} hrefLang="de" lang="de" className="underline underline-offset-4">
            Zur Startseite
          </a>
          <a href={localePath("en")} hrefLang="en" className="underline underline-offset-4">
            Home
          </a>
        </p>
      </body>
    </html>
  );
}
