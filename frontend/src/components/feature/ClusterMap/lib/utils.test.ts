import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import L from "leaflet";
import {
  computeRankCutoffs,
  clearIconCache,
  clusterIconHex,
  clusterIcon,
  collectVisibleClusterCounts,
  refreshRankedIcons,
  makeMarkerIcon,
  getMarkerColours,
  createPopup,
  markerKey,
  debounce,
  throttle,
  panTo,
  diffMarkers,
  tryRefreshIcons,
  STATUS_MARKER_COLOURS,
  markerIcon,
  markerIconHovered,
  stylePopup,
} from "./utils";
import type { GeoPoint } from "@/types/geopoints";

const mockCluster = (count: number): Parameters<typeof clusterIcon>[0] =>
  ({ getChildCount: () => count }) as Parameters<typeof clusterIcon>[0];

const mockGeoPoint = (overrides: Partial<GeoPoint> = {}): GeoPoint => ({
  uniqueKey: "test-key",
  latitude: 40.7128,
  longitude: -74.006,
  complaintType: "Noise",
  borough: "Manhattan",
  createdDate: "2024-01-01",
  status: "Open",
  ...overrides,
});

describe("computeRankCutoffs", () => {
  beforeEach(() => {
    clearIconCache();
    computeRankCutoffs([]);
  });

  it("resets cutoffs on empty array", () => {
    computeRankCutoffs([]);
    const icon = clusterIcon(mockCluster(1));
    expect(icon).toBeDefined();
  });

  it("sets cutoffs with 3+ counts", () => {
    computeRankCutoffs([100, 50, 30, 20, 10, 5, 3, 2]);
    const iconLarge = clusterIcon(mockCluster(100));
    const iconMed = clusterIcon(mockCluster(20));
    const iconSmall = clusterIcon(mockCluster(1));
    expect(iconLarge).not.toBe(iconSmall);
    expect(iconMed).not.toBe(iconSmall);
  });

  it("handles fewer than 3 counts", () => {
    computeRankCutoffs([10, 5]);
    const icon = clusterIcon(mockCluster(10));
    expect(icon).toBeDefined();
  });

  it("handles exactly 3 counts", () => {
    computeRankCutoffs([100, 50, 10]);
    const icon = clusterIcon(mockCluster(50));
    expect(icon).toBeDefined();
  });

  it("sets yellowMinCount to Infinity when yellowEnd <= 3", () => {
    computeRankCutoffs([10, 5, 3]);
    clearIconCache();
    const smallIcon = clusterIcon(mockCluster(4));
    expect(smallIcon.options.html).toContain("4");
  });
});

describe("clearIconCache", () => {
  it("forces new icon creation after clearing", () => {
    computeRankCutoffs([100, 50, 10]);
    const icon1 = clusterIcon(mockCluster(5));
    clearIconCache();
    const icon2 = clusterIcon(mockCluster(5));
    expect(icon1).not.toBe(icon2);
  });
});

describe("clusterIconHex", () => {
  beforeEach(() => {
    clearIconCache();
    computeRankCutoffs([]);
  });

  it("returns a DivIcon with SVG polygon html", () => {
    const icon = clusterIconHex(mockCluster(5));
    expect(icon.options.html).toContain("<polygon");
    expect(icon.options.html).toContain("5");
  });

  it("returns cached icon on second call with same count", () => {
    const icon1 = clusterIconHex(mockCluster(5));
    const icon2 = clusterIconHex(mockCluster(5));
    expect(icon1).toBe(icon2);
  });

  it("uses larger font for larger sizes", () => {
    computeRankCutoffs([1000, 500, 100]);
    clearIconCache();
    const icon = clusterIconHex(mockCluster(1000));
    expect(icon.options.html).toContain('font-size="13"');
  });

  it("uses smaller font for smaller sizes", () => {
    computeRankCutoffs([]);
    clearIconCache();
    const icon = clusterIconHex(mockCluster(1));
    expect(icon.options.html).toContain('font-size="11"');
  });
});

describe("clusterIcon", () => {
  beforeEach(() => {
    clearIconCache();
    computeRankCutoffs([]);
  });

  it("returns a DivIcon with SVG circle html", () => {
    const icon = clusterIcon(mockCluster(10));
    expect(icon.options.html).toContain("<circle");
    expect(icon.options.html).toContain("10");
  });

  it("returns cached icon on second call", () => {
    const icon1 = clusterIcon(mockCluster(10));
    const icon2 = clusterIcon(mockCluster(10));
    expect(icon1).toBe(icon2);
  });

  it("formats counts >= 1000 as k", () => {
    const icon = clusterIcon(mockCluster(1500));
    expect(icon.options.html).toContain("1.5k");
  });

  it("shows raw number for counts < 1000", () => {
    const icon = clusterIcon(mockCluster(999));
    expect(icon.options.html).toContain("999");
  });

  it("produces different icons for different tiers", () => {
    computeRankCutoffs([100, 50, 30, 20, 10, 5, 3, 2]);
    clearIconCache();
    const red = clusterIcon(mockCluster(100));
    const green = clusterIcon(mockCluster(1));
    expect(red.options.html).not.toEqual(green.options.html);
  });
});

