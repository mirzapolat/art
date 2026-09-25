import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Modulo that stays positive for negative numbers: mod(-1, 3) === 2. */
export function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}
