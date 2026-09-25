/**
 * Mutable state shared between the page and the 3D scene. The scene reads it
 * every frame, so following the mouse or starting a ripple never re-renders
 * React.
 */

/** Pointer in normalized device coordinates (-1..1). */
export const pointer = { x: 0, y: 0 };

/** Start time (seconds, performance clock) of the latest ripple. */
export const wave = { start: -1000 };

export function emitWave() {
  wave.start = performance.now() / 1000;
}
