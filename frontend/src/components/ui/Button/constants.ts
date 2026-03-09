import type { ButtonSize, ButtonVariant } from "@/types/Button";

export const BUTTON_TEXT = "Test button";
export const BUTTON_COLOUR_STYLES = {
  PRIMARY: "bg-indigo-600",
  SECONDARY: "bg-white",
};

export const BUTTON_SIZE_STYLES = {
  SMALL: "text-sm",
  MEDIUM: "text-base",
  LARGE: "text-lg",
};

export const DEFAULT_BUTTON_CLASS = "rounded-xl";

export const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 rounded-xl",
  secondary: "bg-white text-gray-900 ring-1 ring-gray-300 shadow-sm hover:bg-gray-50 rounded-xl",
  icon: "",
  none: "",
};

export const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-8 py-3.5 text-lg",
};

export const ICON_SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
};
