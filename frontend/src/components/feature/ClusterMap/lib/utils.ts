import L, { divIcon, tileLayer } from "leaflet";
import type { GeoPoint } from "@/types/geopoints";
import {
  COLOUR1,
  COLOUR2,
  COLOUR3,
  SIZE1,
  SIZE2,
  SIZE3,
  POPUP_BG_DARK,
  POPUP_BORDER_RADIUS,
  POPUP_SHADOW_DARK,
  POPUP_TEXT_DARK,
  TILE_ATTRIBUTION_DARK,
  TILE_ATTRIBUTION_LIGHT,
  TILE_DARK,
  TILE_LIGHT,
  PAN_DURATION,
  PAN_EASING,
  BG_DARK,
  BG_LIGHT,
  FADE_DARK,
  FADE_LIGHT,
} from "./constants";

let redMinCount = Infinity;
let yellowMinCount = Infinity;

export function computeRankCutoffs(counts: number[]) {
  if (counts.length === 0) {
    redMinCount = Infinity;
    yellowMinCount = Infinity;
    return;
  }

  const sorted = [...counts].sort((a, b) => b - a);

  redMinCount = sorted.length >= 3 ? sorted[2] : sorted[sorted.length - 1];

  const yellowEnd = Math.min(8, sorted.length);
  if (yellowEnd > 3) {
    yellowMinCount = sorted[yellowEnd - 1];
  } else {
    yellowMinCount = Infinity;
  }
}

const clusterIconCache = new Map<string, L.DivIcon>();
const markerIconCache = new Map<string, L.DivIcon>();

export function clearIconCache() {
  clusterIconCache.clear();
}

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
}

function getTier(count: number): { color: string; size: number; tier: string } {
  if (count >= redMinCount) return { color: COLOUR1, size: SIZE1, tier: "r" };
  if (count >= yellowMinCount) return { color: COLOUR2, size: SIZE2, tier: "y" };
  return { color: COLOUR3, size: SIZE3, tier: "g" };
}

export const clusterIconHex = (cluster: L.MarkerCluster): L.DivIcon => {
  const count = cluster.getChildCount();
  const { color, size, tier } = getTier(count);

  const key = `hex:${tier}:${count}`;
  const cached = clusterIconCache.get(key);
  if (cached) return cached;

  const fontSize = size < 36 ? 11 : 13;
  const s = size + 12;
  const c = s / 2;
  const r = size / 2;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
    return `${c + r * Math.cos(a)},${c + r * Math.sin(a)}`;
  }).join(" ");
  const outerPts = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
    return `${c + (r + 5) * Math.cos(a)},${c + (r + 5) * Math.sin(a)}`;
  }).join(" ");

  const icon = divIcon({
    html: `
    <svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <polygon points="${outerPts}" fill="none" stroke="${color}" stroke-width="0.75" opacity="0.3"/>
      <polygon points="${pts}" fill="${color}" opacity="0.25"/>
      <polygon points="${pts}" fill="none" stroke="${color}" stroke-width="2.5"/>
      <text x="${c}" y="${c}" text-anchor="middle" dominant-baseline="central" fill="${color}" font-weight="700" font-size="${fontSize}" font-family="ui-monospace,monospace">${count}</text>
    </svg>`,
    className: "",
    iconSize: [s, s] as L.PointExpression,
  });
  clusterIconCache.set(key, icon);
  return icon;
};

export const clusterIcon = (cluster: L.MarkerCluster): L.DivIcon => {
  const count = cluster.getChildCount();
  const { color, size, tier } = getTier(count);

  const key = `circle:${tier}:${count}`;
  const cached = clusterIconCache.get(key);
  if (cached) return cached;

  const s = size + 12;
  const c = s / 2;
  const r = size / 2;
  const fontSize = size < 36 ? 11 : 13;
  const text = fmt(count);

  const icon = divIcon({
    html: `
    <svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <circle cx="${c}" cy="${c}" r="${r + 5}" fill="none" stroke="${color}" stroke-width="0.75" opacity="0.3"/>
      <circle cx="${c}" cy="${c}" r="${r}" fill="${color}" opacity="0.85"/>
      <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${color}" stroke-width="2.5"/>
      <text x="${c}" y="${c}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-weight="700" font-size="${fontSize}" font-family="ui-monospace,monospace">${text}</text>
    </svg>`,
    className: "cluster-icon-circle",
    iconSize: [s, s] as L.PointExpression,
    iconAnchor: [s / 2, s / 2] as L.PointExpression,
  });
  clusterIconCache.set(key, icon);
  return icon;
};

