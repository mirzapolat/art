import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import type { Slide } from "@/content/slides";
import { cn, mod } from "@/lib/utils";

type SlideMenuProps = {
  slides: Slide[];
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (index: number) => void;
  labels: { slides: string; openMenu: string; closeMenu: string };
};

const ROW = 40;
const ROW_OPEN = 52;
const ease = [0.22, 1, 0.36, 1] as const;

/** Circular distance from the current slide: …, -1 (previous), 0, 1 (next), … */
function offset(i: number, index: number, n: number) {
  const d = mod(i - index, n);
  return d > n / 2 ? d - n : d;
}

/**
 * Bottom-left navigation. Closed, it is a small wheel of slide titles — the
 * current one in full ink, its neighbours faded above and below — turning
 * with the deck. Open, the same titles unfold into a list you can pick from.
 */
export default function SlideMenu({ slides, index, open, onOpenChange, onSelect, labels }: SlideMenuProps) {
  const root = useRef<HTMLDivElement>(null);
  const n = slides.length;

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) onOpenChange(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={root} className="pointer-events-auto flex items-end gap-3 sm:gap-4">
      <GlassButton
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-controls="slide-menu"
        aria-label={open ? labels.closeMenu : labels.openMenu}
      >
        <Plus className={cn("transition-transform duration-500 ease-out-soft", open && "rotate-45")} />
      </GlassButton>

      <nav id="slide-menu" aria-label={labels.slides} className="relative h-11 w-40 sm:w-56">
        {slides.map((slide, i) => {
          const d = offset(i, index, n);
          const current = d === 0;
          const y = open ? (i - (n - 1)) * ROW_OPEN : d * ROW;
          const opacity = open ? (current ? 1 : 0.4) : current ? 1 : Math.abs(d) === 1 ? 0.16 : 0;
          return (
            <motion.button
              key={slide.id}
              type="button"
              tabIndex={open || current ? 0 : -1}
              aria-current={current ? "true" : undefined}
              onClick={() => (open ? onSelect(i) : onOpenChange(true))}
              initial={false}
              animate={{ y, opacity, filter: open || current ? "blur(0px)" : "blur(1.5px)" }}
              transition={{ duration: 0.9, ease, delay: open ? (n - 1 - i) * 0.04 : 0 }}
              className={cn(
                "absolute bottom-0 left-0 flex h-11 cursor-pointer items-center text-xl tracking-tight whitespace-nowrap outline-none transition-[font-weight] duration-500 focus-visible:underline sm:text-3xl",
                current ? "font-normal" : "font-extralight",
                !open && !current && "pointer-events-none",
              )}
            >
              {slide.title}
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}

