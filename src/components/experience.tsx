"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import FlipCard, { FLIP_SECONDS } from "@/components/card/flip-card";
import SlideMenu from "@/components/slide-menu";
import { GlassButton } from "@/components/ui/glass-button";
import LanguageSwitcher from "@/components/language-switcher";
import { createSlides } from "@/content/slides";
import { useDeck } from "@/hooks/use-deck";
import { localePath, rememberLocale, type Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { usePointer } from "@/hooks/use-pointer";
import { useTurnInput } from "@/hooks/use-turn-input";
import { emitWave } from "@/lib/stage";

gsap.registerPlugin(useGSAP);

// WebGL only exists in the browser.
const Scene = dynamic(() => import("@/components/scene"), { ssr: false });

/**
 * The corner controls: name (top left), language switcher (top right),
 * slide menu (bottom left) and arrows (bottom right). Hidden while the deck
 * is this small; the card still turns by click, scroll, swipe and arrow keys,
 * and the language still follows the browser. Set to `true` to bring them back.
 */
const SHOW_CORNERS = false;

/** The flipping card in the middle. Set to `true` to bring it back. */
const SHOW_CARD = false;


export default function Experience({ initialLocale }: { initialLocale: Locale }) {
  const root = useRef<HTMLDivElement>(null);
  const calm = useReducedMotion() ?? false;
  // The page is rendered per language at /de/ and /en/. Switching language
  // swaps the text in place and rewrites the URL, so the card, its position
  // in the deck and the 3D scene carry on without a reload.
  const [locale, setLocale] = useState(initialLocale);
  const t = dictionaries[locale];
  const slides = useMemo(() => createSlides(t.slides), [t]);
  const switchLocale = (next: Locale) => {
    setLocale(next);
    rememberLocale(next);
    document.documentElement.lang = next;
    window.history.replaceState(null, "", localePath(next));
  };

  const { deck, turn, goTo } = useDeck(slides.length, calm ? FLIP_SECONDS.calm : FLIP_SECONDS.normal);
  const [menuOpen, setMenuOpen] = useState(false);
  const slide = slides[deck.slide];

  const { x: mouseX, y: mouseY } = usePointer();
  useTurnInput(turn);

  // HUD drifts slightly against the pointer — a second parallax layer.
  const hudX = useSpring(useTransform(mouseX, [-1, 1], [10, -10]), { stiffness: 60, damping: 20 });
  const hudY = useSpring(useTransform(mouseY, [-1, 1], [-8, 8]), { stiffness: 60, damping: 20 });

  // Until the visitor turns the card, a ripple runs out from it through the
  // background every few seconds and the card gives a small breath with it.
  const nudgeRef = useRef<HTMLDivElement>(null);
  const engaged = deck.step !== 0;
  useEffect(() => {
    if (!SHOW_CARD || calm || engaged) return;
    const nudge = () => {
      emitWave();
      gsap.fromTo(
        nudgeRef.current,
        { scale: 1 },
        { scale: 1.035, duration: 0.35, ease: "power2.out", yoyo: true, repeat: 1 },
      );
    };
    let interval: ReturnType<typeof setInterval> | undefined;
    const first = setTimeout(() => {
      nudge();
      interval = setInterval(nudge, 6500);
    }, 1900);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [calm, engaged]);

  // Opening sequence.
  useGSAP(
    () => {
      if (calm) return;
      const intro = gsap.timeline({ defaults: { ease: "expo.out" } })
        .from(".intro-line", { scaleX: 0, duration: 1.6, stagger: 0.1, ease: "expo.inOut" });
      if (SHOW_CARD) intro.from(".intro-card", { y: 160, rotationX: 55, opacity: 0, duration: 1.8 }, 0.35);
      if (SHOW_CORNERS) intro.from(".intro-hud", { y: 16, opacity: 0, duration: 1.1, stagger: 0.08 }, 0.9);
    },
    { scope: root },
  );

  return (
    <main ref={root} className="relative h-svh w-full touch-none overflow-hidden select-none">
      <Scene step={deck.step} accent={slide.accent} calm={calm} />

      {/* Construction lines */}
      <motion.div aria-hidden style={{ x: hudX, y: hudY }} className="pointer-events-none fixed inset-0">
        <div className="intro-line absolute top-1/2 left-0 h-px w-full origin-left bg-ink/10" />
        <div className="intro-line absolute top-0 left-1/2 h-full w-px origin-top bg-ink/10" />
      </motion.div>

      {/* Warm grayscale over the background (scene + lines, not the card) for
          slides marked `mono`; fades in and out over the length of a turn. */}
      <div
        aria-hidden
        style={{ transitionDuration: `${deck.seconds}s` }}
        className={`pointer-events-none fixed inset-0 z-[5] backdrop-grayscale backdrop-sepia-[0.15] transition-[opacity,visibility] ease-in-out ${slide.mono ? "visible opacity-100" : "invisible opacity-0"}`}
      />

      {/* The card */}
      {SHOW_CARD && (
      <div
        className="relative z-10 flex h-full items-center justify-center"
        style={{ perspective: 1600 }}
        onClick={(e) => {
          // Mid-turn, while the card is lifted and edge-on, browsers can miss it
          // in 3D hit-testing and hand the click to this container instead.
          if (e.target !== e.currentTarget || !nudgeRef.current) return;
          const r = nudgeRef.current.getBoundingClientRect();
          if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) turn(1);
        }}
      >
        <div className="intro-card pointer-events-none" style={{ transformStyle: "preserve-3d" }}>
          <div ref={nudgeRef} style={{ transformStyle: "preserve-3d" }}>
            <motion.div
              animate={calm ? undefined : { y: [0, -14, 0], rotateZ: [-0.4, 0.4, -0.4] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d" }}
              className="pointer-events-none"
            >
              <FlipCard
                step={deck.step}
                seconds={deck.seconds}
                rush={deck.rush}
                current={slide}
                previous={slides[deck.prev]}
                onNext={() => turn(1)}
                label={t.card.turn(slide.title)}
                mouseX={mouseX}
                mouseY={mouseY}
                calm={calm}
              />
            </motion.div>
          </div>
          {/* Contact shadow on the "table" below the floating card */}
          <motion.div
            aria-hidden
            animate={calm ? undefined : { scaleX: [1, 0.86, 1], opacity: [0.35, 0.22, 0.35] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto mt-6 h-12 w-[80%] bg-[radial-gradient(closest-side,rgba(22,22,22,0.4),transparent)]"
          />
        </div>
      </div>
      )}

      {/* HUD */}
      {SHOW_CORNERS && (
      <motion.div style={{ x: hudX, y: hudY }} className="pointer-events-none fixed inset-0 z-20 px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:p-8">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => goTo(0)}
            aria-label={t.brand.home}
            className="intro-hud pointer-events-auto flex cursor-pointer items-center gap-3 outline-none focus-visible:underline"
          >
            <Image src="/favicon.png" alt="" width={32} height={32} unoptimized className="size-8" />
            <span className="text-sm font-medium tracking-[0.18em] uppercase">Mirza Polat</span>
          </button>
          <div className="intro-hud pointer-events-auto">
            <LanguageSwitcher locale={locale} label={t.language.label} onChange={switchLocale} />
          </div>
        </header>

        <footer className="absolute inset-x-4 bottom-[max(2.25rem,calc(env(safe-area-inset-bottom)+1.5rem))] flex items-end justify-between gap-3 sm:inset-x-8 sm:bottom-10">
          <div className="intro-hud">
            <SlideMenu
              slides={slides}
              index={deck.slide}
              open={menuOpen}
              onOpenChange={setMenuOpen}
              labels={t.nav}
              onSelect={(i) => {
                goTo(i);
                setMenuOpen(false);
              }}
            />
          </div>

          <div className="intro-hud pointer-events-auto flex items-center gap-2 sm:gap-3">
            <GlassButton onClick={() => turn(-1)} aria-label={t.nav.previous}>
              <ArrowLeft />
            </GlassButton>
            <div className="hidden items-center gap-2 px-1 sm:flex" aria-hidden>
              {slides.map((s, i) => (
                <span
                  key={s.id}
                  className={`h-px transition-all duration-700 ease-out-soft ${i === deck.slide ? "w-8 bg-ink" : "w-3 bg-ink/30"}`}
                />
              ))}
            </div>
            <GlassButton onClick={() => turn(1)} aria-label={t.nav.next}>
              <ArrowRight />
            </GlassButton>
          </div>
        </footer>
      </motion.div>
      )}

      <div className="grain" aria-hidden />
    </main>
  );
}
