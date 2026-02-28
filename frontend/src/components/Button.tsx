import type { ButtonProps, ButtonVariant, ButtonSize } from "@/types/Button";
import { cn } from "@/lib/util";

// Colour and shadow styles per variant
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 hover:-translate-y-0.5",
  secondary:
    "bg-white text-gray-900 ring-1 ring-gray-300 shadow-sm hover:bg-gray-50 hover:-translate-y-0.5",
};

// Padding and font-size per size
const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-8 py-3.5 text-lg",
};

/**
 * Customizable Button component
 * A custom button with options for different sizes and styles
 * @param variant - The style of the button (primary, secondary)
 * @param size - Size of button (sm, md, lg)
 */
export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
