import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Leading-edge debounce for cursor moves (no extra deps). */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (t !== undefined) clearTimeout(t);
    t = setTimeout(() => {
      t = undefined;
      fn(...args);
    }, ms);
  };
}
