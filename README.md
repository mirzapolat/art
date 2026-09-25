# Mirza Polat — artistic business card

A single-page, 3D business card: a floating card over a Bauhaus still-life.
Click, scroll, swipe or use the arrow keys to turn it; each turn shows the next slide.

Next.js (static export) · React Three Fiber · GSAP · Motion · Tailwind CSS · Jost variable font.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000 — the dev server is much slower than the real build
```

## Languages

The site is German and English, at `/de/` and `/en/` (each pre-rendered with its own
`<html lang>`, description and hreflang links). `/` sends visitors to the language
of their browser, or to the one they last picked with the switcher (top right).

All text lives in `src/i18n/dictionaries.ts`. The English dictionary defines the
shape, so a missing German translation is a type error.

## Edit the slides

The layout of each slide lives in `src/content/slides.tsx`; its text comes from the
dictionaries. Each slide has an `accent` (colours the disc behind the card) and an
optional `tone: "dark"`. Sizes inside a slide use `cqw` so they scale with the card.

## Publish

```bash
SITE_URL=https://your-domain.com npm run build   # writes a fully static site to out/
```

`SITE_URL` makes the canonical and hreflang links absolute. Upload the contents of
`out/` to any static host.

## Where things live

| Path | What |
| --- | --- |
| `src/components/experience.tsx` | Page layout: card, menu, controls, intro and nudge animations |
| `src/components/card/flip-card.tsx` | The two-sided card: tilt, glare, turn animation |
| `src/components/scene.tsx` | The 3D background |
| `src/components/ripple.tsx` | The wave distortion that nudges visitors to click |
| `src/components/slide-menu.tsx` | Bottom-left title carousel / menu |
| `src/hooks/use-deck.ts` | Slide navigation with a turn queue |
| `src/lib/stage.ts` | Pointer + wave state shared with the 3D scene |
| `src/i18n/` | Languages, detection, dictionaries, per-language metadata |
| `src/app/[lang]/` | The page, once per language · `src/app/(detect)/` the `/` redirect |