describe("makeMarkerIcon", () => {
  it("returns a DivIcon with SVG path", () => {
    const icon = makeMarkerIcon("red", false);
    expect(icon.options.html).toContain("<path");
    expect(icon.options.html).toContain('fill="red"');
  });

  it("caches icons by fill + hovered state", () => {
    const a = makeMarkerIcon("blue", false);
    const b = makeMarkerIcon("blue", false);
    expect(a).toBe(b);
  });

  it("returns different icons for hovered vs normal", () => {
    const normal = makeMarkerIcon("blue", false);
    const hovered = makeMarkerIcon("blue", true);
    expect(normal).not.toBe(hovered);
  });

  it("uses white stroke for hovered", () => {
    const icon = makeMarkerIcon("red", true);
    expect(icon.options.html).toContain('stroke="white"');
  });

  it("uses translucent stroke for normal", () => {
    const icon = makeMarkerIcon("red", false);
    expect(icon.options.html).toContain('stroke="rgba(255,255,255,0.9)"');
  });
});

describe("getMarkerColours", () => {
  it("returns status-based colours when colourByStatus is true", () => {
    const result = getMarkerColours("Open", true);
    expect(result.normal).toBeDefined();
    expect(result.hovered).toBeDefined();
  });

  it("returns default colours when colourByStatus is false", () => {
    const result = getMarkerColours("Open", false);
    expect(result.normal).toBeDefined();
  });

  it("returns default colours for unknown status", () => {
    const result = getMarkerColours("Unknown", true);
    expect(result.normal).toBeDefined();
  });

  it("defaults colourByStatus to true", () => {
    const result = getMarkerColours("Open");
    expect(result.normal).toBeDefined();
  });
});

describe("markerIcon / markerIconHovered exports", () => {
  it("exports pre-built default icons", () => {
    expect(markerIcon).toBeDefined();
    expect(markerIconHovered).toBeDefined();
    expect(markerIcon).not.toBe(markerIconHovered);
  });
});

describe("createPopup", () => {
  const point = mockGeoPoint();

  it("returns HTML string with complaint type", () => {
    const html = createPopup(point);
    expect(html).toContain("Noise");
  });

  it("includes borough and date", () => {
    const html = createPopup(point);
    expect(html).toContain("Manhattan");
    expect(html).toContain("2024-01-01");
  });

  it("includes status", () => {
    const html = createPopup(point);
    expect(html).toContain("Open");
  });
});

describe("markerKey", () => {
  it("creates a key from lat, lng, type", () => {
    expect(markerKey(40.7128, -74.006, "Noise")).toBe("40.712800,-74.006000,Noise");
  });

  it("pads to 6 decimal places", () => {
    expect(markerKey(1, 2, "X")).toBe("1.000000,2.000000,X");
  });
});

describe("debounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("delays execution", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
  });

  it("resets timer on subsequent calls", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced();
    vi.advanceTimersByTime(50);
    debounced();
    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledOnce();
  });

  it("cancel prevents execution", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced();
    debounced.cancel();
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
  });

  it("cancel is safe to call when no timer is pending", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced.cancel();
    expect(fn).not.toHaveBeenCalled();
  });
});

