import { motion } from "motion/react";
import { localeNames, localePath, locales, type Locale } from "@/i18n/config";
import { GlassSurface } from "@/components/ui/glass-button";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  locale: Locale;
  label: string;
  onChange: (locale: Locale) => void;
};

/**
 * DE | EN in a liquid-glass pill. Each option is a real link to that
 * language's URL (so it works without JavaScript and crawlers can follow
 * it); with JavaScript the click switches the language in place instead.
 */
export default function LanguageSwitcher({ locale, label, onChange }: LanguageSwitcherProps) {
  return (
    <nav aria-label={label} className="relative isolate flex h-11 items-center gap-0.5 rounded-full p-1.5">
      <GlassSurface />
      {locales.map((l) => {
        const active = l === locale;
        return (
          <a
            key={l}
            href={localePath(l)}
            hrefLang={l}
            lang={l}
            aria-label={localeNames[l]}
            aria-current={active ? "true" : undefined}
            onClick={(e) => {
              e.preventDefault();
              if (!active) onChange(l);
            }}
            className={cn(
              "relative flex h-8 min-w-11 items-center justify-center rounded-full px-3 text-xs font-medium tracking-[0.2em] uppercase outline-none transition-colors duration-500 focus-visible:ring-2 focus-visible:ring-ink/40",
              active ? "text-card" : "text-ink/55 hover:text-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId="language-indicator"
                aria-hidden
                className="absolute inset-0 -z-10 rounded-full bg-ink"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            {l}
          </a>
        );
      })}
    </nav>
  );
}
