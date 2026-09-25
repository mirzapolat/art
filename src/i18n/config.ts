export const locales = ["de", "en"] as const;
export type Locale = (typeof locales)[number];

/** Used when the browser prefers neither German nor English. */
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = { de: "Deutsch", en: "English" };

/** Where a visitor's explicit language choice is remembered. */
export const LOCALE_STORAGE_KEY = "locale";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function localePath(locale: Locale) {
  return `/${locale}/`;
}

/**
 * Picks the language for a visitor who arrives without one in the URL:
 * their earlier explicit choice first, then the browser's preference order.
 * (Browser-only: a static export has no server to read Accept-Language.)
 */
export function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && hasLocale(stored)) return stored;
  } catch {
    // Storage can be unavailable (private mode, blocked site data).
  }
  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = tag.toLowerCase().split("-")[0];
    if (hasLocale(base)) return base;
  }
  return defaultLocale;
}

export function rememberLocale(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Not critical: the URL still carries the language.
  }
}
