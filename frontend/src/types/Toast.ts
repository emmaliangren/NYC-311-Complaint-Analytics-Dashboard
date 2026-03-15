export type ToastVariant = "info" | "success" | "warning" | "error" | "emerald";

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}
