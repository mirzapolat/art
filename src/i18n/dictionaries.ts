import type { Locale } from "./config";

/**
 * All interface text, per language. The English dictionary defines the shape;
 * the German one must match it, so a missing translation is a type error.
 * Both are tiny and ship to the browser, so switching language is instant.
 */
const en = {
  meta: {
    description: "An artistic business card — turn it over.",
  },
  brand: {
    home: "Mirza Polat — back to the first slide",
  },
  card: {
    turn: (title: string) => `${title}. Turn the card to see the next slide.`,
  },
  nav: {
    previous: "Previous slide",
    next: "Next slide",
    slides: "Slides",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  language: {
    label: "Language",
  },
  slides: {
    welcome: { title: "Curious?" },
    contact: { title: "Contact" },
  },
};

export type Dictionary = typeof en;

const de: Dictionary = {
  meta: {
    description: "Eine künstlerische Visitenkarte — dreh sie um.",
  },
  brand: {
    home: "Mirza Polat — zurück zur ersten Folie",
  },
  card: {
    turn: (title) => `${title}. Karte umdrehen, um die nächste Folie zu sehen.`,
  },
  nav: {
    previous: "Vorherige Folie",
    next: "Nächste Folie",
    slides: "Folien",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
  },
  language: {
    label: "Sprache",
  },
  slides: {
    welcome: { title: "Neugierig?" },
    contact: { title: "Kontakt" },
  },
};

export const dictionaries: Record<Locale, Dictionary> = { de, en };
