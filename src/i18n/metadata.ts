import type { Metadata, Viewport } from "next";
import { localePath, locales, type Locale } from "./config";
import { dictionaries } from "./dictionaries";

/**
 * Absolute origin of the published site, needed for canonical and hreflang
 * URLs. Set it when building for production: `SITE_URL=https://… npm run build`.
 */
const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

const ogLocale: Record<Locale, string> = { de: "de_DE", en: "en_US" };

const shared: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Mirza Polat",
  icons: { icon: "/favicon.png", apple: "/favicon.png" },
};

/** Each language version points at the other (hreflang) and at `/` as the fallback. */
const alternates = {
  languages: {
    ...Object.fromEntries(locales.map((l) => [l, localePath(l)])),
    "x-default": "/",
  },
};

export function localeMetadata(locale: Locale): Metadata {
  const { description } = dictionaries[locale].meta;
  return {
    ...shared,
    description,
    alternates: { ...alternates, canonical: localePath(locale) },
    openGraph: {
      title: "Mirza Polat",
      description,
      locale: ogLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
    },
  };
}

export const rootMetadata: Metadata = {
  ...shared,
  description: dictionaries.en.meta.description,
  alternates: { ...alternates, canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#ece7dc",
  // Draw under the notch / home indicator; the HUD pads itself with safe-area insets.
  viewportFit: "cover",
};