describe("throttle", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("fires immediately on first call", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    throttled();
    expect(fn).toHaveBeenCalledOnce();
  });

  it("suppresses calls within the interval", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    throttled();
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledOnce();
  });

  it("fires trailing call after interval", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    throttled();
    throttled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("cancel prevents trailing call", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    throttled();
    throttled();
    throttled.cancel();
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledOnce();
  });

  it("cancel is safe with no pending timer", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    throttled.cancel();
    expect(fn).not.toHaveBeenCalled();
  });

  it("allows new call after interval elapses", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    throttled();
    vi.advanceTimersByTime(101);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe("panTo", () => {
  it("calls map.panTo with options", () => {
    const mockMap = { panTo: vi.fn() } as unknown as InstanceType<typeof L.Map>;
    panTo(mockMap, [40, -74]);
    expect(mockMap.panTo).toHaveBeenCalledWith(
      [40, -74],
      expect.objectContaining({ animate: true })
    );
  });

  it("handles null map gracefully", () => {
    expect(() => panTo(null, [40, -74])).not.toThrow();
  });
});

describe("collectVisibleClusterCounts", () => {
  it("returns empty array when getBounds throws", () => {
    const map = {
      getBounds: () => {
        throw new Error("destroyed");
      },
    } as unknown as InstanceType<typeof L.Map>;
    const cg = {} as unknown as InstanceType<typeof L.MarkerClusterGroup>;
    expect(collectVisibleClusterCounts(cg, map)).toEqual([]);
  });

  it("returns empty array when _featureGroup is missing", () => {
    const map = {
      getBounds: () => ({
        contains: () => true,
      }),
    } as unknown as InstanceType<typeof L.Map>;
    const cg = {} as unknown as InstanceType<typeof L.MarkerClusterGroup>;
    expect(collectVisibleClusterCounts(cg, map)).toEqual([]);
  });

  it("collects counts from visible clusters", () => {
    const map = {
      getBounds: () => ({
        contains: () => true,
      }),
    } as unknown as InstanceType<typeof L.Map>;
    const layers = [
      { getChildCount: () => 10, getLatLng: () => ({ lat: 40, lng: -74 }) },
      { getChildCount: () => 5, getLatLng: () => ({ lat: 40, lng: -74 }) },
    ];
    const cg = {
      _featureGroup: {
        eachLayer: (cb: (l: unknown) => void) => layers.forEach(cb),
      },
    } as unknown as InstanceType<typeof L.MarkerClusterGroup>;
    expect(collectVisibleClusterCounts(cg, map)).toEqual([10, 5]);
  });

  it("skips layers without getChildCount", () => {
    const map = {
      getBounds: () => ({ contains: () => true }),
    } as unknown as InstanceType<typeof L.Map>;
    const layers = [{ getLatLng: () => ({ lat: 40, lng: -74 }) }];
    const cg = {
      _featureGroup: {
        eachLayer: (cb: (l: unknown) => void) => layers.forEach(cb),
      },
    } as unknown as InstanceType<typeof L.MarkerClusterGroup>;
    expect(collectVisibleClusterCounts(cg, map)).toEqual([]);
  });

  it("skips clusters outside bounds", () => {
    const map = {
      getBounds: () => ({ contains: () => false }),
    } as unknown as InstanceType<typeof L.Map>;
    const layers = [{ getChildCount: () => 10, getLatLng: () => ({ lat: 40, lng: -74 }) }];
    const cg = {
      _featureGroup: {
        eachLayer: (cb: (l: unknown) => void) => layers.forEach(cb),
      },
    } as unknown as InstanceType<typeof L.MarkerClusterGroup>;
    expect(collectVisibleClusterCounts(cg, map)).toEqual([]);
  });
});

describe("refreshRankedIcons", () => {
  it("calls refreshClusters on the cluster group", () => {
    const map = {
      getBounds: () => ({ contains: () => true }),
    } as unknown as InstanceType<typeof L.Map>;
    const cg = {
      _featureGroup: {
        eachLayer: () => {},
      },
      refreshClusters: vi.fn(),
    } as unknown as InstanceType<typeof L.MarkerClusterGroup>;
    refreshRankedIcons(cg, map);
    expect(cg.refreshClusters).toHaveBeenCalled();
  });
});

describe("diffMarkers", () => {
  it("removes old markers and adds new ones", () => {
    const cluster = {
      removeLayers: vi.fn(),
      addLayers: vi.fn(),
      _featureGroup: { eachLayer: () => {} },
      refreshClusters: vi.fn(),
    } as unknown as InstanceType<typeof L.MarkerClusterGroup>;
    const map = {
      getBounds: () => ({ contains: () => true }),
    } as unknown as InstanceType<typeof L.Map>;

    const oldMarker = {} as InstanceType<typeof L.Marker>;
    const newMarker = {} as InstanceType<typeof L.Marker>;
    const current = new Map([["old-key", oldMarker]]);
    const next = new Map([["new-key", newMarker]]);

    diffMarkers(cluster, map, current, next, [newMarker]);
    expect(cluster.removeLayers).toHaveBeenCalledWith([oldMarker]);
    expect(cluster.addLayers).toHaveBeenCalledWith([newMarker]);
  });

  it("skips removeLayers when nothing to remove", () => {
    const cluster = {
      removeLayers: vi.fn(),
      addLayers: vi.fn(),
      _featureGroup: { eachLayer: () => {} },
      refreshClusters: vi.fn(),
    } as unknown as InstanceType<typeof L.MarkerClusterGroup>;
    const map = {
      getBounds: () => ({ contains: () => true }),
    } as unknown as InstanceType<typeof L.Map>;

    const marker = {} as InstanceType<typeof L.Marker>;
    const current = new Map<string, InstanceType<typeof L.Marker>>();
    const next = new Map([["key", marker]]);

    diffMarkers(cluster, map, current, next, [marker]);
    expect(cluster.removeLayers).not.toHaveBeenCalled();
    expect(cluster.addLayers).toHaveBeenCalledWith([marker]);
  });

  it("skips addLayers when nothing to add", () => {
    const cluster = {
      removeLayers: vi.fn(),
      addLayers: vi.fn(),
      _featureGroup: { eachLayer: () => {} },
      refreshClusters: vi.fn(),
    } as unknown as InstanceType<typeof L.MarkerClusterGroup>;
    const map = {
      getBounds: () => ({ contains: () => true }),
    } as unknown as InstanceType<typeof L.Map>;

    const current = new Map<string, InstanceType<typeof L.Marker>>();
    const next = new Map<string, InstanceType<typeof L.Marker>>();

    diffMarkers(cluster, map, current, next, []);
    expect(cluster.removeLayers).not.toHaveBeenCalled();
    expect(cluster.addLayers).not.toHaveBeenCalled();
  });
});

describe("tryRefreshIcons", () => {
  it("calls refreshRankedIcons when both args are provided", () => {
    const cg = {
      _featureGroup: { eachLayer: () => {} },
      refreshClusters: vi.fn(),
    } as unknown as InstanceType<typeof L.MarkerClusterGroup>;
    const map = {
      getBounds: () => ({ contains: () => true }),
    } as unknown as InstanceType<typeof L.Map>;
    tryRefreshIcons(cg, map);
    expect(cg.refreshClusters).toHaveBeenCalled();
  });

  it("does nothing when cluster is null", () => {
    expect(() => tryRefreshIcons(null, {} as InstanceType<typeof L.Map>)).not.toThrow();
  });
});

describe("STATUS_MARKER_COLOURS", () => {
  it("has entries for all known statuses", () => {
    expect(STATUS_MARKER_COLOURS).toHaveProperty("Open");
    expect(STATUS_MARKER_COLOURS).toHaveProperty("In Progress");
    expect(STATUS_MARKER_COLOURS).toHaveProperty("Assigned");
    expect(STATUS_MARKER_COLOURS).toHaveProperty("Started");
    expect(STATUS_MARKER_COLOURS).toHaveProperty("Closed");
    expect(STATUS_MARKER_COLOURS).toHaveProperty("Pending");
  });
});

function makePopupHost(hasWrapper: boolean, hasTip: boolean): HTMLElement {
  const host = document.createElement("div");
  if (hasWrapper) {
    const w = document.createElement("div");
    w.className = "leaflet-popup-content-wrapper";
    host.appendChild(w);
  }
  if (hasTip) {
    const t = document.createElement("div");
    t.className = "leaflet-popup-tip";
    host.appendChild(t);
  }
  return host;
}

describe("stylePopup", () => {
  it("is a no-op when popup element is undefined", () => {
    expect(() => stylePopup(undefined, false)).not.toThrow();
    expect(() => stylePopup(undefined, true)).not.toThrow();
  });

  it("sets border-radius on wrapper regardless of dark mode", () => {
    const host = makePopupHost(true, false);
    stylePopup(host, false);
    const wrapper = host.querySelector<HTMLElement>(".leaflet-popup-content-wrapper")!;
    expect(wrapper.style.borderRadius).not.toBe("");
  });

  it("applies dark colours to wrapper when isDark = true", () => {
    const host = makePopupHost(true, false);
    stylePopup(host, true);
    const wrapper = host.querySelector<HTMLElement>(".leaflet-popup-content-wrapper")!;
    expect(wrapper.style.background).not.toBe("");
    expect(wrapper.style.color).not.toBe("");
    expect(wrapper.style.boxShadow).not.toBe("");
  });

  it("does NOT set background/color on wrapper when isDark = false", () => {
    const host = makePopupHost(true, false);
    stylePopup(host, false);
    const wrapper = host.querySelector<HTMLElement>(".leaflet-popup-content-wrapper")!;
    expect(wrapper.style.background).toBe("");
    expect(wrapper.style.color).toBe("");
  });

  it("applies dark background to tip when isDark = true and tip exists", () => {
    const host = makePopupHost(true, true);
    stylePopup(host, true);
    const tip = host.querySelector<HTMLElement>(".leaflet-popup-tip")!;
    expect(tip.style.background).not.toBe("");
  });

  it("does NOT set tip background when isDark = false", () => {
    const host = makePopupHost(true, true);
    stylePopup(host, false);
    const tip = host.querySelector<HTMLElement>(".leaflet-popup-tip")!;
    expect(tip.style.background).toBe("");
  });

  it("does not throw when wrapper is absent", () => {
    const host = makePopupHost(false, true);
    expect(() => stylePopup(host, true)).not.toThrow();
    expect(() => stylePopup(host, false)).not.toThrow();
  });
});