if (typeof document !== "undefined" && !document.getElementById("cluster-icon-circle-style")) {
  const style = document.createElement("style");
  style.id = "cluster-icon-circle-style";
  style.textContent = `
    .cluster-icon-circle svg {
      overflow: visible !important;
      transition: filter 0.15s ease;
    }
    .cluster-icon-circle:hover svg {
      filter: brightness(1.4);
    }
    .leaflet-cluster-anim .leaflet-marker-icon,
    .leaflet-cluster-anim .leaflet-marker-shadow {
      transition: transform 0.2s ease-out, opacity 0.2s ease-out !important;
    }
  `;
  document.head.appendChild(style);
}

type FeatureGroupLayer = L.FeatureGroup & { _featureGroup: L.FeatureGroup };

export function collectVisibleClusterCounts(cg: L.MarkerClusterGroup, map: L.Map): number[] {
  const counts: number[] = [];
  let bounds: L.LatLngBounds;
  try {
    bounds = map.getBounds();
  } catch {
    return counts;
  }
  const fg = (cg as unknown as FeatureGroupLayer)._featureGroup;
  if (!fg) return counts;

  fg.eachLayer((layer: L.Layer) => {
    const cluster = layer as L.MarkerCluster;
    if (typeof cluster.getChildCount !== "function") return;
    if (!bounds.contains(cluster.getLatLng())) return;
    counts.push(cluster.getChildCount());
  });

  return counts;
}

export function refreshRankedIcons(cg: L.MarkerClusterGroup, map: L.Map) {
  const counts = collectVisibleClusterCounts(cg, map);
  clearIconCache();
  computeRankCutoffs(counts);
  cg.refreshClusters();
}

export const STATUS_MARKER_COLOURS: Record<string, { normal: string; hovered: string }> = {
  Open: { normal: "rgba(34,197,94,0.85)", hovered: "rgba(22,163,74,1)" },
  "In Progress": { normal: "rgba(168,85,247,0.85)", hovered: "rgba(147,51,234,1)" },
  Assigned: { normal: "rgba(59,130,246,0.85)", hovered: "rgba(37,99,235,1)" },
  Started: { normal: "rgba(234,179,8,0.85)", hovered: "rgba(202,138,4,1)" },
  Closed: { normal: "rgba(148,163,184,0.85)", hovered: "rgba(100,116,139,1)" },
  Pending: { normal: "rgba(234,179,8,0.85)", hovered: "rgba(202,138,4,1)" },
};

const DEFAULT_MARKER_COLOURS = { normal: "rgba(99,102,241,0.85)", hovered: "rgba(79,70,229,1)" };

