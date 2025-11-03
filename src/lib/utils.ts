import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number with Chilean thousand separators (dots)
 * Example: 1000000 -> "1.000.000"
 */
export function formatChileanNumber(value: string | number): string {
  const numericValue = String(value).replace(/\D/g, '');
  if (!numericValue) return '';
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Parses a Chilean formatted number back to a plain number
 * Example: "1.000.000" -> 1000000
 */
export function parseChileanNumber(value: string): number {
  const cleaned = value.replace(/\./g, '');
  return parseInt(cleaned, 10) || 0;
}
