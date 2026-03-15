import { FiX, FiInfo, FiCheckCircle, FiAlertTriangle, FiAlertCircle } from "react-icons/fi";
import { clsx } from "clsx";
import type { ToastProps, ToastVariant } from "@/types/Toast";
import { useEffect, useState, type ReactNode } from "react";
import Button from "@/components/ui/Button";

const variantStyles: Record<ToastVariant, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-800",
  success: "border-green-200 bg-green-50 text-green-800",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-grey-200 bg-grey-100 text-grey-700",
  error: "border-red-200 bg-red-50 text-red-800",
};

// const variantBarStyles: Record<ToastVariant, string> = {
//   info: "bg-blue-300",
//   success: "bg-green-300",
//   warning: "bg-stone-400",
//   error: "bg-red-300",
//   emerald: "bg-emerald-300",
// };

const variantIcons: Record<ToastVariant, ReactNode> = {
  info: <FiInfo />,
  success: <FiCheckCircle />,
  warning: <FiAlertTriangle />,
  error: <FiAlertCircle />,
  emerald: <FiAlertTriangle />,
};

export default function ToastMessage({
  message,
  variant = "info",
  visible,
  onClose,
  duration,
}: ToastProps) {
  const [_progress, setProgress] = useState(100);

  useEffect(() => {
    if (!visible || !duration) return;
    setProgress(100);

    const interval = setInterval(() => {
      setProgress((p) => Math.max(0, p - 100 / (duration / 100)));
    }, 100);

    const timer = setTimeout(onClose, duration);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [visible, duration, onClose]);

  return (
    <div
      className={clsx(
        "fixed bottom-6 right-6 z-50 flex max-w-sm flex-col rounded border-md shadow-md transition-all duration-300 overflow-hidden",
        variantStyles[variant],
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      role="alert"
    >
      <div className="flex items-center gap-3 px-5 py-3.5">
        <span className="text-lg">{variantIcons[variant]}</span>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <Button variant="secondary" className="ml-2 rounded-lg p-1 opacity-60" onClick={onClose}>
          <FiX />
        </Button>
      </div>
    </div>
  );
}
