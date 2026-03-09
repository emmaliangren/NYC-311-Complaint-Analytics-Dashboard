import type L from "leaflet";

export const NYC_CENTER: L.LatLngExpression = [40.7128, -74.006];
export const NYC_BOUNDS: L.LatLngBoundsExpression = [
  [40.35, -74.4],
  [41.0, -73.55],
];

export const DEFAULT_ZOOM = 10;
export const MAX_ZOOM = 18;
export const MIN_ZOOM = 10;

export const BOUNDS_VISCOSITY = 0.8;

export const ZOOM_SNAP = 2;
export const ZOOM_DELTA = 2;
export const WHEEL_DEBOUNCE_TIME = 120;
export const PAN_RERANK_DEBOUNCE = 300;
export const RECOLOUR_DELAY = 80;
export const PAN_DURATION = 0.4;
export const PAN_EASING = 0.15;

export const MAP_OPTIONS: L.MapOptions = {
  zoomControl: false,
  maxBounds: NYC_BOUNDS,
  maxBoundsViscosity: BOUNDS_VISCOSITY,
  minZoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM,
  zoomSnap: ZOOM_SNAP,
  zoomDelta: ZOOM_DELTA,
  wheelDebounceTime: WHEEL_DEBOUNCE_TIME,
  zoomAnimation: true,
  fadeAnimation: true,
  markerZoomAnimation: true,
};
export const REFRESH_INTERVAL =
  (Number(import.meta.env.VITE_REFRESH_INTERVAL_SECONDS) || 3600) * 1000;

export const CHUNK_SIZE = 200;
export const MAP_TESTID = "cluster-map";
export const WRAPPER_TESTID = "cluster-map-wrapper";
export const ROUNDED_BORDER = "rounded";
export const BG_RED_500 = "bg-red-500";
export const LOADING_LABEL = "Loading complaints…";

export const TILE_LIGHT = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_DARK = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

export const TILE_ATTRIBUTION_LIGHT =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
export const TILE_ATTRIBUTION_DARK =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

export const STATUS_STYLES: Record<string, { dot: string; pill: string }> = {
  Open: {
    dot: "bg-orange-400",
    pill: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  },
  "In Progress": {
    dot: "bg-purple-400",
    pill: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  },
  Assigned: {
    dot: "bg-purple-400",
    pill: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  },
  Started: {
    dot: "bg-yellow-400",
    pill: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  Closed: {
    dot: "bg-slate-400",
    pill: "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
  Pending: {
    dot: "bg-pink-400",
    pill: "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  },
};

export const DEFAULT_STATUS_STYLE = {
  dot: "bg-slate-400",
  pill: "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export const COLOUR1 = "rgba(200,60,60,0.7)";
export const COLOUR2 = "rgba(190,150,30,0.7)";
export const COLOUR3 = "rgba(40,160,90,0.7)";

export const SIZE1 = 50;
export const SIZE2 = 40;
export const SIZE3 = 30;

export const BG_DARK = "#0d0d0d";
export const BG_LIGHT = "#f2efe9";
export const FADE_DARK = "#0d0d0d";
export const FADE_LIGHT = "#f8f9fb";

export const POPUP_BG_DARK = "#1e1e2e";
export const POPUP_TEXT_DARK = "#e2e8f0";
export const POPUP_SHADOW_DARK = "0 4px 12px rgba(0,0,0,0.5)";
export const POPUP_BORDER_RADIUS = "2px";

export const TIMEOUT = 3000;
export const MIN_LOAD_MS = 3000;
export const LOAD_TIMEOUT = { timeout: 5000 };
