import type { ReactNode } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Accent } from "@/lib/palette";

/**
 * The deck. Every click on the card turns it over and shows the next entry.
 * Add, remove or reorder slides here — nothing else needs to change. Text
 * comes from the dictionaries in `src/i18n/dictionaries.ts`.
 *
 * - `accent` tints the large disc in the 3D background while the slide is up.
 * - `tone: "dark"` prints the slide on an ink-coloured side of the card.
 * - `mono: true` fades the page background to warm grayscale while it shows.
 * - Sizes inside a slide use `cqw` (1% of the card's width) so the layout
 *   scales with the card on every screen.
 */
export type Slide = {
  id: string;
  title: string;
  accent: Accent;
  tone?: "light" | "dark";
  mono?: boolean;
  content: ReactNode;
};

/** From `.env` (NEXT_PUBLIC_CONTACT_EMAIL); inlined into the page at build time. */
const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

/* ─── Artwork ────────────────────────────────────────────────────────── */

/**
 * Soft, grainy colour fields drifting over the card: two radial gradients in
 * the site's warm primaries, each moving on its own slow loop (transform only, so it
 * stays cheap), with film grain on top.
 */
function DriftingGradient() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-card">
      <div className="drift drift-a absolute -top-[40%] -left-[25%] size-[95cqw] rounded-full bg-[radial-gradient(closest-side,rgba(212,64,42,0.78),rgba(212,64,42,0.3)_45%,transparent)]" />
      <div className="drift drift-b absolute -right-[20%] -bottom-[55%] size-[90cqw] rounded-full bg-[radial-gradient(closest-side,rgba(232,178,48,0.7),rgba(232,178,48,0.25)_50%,transparent)]" />
      <div className="card-grain absolute inset-0" />
    </div>
  );
}

/** One large, thin arrow pointing right, nudging forward. */
function BigArrow() {
  return (
    // Outer span: hover shift. Inner svg: the idle nudge. (Both move `translate`.)
    <span aria-hidden className="relative block transition-[translate] duration-700 ease-out-soft group-hover:translate-x-[3cqw]">
      <svg
        viewBox="0 0 120 40"
        className="arrow-nudge block w-[44cqw] overflow-visible text-ink"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      >
        <line x1="2" y1="20" x2="116" y2="20" />
        <polyline points="98,4 116,20 98,36" strokeLinejoin="miter" />
      </svg>
    </span>
  );
}

/* ─── The slides ─────────────────────────────────────────────────────── */

export function createSlides(t: Dictionary["slides"]): Slide[] {
  return [
    {
      id: "card",
      title: t.welcome.title,
      accent: "signal",
      content: (
        <div className="relative flex h-full items-center justify-center">
          <DriftingGradient />
          <BigArrow />
        </div>
      ),
    },
    {
      id: "contact",
      title: t.contact.title,
      accent: "ink",
      mono: true,
      content: (
        <div className="flex h-full items-center justify-center p-[7cqw] text-center">
          {EMAIL && (
            <a
              href={`mailto:${EMAIL}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[5.2cqw] leading-none font-normal tracking-[-0.01em] whitespace-nowrap text-ink underline decoration-ink/30 decoration-[0.3cqw] underline-offset-[1.6cqw] transition-[text-decoration-thickness,text-decoration-color] duration-300 hover:decoration-ink hover:decoration-[0.5cqw] focus-visible:outline-1 focus-visible:outline-offset-[1.5cqw] focus-visible:outline-ink/50 focus-visible:outline-dashed"
            >
              {EMAIL}
            </a>
          )}
        </div>
      ),
    },
  ];
}
