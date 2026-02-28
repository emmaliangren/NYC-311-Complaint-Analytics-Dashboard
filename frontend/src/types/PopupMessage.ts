export type PopupVariant = "info" | "success" | "warning" | "error";

export interface PopupProps {
  message: string;
  variant?: PopupVariant;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}
