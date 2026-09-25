import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@fontsource-variable/jost";
import "../globals.css";
import { hasLocale, locales } from "@/i18n/config";
import { localeMetadata } from "@/i18n/metadata";

export { viewport } from "@/i18n/metadata";

// Pre-render exactly /de/ and /en/; any other segment is a 404.
export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? localeMetadata(lang) : {};
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    // Browser extensions (e.g. Grammarly) add attributes to <html>/<body>
    // before React hydrates; don't treat those as mismatches.
    <html lang={lang} className="h-full antialiased" suppressHydrationWarning>
      <body className="h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
