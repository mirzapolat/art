import { useEffect } from "react";

/**
 * Arrow/page keys, the scroll wheel and swipes all turn the card. One scroll
 * gesture is one turn: the wheel stays locked until it has been quiet for a
 * moment, so trackpad momentum doesn't fire a second turn.
 */
export function useTurnInput(turn: (dir: 1 | -1) => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "ArrowDown", "PageDown"].includes(e.key)) turn(1);
      if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) turn(-1);
    };

    let locked = false;
    let travel = 0;
    let quiet: ReturnType<typeof setTimeout> | undefined;
    const onWheel = (e: WheelEvent) => {
      clearTimeout(quiet);
      quiet = setTimeout(() => {
        locked = false;
        travel = 0;
      }, 220);
      if (locked) return;
      travel += Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(travel) > 40) {
        turn(travel > 0 ? 1 : -1);
        locked = true;
        travel = 0;
      }
    };

    let start: { x: number; y: number } | null = null;
    const onTouchStart = (e: TouchEvent) => {
      start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!start) return;
      const dx = e.changedTouches[0].clientX - start.x;
      const dy = e.changedTouches[0].clientY - start.y;
      start = null;
      const along = Math.abs(dy) > Math.abs(dx) ? dy : dx;
      if (Math.abs(along) > 50) turn(along < 0 ? 1 : -1);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      clearTimeout(quiet);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [turn]);
}
