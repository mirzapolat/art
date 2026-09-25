"use client";

import { useEffect, useRef } from "react";
import { useFaceVisible } from "@/components/card/face-context";

/* ─── 2D simplex noise (Gustavson), used as a slowly changing current ──── */

const GRAD = [
  [1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1],
];
const PERM = (() => {
  const p = Array.from({ length: 256 }, (_, i) => i);
  let seed = 7;
  for (let i = 255; i > 0; i--) {
    seed = (seed * 16807) % 2147483647;
    const j = seed % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  return [...p, ...p];
})();
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

function noise(x: number, y: number) {
  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);
  const t = (i + j) * G2;
  const x0 = x - (i - t);
  const y0 = y - (j - t);
  const i1 = x0 > y0 ? 1 : 0;
  const j1 = 1 - i1;
  const corners: [number, number, number][] = [
    [x0, y0, PERM[(i & 255) + PERM[j & 255]]],
    [x0 - i1 + G2, y0 - j1 + G2, PERM[((i + i1) & 255) + PERM[(j + j1) & 255]]],
    [x0 - 1 + 2 * G2, y0 - 1 + 2 * G2, PERM[((i + 1) & 255) + PERM[(j + 1) & 255]]],
  ];
  let n = 0;
  for (const [cx, cy, h] of corners) {
    const f = 0.5 - cx * cx - cy * cy;
    if (f > 0) {
      const g = GRAD[h & 7];
      n += f ** 4 * (g[0] * cx + g[1] * cy);
    }
  }
  return 70 * n;
}

/* ─── The field ───────────────────────────────────────────────────────── */

type Particle = { x: number; y: number; life: number };

const DENSITY = 1 / 180; // particles per CSS px²
const SCALE = 0.0032; // noise frequency: lower = broader currents
const SPEED = 0.9;
const TRAIL = 0.07; // how quickly trails fade each frame

/**
 * Particles drifting on a slow noise current, leaving short fading trails
 * that gather into flowing lines: warm paper on ink.
 * Canvas 2D; animates only while its card side faces the viewer, and with
 * reduced motion shows a single pre-simulated still.
 */
export default function FlowField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stepRef = useRef<((draw: boolean) => void) | null>(null);
  const visible = useFaceVisible();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;

    const style = getComputedStyle(document.documentElement);
    const ink = style.getPropertyValue("--color-ink").trim();
    const paper = style.getPropertyValue("--color-card").trim();

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.scale(dpr, dpr);
    ctx.fillStyle = ink;
    ctx.fillRect(0, 0, w, h);

    const spawn = (p?: Particle): Particle => {
      const next = p ?? ({} as Particle);
      next.x = Math.random() * w;
      next.y = Math.random() * h;
      next.life = 80 + Math.random() * 160;
      return next;
    };
    const particles = Array.from({ length: Math.round(w * h * DENSITY) }, () => spawn());
    let time = 0;

    const step = (draw: boolean) => {
      time += 0.0016;
      if (draw) {
        ctx.globalAlpha = TRAIL;
        ctx.fillStyle = ink;
        ctx.fillRect(0, 0, w, h);
      }
      const path = new Path2D();
      for (const p of particles) {
        const angle = noise(p.x * SCALE, p.y * SCALE + time) * Math.PI * 2;
        const nx = p.x + Math.cos(angle) * SPEED;
        const ny = p.y + Math.sin(angle) * SPEED;
        if (draw) {
          path.moveTo(p.x, p.y);
          path.lineTo(nx, ny);
        }
        p.x = nx;
        p.y = ny;
        if (--p.life < 0 || nx < 0 || nx > w || ny < 0 || ny > h) spawn(p);
      }
      if (draw) {
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = paper;
        ctx.stroke(path);
        ctx.globalAlpha = 1;
      }
    };
    stepRef.current = step;

    // Pre-simulate so the lines have already formed on first sight.
    for (let i = 0; i < 90; i++) step(i > 40);

    return () => {
      stepRef.current = null;
    };
  }, []);

  // Animate only while this card side faces the viewer (and motion is welcome).
  useEffect(() => {
    if (!visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const loop = () => {
      stepRef.current?.(true);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [visible]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
