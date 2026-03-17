import type L from "leaflet";
import type { Status } from "@/types/api";
import type { GeoPoint } from "@/types/geopoints";

export const NYC_CENTER: L.LatLngExpression = [40.7128, -74.006];
export const NYC_BOUNDS: L.LatLngBoundsExpression = [
  [40.35, -74.4],
  [41.0, -73.55],
];

export const TOAST_TIMER = 8000;
export const TOAST_MESSAGE = "No complaints match.";

export const MAX_ZOOM = 18;
export const MIN_ZOOM = 10;

export const FIFTEEN_SECONDS = 15_000;
export const TEN_SECONDS = 10_000;
export const DEFAULT_REFRESH_INTERVAL_SECONDS = 3600;
export const DEFAULT_REFRESH_INTERVAL_MS = DEFAULT_REFRESH_INTERVAL_SECONDS * 1000;
export const REFRESH_INTERVAL =
  (Number(import.meta.env.VITE_REFRESH_INTERVAL_SECONDS) || DEFAULT_REFRESH_INTERVAL_SECONDS) *
  1000;
export const MIN_LOAD_MS = 300;
export const PAN_RERANK_DEBOUNCE = 300;
export const BG_COLOUR = "#f2efe9";
export const MAP_TESTID = "cluster-map";
export const WRAPPER_TESTID = "cluster-map-wrapper";
export const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const MAP_OPTIONS: L.MapOptions = {
  zoomControl: false,
  maxBounds: NYC_BOUNDS,
  maxBoundsViscosity: 0.8,
  minZoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM,
  zoomSnap: 1,
  zoomDelta: 1,
  wheelDebounceTime: 120,
  zoomAnimation: true,
  fadeAnimation: true,
  markerZoomAnimation: true,
};

export const TILE_OPTIONS: L.TileLayerOptions = {
  updateWhenZooming: false,
  updateWhenIdle: true,
  keepBuffer: 8,
};

export const CLUSTER_OPTIONS: L.MarkerClusterGroupOptions = {
  chunkedLoading: false,
  animate: false,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: false,
  spiderfyOnMaxZoom: false,
  spiderfyDistanceMultiplier: 1.8,
  maxClusterRadius: (zoom: number) => {
    if (zoom >= 16) return 60;
    if (zoom >= 14) return 80;
    if (zoom >= 12) return 100;
    return 120;
  },
};

export const TEXT_LOAD_MOCK_DATA = "Load mock data";
export const TEXT_NO_COMPLAINT_DATA_AVAILABLE = "No complaints match.";
export const TEXT_COORDINATES = "Coordinates";
export const THEME_MUTATION_ATTR = "class";
export const ONE_HOUR_MS = 3_600_000;
export const TEST_WAITFOR_TIMEOUT_MS = 3_000;

export const STATUSES: Status[] = [
  "Open",
  "In Progress",
  "Assigned",
  "Started",
  "Closed",
  "Pending",
  "default",
] as const;

// Testing

export const POINTS: GeoPoint[] = [
  {
    uniqueKey: "1",
    latitude: 40.71,
    longitude: -74.0,
    complaintType: "Noise - Residential",
    borough: "Manhattan",
    createdDate: "2025-03-01",
    status: "Open",
  },
  {
    uniqueKey: "null-lat",
    latitude: null as unknown as number,
    longitude: -74.0,
    complaintType: "Homeless Encampment",
    borough: "Manhattan",
    createdDate: "2025-03-01",
    status: "Open",
  },
  {
    uniqueKey: "null-lng",
    latitude: 40.71,
    longitude: null as unknown as number,
    complaintType: "Heat/Hot Water",
    borough: "Manhattan",
    createdDate: "2025-03-01",
    status: "Open",
  },
];

export const POINT = POINTS[0];
