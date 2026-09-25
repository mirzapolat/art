import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Liquid glass: a stack of inset shadows draws the curved rim, and a light
 * backdrop blur frosts whatever moves behind it. (The original 21st.dev
 * version also ran an SVG displacement filter as a backdrop filter; over a
 * live WebGL canvas that is recomputed every frame, so it is left out.)
 *
 * Place inside a `relative isolate` element with a border radius.
 */
export function GlassSurface() {
  return (
    <span
      aria-hidden
      className="absolute inset-0 -z-10 rounded-[inherit] bg-card/25 shadow-[0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)] backdrop-blur-[3px]"
    />
  );
}

/** Round liquid-glass icon button. */
export function GlassButton({ className, children, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "relative isolate inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink outline-none transition-transform duration-300 ease-out-soft hover:scale-105 focus-visible:ring-2 focus-visible:ring-ink/40 active:scale-95 [&_svg]:pointer-events-none [&_svg]:size-4",
        className,
      )}
      {...props}
    >
      <GlassSurface />
      {children}
    </button>
  );
}
