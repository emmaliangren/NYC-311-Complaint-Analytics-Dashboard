import { FiX, FiInfo, FiCheckCircle, FiAlertTriangle, FiAlertCircle } from "react-icons/fi";
import { clsx } from "clsx";
import type { PopupProps, PopupVariant } from "@/types/PopupMessage";
import { useEffect, type ReactNode } from "react";
import Button from "./Button";

// Colour scheme per variant
const variantStyles: Record<PopupVariant, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-800",
  success: "border-green-200 bg-green-50 text-green-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-red-200 bg-red-50 text-red-800",
};

// Icon per variant
const variantIcons: Record<PopupVariant, ReactNode> = {
  info: <FiInfo />,
  success: <FiCheckCircle />,
  warning: <FiAlertTriangle />,
  error: <FiAlertCircle />,
};

/**
 * Popup message with icon
 * @param message - Message to display
 * @param variant - Type of popup (info, success, warning, error)
 * @param visible - Whether the popup is visible
 * @param onClose - Callback function to close the popup
 * @param duration - Optional duration for the popup to disappear
 */
export default function PopupMessage({
  message,
  variant = "info",
  visible,
  onClose,
  duration,
}: PopupProps) {
  useEffect(() => {
    // Don't need to set a timer if the popup isn't visible or shouldn't automatically disappear
    if (!visible || !duration) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onClose]);

  return (
    <div
      className={clsx(
        "fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-xl border px-5 py-3.5 shadow-lg transition-all duration-300",
        variantStyles[variant],
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      )}
      role="alert"
    >
      <span className="text-lg">{variantIcons[variant]}</span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <Button variant="secondary" className="ml-2 rounded-lg p-1 opacity-60" onClick={onClose}>
        <FiX />
      </Button>
    </div>
  );
}
