import type L from "leaflet";

export interface MapControllerCallbacks {
  onLoadingChange: (loading: boolean) => void;
  onEmptyChange: (isEmpty: boolean) => void;
  onZoomChange: (zoom: number) => void;
  getColourByStatus: () => boolean;
  getPanOnMarker: () => boolean;
  getPanOnCluster: () => boolean;
}

export type ClusterMouseEvent = L.LeafletEvent & { layer: L.MarkerCluster };
