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
