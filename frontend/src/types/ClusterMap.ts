import type { GeoPoint } from "@/types/geopoints";
import type { Map } from "leaflet";

export interface ClusterMapProps {
  className?: string;
}

export interface ZoomPanelProps {
  zoomIn: () => Map | undefined;
  zoomOut: () => Map | undefined;
  resetView: () => void;
  disableZoomIn: boolean;
  disableZoomOut: boolean;
}

export interface TooltipProps {
  label: string;
}

export interface MarkerDetailPanelProps {
  point: GeoPoint;
  onClose: () => void;
}

export interface EmptyStateProps {
  onLoadMock: () => void;
}

export interface LoadingOverlayProps {
  visible: boolean;
  label?: string;
}

export interface EdgeFadeProps {
  colour: string;
}
