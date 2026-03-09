import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const logError = (error: unknown) => {
  console.error(getError(error));
};

export const getError = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};

export const formatTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};
