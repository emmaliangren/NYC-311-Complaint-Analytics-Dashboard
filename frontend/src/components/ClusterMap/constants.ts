import type L from "leaflet";

export const NYC_CENTER: L.LatLngExpression = [40.7128, -74.006];
export const NYC_BOUNDS: L.LatLngBoundsExpression = [
  [40.35, -74.4],
  [41.0, -73.55],
];
export const DEFAULT_ZOOM = 11;
export const REFRESH_INTERVAL =
  (Number(import.meta.env.VITE_REFRESH_INTERVAL_SECONDS) || 300) * 1000;

// TESTING
export const MAP_TESTID = "cluster-map";
export const WRAPPER_TESTID = "cluster-map-wrapper";
export const MAP_CLASS = "rounded-xl";
export const CUSTOM_CLASS = "bg-red-500";
export const LOADING_LABEL = "Loading complaints…";
