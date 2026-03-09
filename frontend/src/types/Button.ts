import type { ComponentProps } from "react";

export type ButtonVariant = "primary" | "secondary" | "icon" | "none";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}
