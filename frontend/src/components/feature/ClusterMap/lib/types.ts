import type L from "leaflet";

export interface MapControllerCallbacks {
  onLoadingChange: (loading: boolean) => void;
  onEmptyChange: (isEmpty: boolean) => void;
  onZoomChange: (zoom: number) => void;
  onViewChange?: (atDefault: boolean) => void;
  onPointsChange?: (total: number, filtered: number) => void;
  onViewportCountChange?: (count: number) => void;
  getColourByStatus: () => boolean;
  getPanOnMarker: () => boolean;
  getPanOnCluster: () => boolean;
}

export type ClusterMouseEvent = L.LeafletEvent & { layer: L.MarkerCluster };

export type FilterParams = {
  borough?: string;
  complaintType?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};
