import { FiPlus, FiMinus } from "react-icons/fi";
import type { IconType } from "react-icons";

interface ZoomButtonConfig {
  key: string;
  icon: IconType;
  action: "zoomIn" | "zoomOut";
  disabledKey: "disableZoomIn" | "disableZoomOut";
}

export const ZOOM_BUTTONS: ZoomButtonConfig[] = [
  { key: "in", icon: FiPlus, action: "zoomIn", disabledKey: "disableZoomIn" },
  { key: "out", icon: FiMinus, action: "zoomOut", disabledKey: "disableZoomOut" },
];
