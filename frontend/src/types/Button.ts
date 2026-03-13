import type { ComponentProps } from "react";

export type ButtonVariant = "primary" | "secondary" | "icon" | "none";
export type ButtonSize = "sm" | "md" | "lg";

type BaseButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export type ButtonProps = BaseButtonProps &
  (
    | { variant: "icon"; "aria-label": string }
    | { variant?: Exclude<ButtonVariant, "icon">; "aria-label"?: string }
  );
