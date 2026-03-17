import type { FeatureGroup, MarkerClusterGroup } from "leaflet";
import type { ClusterLayer, ClusterMouseEvent, FGLayer } from "./types";

export function toMarkerClusterGroup(layer: unknown): MarkerClusterGroup {
  return layer as MarkerClusterGroup;
}

export function getFeatureGroup(cluster: MarkerClusterGroup): FeatureGroup | undefined {
  return (cluster as unknown as FGLayer)._featureGroup;
}

export function toClusterMouseEvent(e: unknown): ClusterMouseEvent {
  return e as unknown as ClusterMouseEvent;
}

export function toClusterLayer(layer: unknown): ClusterLayer {
  return layer as unknown as ClusterLayer;
}