export function makeMarkerIcon(fill: string, hovered: boolean): L.DivIcon {
  const key = `${fill}:${hovered ? 1 : 0}`;
  const cached = markerIconCache.get(key);
  if (cached) return cached;

  const stroke = hovered ? "white" : "rgba(255,255,255,0.9)";
  const strokeWidth = hovered ? "2" : "1.5";
  const icon = divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="30" viewBox="0 0 22 30">
      <path d="M11 0C4.925 0 0 4.925 0 11c0 7.667 11 19 11 19s11-11.333 11-19c0-6.075-4.925-11-11-11z"
        fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
      <circle cx="11" cy="11" r="4" fill="white" opacity="${hovered ? 1 : 0.9}"/>
    </svg>`,
    className: "",
    iconSize: [22, 30] as L.PointExpression,
    iconAnchor: [11, 30] as L.PointExpression,
    popupAnchor: [0, -32] as L.PointExpression,
  });
  markerIconCache.set(key, icon);
  return icon;
}

export function getMarkerColours(status: string, colourByStatus = true) {
  const colours = colourByStatus
    ? (STATUS_MARKER_COLOURS[status] ?? DEFAULT_MARKER_COLOURS)
    : DEFAULT_MARKER_COLOURS;
  return {
    normal: makeMarkerIcon(colours.normal, false),
    hovered: makeMarkerIcon(colours.hovered, true),
  };
}

export const markerIcon = makeMarkerIcon(DEFAULT_MARKER_COLOURS.normal, false);
export const markerIconHovered = makeMarkerIcon(DEFAULT_MARKER_COLOURS.hovered, true);

const POPUP_STATUS_COLOURS: Record<string, string> = {
  Open: "#16a34a",
  "In Progress": "#9333ea",
  Assigned: "#2563eb",
  Started: "#ca8a04",
  Pending: "#db2777",
  Closed: "#64748b",
};

const POPUP_STATUS_COLOURS_DARK: Record<string, string> = {
  Open: "#4ade80",
  "In Progress": "#c084fc",
  Assigned: "#60a5fa",
  Started: "#fbbf24",
  Pending: "#db2777",
  Closed: "#94a3b8",
};

export const createPopup = (point: GeoPoint, dark = false): string => {
  const colours = dark ? POPUP_STATUS_COLOURS_DARK : POPUP_STATUS_COLOURS;
  const statusColour = colours[point.status] ?? (dark ? "#94a3b8" : "#64748b");
  const titleColour = dark ? "#ffffff" : "#1e1e2e";
  const mutedColour = dark ? "#94a3b8" : "#6b7280";

  return `<div style="font-size:13px;line-height:1.6">
  <span style="color:${titleColour};font-weight:700;display:block">${point.complaintType}</span>
  <span style="color:${mutedColour};display:block">${point.borough}</span>
  <span style="color:${mutedColour};display:block">${point.createdDate}</span>
  <span style="color:${statusColour};font-weight:600;display:block">${point.status}</span>
</div>`;
};

export function markerKey(lat: number, lng: number, type: string): string {
  return `${lat.toFixed(6)},${lng.toFixed(6)},${type}`;
}

export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  ms: number
): T & { cancel(): void } {
  let id: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<T>) => {
    if (id !== null) clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
  debounced.cancel = () => {
    if (id !== null) clearTimeout(id);
  };
  return debounced as T & { cancel(): void };
}

export function throttle<T extends (...args: Parameters<T>) => void>(
  fn: T,
  ms: number
): T & { cancel(): void } {
  let lastRan = 0;
  let id: ReturnType<typeof setTimeout> | null = null;

  const throttled = (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = ms - (now - lastRan);

    if (remaining <= 0) {
      if (id !== null) {
        clearTimeout(id);
        id = null;
      }
      lastRan = now;
      fn(...args);
    } else if (id === null) {
      id = setTimeout(() => {
        lastRan = Date.now();
        id = null;
        fn(...args);
      }, remaining);
    }
  };
  throttled.cancel = () => {
    if (id !== null) clearTimeout(id);
    id = null;
  };
  return throttled as T & { cancel(): void };
}

export const TILE_OPTIONS: L.TileLayerOptions = {
  updateWhenZooming: false,
  updateWhenIdle: true,
  keepBuffer: 8,
};

export function stylePopupDark(popup: HTMLElement | undefined) {
  const wrapper = popup?.querySelector<HTMLElement>(".leaflet-popup-content-wrapper");
  const tip = popup?.querySelector<HTMLElement>(".leaflet-popup-tip");

  if (wrapper) {
    wrapper.style.borderRadius = POPUP_BORDER_RADIUS;
    wrapper.style.background = POPUP_BG_DARK;
    wrapper.style.color = POPUP_TEXT_DARK;
    wrapper.style.boxShadow = POPUP_SHADOW_DARK;
  }
  if (tip) {
    tip.style.background = POPUP_BG_DARK;
  }
}

export function stylePopup(popup: HTMLElement | undefined, isDark: boolean) {
  const wrapper = popup?.querySelector<HTMLElement>(".leaflet-popup-content-wrapper");
  const tip = popup?.querySelector<HTMLElement>(".leaflet-popup-tip");

  if (wrapper) {
    wrapper.style.borderRadius = POPUP_BORDER_RADIUS;
    if (isDark) {
      wrapper.style.background = POPUP_BG_DARK;
      wrapper.style.color = POPUP_TEXT_DARK;
      wrapper.style.boxShadow = POPUP_SHADOW_DARK;
    }
  }
  if (tip && isDark) {
    tip.style.background = POPUP_BG_DARK;
  }
}

export function createTileLayer(isDark: boolean): L.TileLayer {
  return tileLayer(isDark ? TILE_DARK : TILE_LIGHT, {
    attribution: isDark ? TILE_ATTRIBUTION_DARK : TILE_ATTRIBUTION_LIGHT,
    ...TILE_OPTIONS,
  });
}

export function panTo(map: L.Map | null, latlng: L.LatLngExpression) {
  map?.panTo(latlng, {
    animate: true,
    duration: PAN_DURATION,
    easeLinearity: PAN_EASING,
  });
}

export function setBgForTheme(el: HTMLElement | null, isDark: boolean) {
  if (el) el.style.background = isDark ? BG_DARK : BG_LIGHT;
}

export function diffMarkers(
  cluster: L.MarkerClusterGroup,
  map: L.Map,
  current: Map<string, L.Marker>,
  next: Map<string, L.Marker>,
  toAdd: L.Marker[]
) {
  const nextKeys = new Set(next.keys());
  const toRemove: L.Marker[] = [];
  for (const [key, marker] of current) {
    if (!nextKeys.has(key)) toRemove.push(marker);
  }

  if (toRemove.length > 0) cluster.removeLayers(toRemove);
  if (toAdd.length > 0) cluster.addLayers(toAdd);

  refreshRankedIcons(cluster, map);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      refreshRankedIcons(cluster, map);
    });
  });
}

export function tryRefreshIcons(cluster: L.MarkerClusterGroup | null, map: L.Map | null) {
  if (cluster && map) refreshRankedIcons(cluster, map);
}

export function getFade(isDark: boolean) {
  return isDark ? FADE_DARK : FADE_LIGHT;
}
