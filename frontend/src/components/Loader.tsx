import { cn } from "@/lib/util";
import type { LoaderProps, LoaderSize } from "@/types/Loader";

const sizeStyles: Record<LoaderSize, string> = {
  sm: "size-5 border-2",
  md: "size-8 border-3",
  lg: "size-12 border-4",
};

/**
 * spinning loader
 * @param label - optional text displayed below the spinner
 * @param size - size of the spinner (sm, md, lg)
 */
export default function Loader({ label, size = "md", showSpinner = true, className }: LoaderProps) {
  const displayLabel = label ?? (!showSpinner ? "Loading…" : undefined);

  return (
    <div role="status" className={cn("flex flex-col items-center gap-3", className)}>
      {showSpinner && (
        <div
          className={cn(
            "animate-spin rounded-full border-gray-200 border-t-indigo-600",
            sizeStyles[size]
          )}
        />
      )}
      {displayLabel && <p className="text-sm text-gray-600">{displayLabel}</p>}
      <span className="sr-only">Loading</span>
    </div>
  );
}
