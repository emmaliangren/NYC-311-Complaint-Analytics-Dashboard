import { FiCompass } from "react-icons/fi";
import Button from "@/components/ui/Button";
import { ZOOM_BUTTONS } from "./constants";
import Divider from "./Divider";
import Tooltip from "./Tooltip";
import type { ZoomPanelProps } from "./types";

const ZoomPanel = ({
  zoomIn,
  zoomOut,
  resetView,
  disableZoomIn,
  disableZoomOut,
}: ZoomPanelProps) => {
  const actions = { zoomIn, zoomOut };
  const disabled = { disableZoomIn, disableZoomOut };

  return (
    <div className="absolute right-3 top-3 z-[800] flex flex-col gap-2">
      <div className="flex flex-col overflow-hidden rounded border border-slate-200 bg-white/85 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-[#0d0d0d]/80">
        {ZOOM_BUTTONS.map(({ key, icon: Icon, action, disabledKey, ariaLabel }, i) => (
          <div key={key}>
            {i > 0 && <Divider />}
            <Button
              aria-label={ariaLabel}
              onClick={actions[action]}
              disabled={disabled[disabledKey]}
              variant="icon"
              className="bg-transparent text-slate-700 transition hover:bg-white/40 active:bg-white/60 disabled:opacity-40 disabled:hover:bg-transparent dark:text-slate-200 dark:hover:bg-white/10 dark:active:bg-white/20 dark:disabled:hover:bg-transparent"
            >
              <Icon size={18} />
            </Button>
          </div>
        ))}
      </div>
      <div className="group relative">
        <div className="overflow-hidden rounded border border-slate-200 bg-white/85 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-[#0d0d0d]/80">
          <Button
            aria-label="Reset map view"
            onClick={resetView}
            variant="icon"
            className="bg-transparent text-slate-700 transition hover:bg-white/40 active:bg-white/60 dark:text-slate-200 dark:hover:bg-white/10 dark:active:bg-white/20"
          >
            <FiCompass size={18} />
          </Button>
        </div>
        <Tooltip label="Reset" />
      </div>
    </div>
  );
};

export default ZoomPanel;
