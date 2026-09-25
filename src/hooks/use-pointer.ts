import { useEffect } from "react";
import { useMotionValue } from "motion/react";
import { pointer } from "@/lib/stage";

/**
 * Tracks the pointer in normalized coordinates (-1..1, y up). Returns motion
 * values for the DOM layers and mirrors them into the shared `pointer` the 3D
 * scene reads each frame. Both ease back to centre when the pointer leaves.
 */
export function usePointer() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const set = (nx: number, ny: number) => {
      pointer.x = nx;
      pointer.y = ny;
      x.set(nx);
      y.set(ny);
    };
    const onMove = (e: PointerEvent) =>
      set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    const onLeave = () => set(0, 0);

    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [x, y]);

  return { x, y };
}
