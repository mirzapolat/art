import { useRef } from "react";
import { motion, useMotionTemplate, useSpring, useTransform, type MotionValue } from "motion/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn, mod } from "@/lib/utils";
import type { Slide } from "@/content/slides";
import { HURRY } from "@/hooks/use-deck";

gsap.registerPlugin(useGSAP);

type FlipCardProps = {
  /** Unbounded turn counter: +1 per turn forward, -1 per turn back. */
  step: number;
  /** Length of this turn in seconds. */
  seconds: number;
  /** Bumped when the running turn should hurry (more turns are waiting). */
  rush: number;
  /** Printed on the side facing the viewer. */
  current: Slide;
  /** Printed on the side turning away. */
  previous: Slide;
  onNext: () => void;
  /** Accessible name of the card, in the page language. */
  label: string;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  calm: boolean;
};

/** Length of one unhurried turn, in seconds. */
export const FLIP_SECONDS = { normal: 1.05, calm: 0.6 };

/**
 * One sheet, two sides. The card rotates 180° per step, so whichever side
 * faces the viewer is decided by the step's parity: that side prints the
 * current slide, the other side keeps the previous one until it turns away.
 */
export default function FlipCard({ step, seconds, rush, current, previous, onNext, label, mouseX, mouseY, calm }: FlipCardProps) {
  const flipRef = useRef<HTMLDivElement>(null);
  const liftRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // Pointer tilt — the card leans toward the cursor.
  const tiltRange = calm ? 3 : 11;
  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [tiltRange, -tiltRange]), { stiffness: 110, damping: 18 });
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [-tiltRange * 1.3, tiltRange * 1.3]), { stiffness: 110, damping: 18 });

  // Soft light that slides across the surface with the pointer.
  const glareX = useTransform(mouseX, [-1, 1], [15, 85]);
  const glareY = useTransform(mouseY, [-1, 1], [85, 15]);
  const glare = useMotionTemplate`radial-gradient(60% 80% at ${glareX}% ${glareY}%, rgba(255,255,255,0.1), transparent 70%)`;

  const turnTweens = useRef<gsap.core.Animation[]>([]);

  useGSAP(
    () => {
      const flip = gsap.to(flipRef.current, {
        rotationY: step * 180,
        duration: seconds,
        ease: "power3.inOut",
        overwrite: "auto",
      });
      turnTweens.current = [flip];
      if (!calm && !firstRender.current) {
        // Lift the card off the table while it turns — less for quick turns.
        const lift = gsap.timeline({ defaults: { ease: "power2.inOut" } })
          .to(liftRef.current, { z: 140 * Math.min(1, seconds), duration: seconds * 0.45 })
          .to(liftRef.current, { z: 0, duration: seconds * 0.55, ease: "power3.out" });
        turnTweens.current.push(lift);
      }
      firstRender.current = false;
    },
    { dependencies: [step] },
  );

  // More turns queued up: hurry the one in flight instead of cutting it off.
  useGSAP(
    () => {
      if (rush) turnTweens.current.forEach((t) => t.timeScale(HURRY));
    },
    { dependencies: [rush] },
  );

  const frontShowsCurrent = mod(step, 2) === 0;
  const faces = [
    { side: "front", slide: frontShowsCurrent ? current : previous, visible: frontShowsCurrent },
    { side: "back", slide: frontShowsCurrent ? previous : current, visible: !frontShowsCurrent },
  ] as const;

  return (
    // The tilting element is the control itself: in a 3D context the browser
    // may hit-test any layer of the card, and every layer must bubble here.
    // It is a div rather than a <button> because slides may contain links.
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onNext}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onNext();
        }
      }}
      aria-label={label}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group relative block aspect-[7/4] w-[min(680px,90vw,calc((100svh-12rem)*1.75))] cursor-pointer rounded-[1.4%/2.45%] outline-none focus-visible:outline-1 focus-visible:outline-offset-[14px] focus-visible:outline-ink/35 focus-visible:outline-dashed"
    >
      <div ref={liftRef} className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ transformStyle: "preserve-3d" }}>
        <div ref={flipRef} className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ transformStyle: "preserve-3d" }}>
          {faces.map(({ side, slide, visible }) => (
            <div
              key={side}
              aria-hidden={!visible}
              inert={!visible}
              className={cn(
                "card-face pointer-events-auto overflow-hidden rounded-[inherit] text-left shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_30px_60px_-20px_rgba(22,22,22,0.35),0_12px_24px_-12px_rgba(22,22,22,0.25)]",
                side === "back" && "card-face--back",
                slide.tone === "dark" ? "bg-ink text-card" : "bg-card text-ink",
              )}
            >
              {slide.content}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: glare }}
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
