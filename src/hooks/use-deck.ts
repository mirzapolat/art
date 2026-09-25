import { useEffect, useState } from "react";
import { mod } from "@/lib/utils";

export type Deck = {
  /** Unbounded turn counter; the card is rotated `step × 180°`. */
  step: number;
  /** Slide on the side facing the viewer. */
  slide: number;
  /** Slide on the side that just turned away. */
  prev: number;
  /** Length of the current turn in seconds — shorter while turns are queued. */
  seconds: number;
  /** Bumped when a new request arrives mid-turn: the running turn should hurry. */
  rush: number;
};

type Move = { dir: 1 | -1 } | { to: number };

/** Turns requested during a flip wait here; more than this are dropped. */
const MAX_QUEUED = 4;
/** A turn with more turns waiting behind it plays this much faster. */
export const HURRY = 2.2;

/**
 * Deck navigation with a queue: a request that arrives while the card is
 * turning never interrupts it. The running turn speeds up, and the waiting
 * turns play back to back at a quicker pace. Jumping to a slide several
 * steps away riffles through the slides in between.
 */
export function useDeck(count: number, flipSeconds: number) {
  const [deck, setDeck] = useState<Deck>({ step: 0, slide: 0, prev: 0, seconds: flipSeconds, rush: 0 });
  const [queue] = useState(() => createQueue(count, setDeck));

  useEffect(() => queue.setFlipSeconds(flipSeconds), [queue, flipSeconds]);
  useEffect(() => () => queue.dispose(), [queue]);

  return { deck, turn: queue.turn, goTo: queue.goTo };
}

function createQueue(count: number, onChange: (deck: Deck) => void) {
  let deck: Deck = { step: 0, slide: 0, prev: 0, seconds: 1, rush: 0 };
  let flipSeconds = 1;
  let busy = false;
  let rushed = false;
  let endsAt = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const pending: Move[] = [];

  function settleIn(ms: number) {
    clearTimeout(timer);
    endsAt = performance.now() + ms;
    timer = setTimeout(() => {
      busy = false;
      run();
    }, ms);
  }

  function run() {
    if (busy) return;
    const move = pending.shift();
    if (!move) return;

    let dir: 1 | -1;
    if ("to" in move) {
      if (move.to === deck.slide) return run();
      dir = move.to > deck.slide ? 1 : -1;
      // Not there yet after this step? Keep the jump at the front of the line.
      if (mod(deck.slide + dir, count) !== move.to) pending.unshift(move);
    } else {
      dir = move.dir;
    }

    const hurry = pending.length > 0;
    const seconds = hurry ? flipSeconds / HURRY : flipSeconds;
    deck = { ...deck, step: deck.step + dir, slide: mod(deck.slide + dir, count), prev: deck.slide, seconds };
    onChange(deck);
    busy = true;
    rushed = hurry;
    settleIn(seconds * 1000);
  }

  function push(move: Move) {
    if (pending.length >= MAX_QUEUED) return;
    pending.push(move);
    if (busy && !rushed) {
      // Hurry the turn already in flight so the queue starts sooner.
      rushed = true;
      deck = { ...deck, rush: deck.rush + 1 };
      onChange(deck);
      settleIn(Math.max(0, endsAt - performance.now()) / HURRY);
    }
    run();
  }

  return {
    turn: (dir: 1 | -1) => push({ dir }),
    goTo: (to: number) => push({ to }),
    setFlipSeconds: (s: number) => {
      flipSeconds = s;
    },
    dispose: () => {
      clearTimeout(timer);
      busy = false;
      pending.length = 0;
    },
  };
}

