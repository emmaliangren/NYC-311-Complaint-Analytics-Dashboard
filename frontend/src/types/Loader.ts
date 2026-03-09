export type LoaderSize = "sm" | "md" | "lg";

export interface LoaderProps {
  label?: string;
  size?: LoaderSize;
  showSpinner?: boolean;
  showLabel?: boolean;
  className?: string;
}
