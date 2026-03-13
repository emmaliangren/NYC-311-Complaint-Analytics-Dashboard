import type { IconType } from "react-icons";

export interface EdgeFadeProps {
  colour: string;
}

export interface ZoomPanelProps {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  disableZoomIn: boolean;
  disableZoomOut: boolean;
}

export interface TooltipProps {
  label: string;
}

export interface EmptyStateProps {
  onLoadMock: () => void;
}

export interface LoadingOverlayProps {
  visible: boolean;
  label?: string;
}

type ZoomAction = "zoomIn" | "zoomOut";
type DisabledKey = "disableZoomIn" | "disableZoomOut";

export interface ZoomButtonConfig {
  key: string;
  icon: IconType;
  action: ZoomAction;
  disabledKey: DisabledKey;
  ariaLabel: string;
}
