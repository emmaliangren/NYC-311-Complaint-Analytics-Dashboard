import Loader from "@/components/ui/Loader";
import type { LoadingOverlayProps } from "@/types/ClusterMap";
import { LOADING_LABEL } from "@/components/feature/ClusterMap/lib/constants";

const LoadingOverlay = ({ visible, label = LOADING_LABEL }: LoadingOverlayProps) => (
  <div
    className="absolute inset-0 z-[1000] flex items-center justify-center rounded bg-white/80 dark:bg-[#0a1628]/80 transition-opacity duration-200"
    style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
  >
    {visible && <Loader showLabel={false} label={label} />}
  </div>
);

export default LoadingOverlay;
