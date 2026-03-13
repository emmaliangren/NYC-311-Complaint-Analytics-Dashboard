import { FiPlus, FiMinus } from "react-icons/fi";
import type { ZoomButtonConfig } from "./types";

export const ZOOM_BUTTONS: ZoomButtonConfig[] = [
  {
    key: "in",
    icon: FiPlus,
    action: "zoomIn",
    disabledKey: "disableZoomIn",
    ariaLabel: "Zoom in",
  },
  {
    key: "out",
    icon: FiMinus,
    action: "zoomOut",
    disabledKey: "disableZoomOut",
    ariaLabel: "Zoom out",
  },
];

export const LOADING_LABEL = "Loading complaints…";
