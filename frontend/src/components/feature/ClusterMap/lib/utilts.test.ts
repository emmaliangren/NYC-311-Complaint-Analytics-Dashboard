import { describe, it, expect, beforeEach } from "vitest";
import L from "leaflet";
import { clusterIcon, createPopup, computeRankCutoffs, clearIconCache } from "./utils";
import { COLOUR1, COLOUR2, COLOUR3 } from "./constants";
import type { GeoPoint } from "@/types/geopoints";

const makeCluster = (count: number): L.MarkerCluster =>
  ({ getChildCount: () => count }) as unknown as L.MarkerCluster;

const makePoint = (overrides: Partial<GeoPoint> = {}): GeoPoint => ({
  uniqueKey: "1",
  latitude: 40.71,
  longitude: -74.0,
  complaintType: "Noise",
  borough: "Manhattan",
  createdDate: "2025-03-01",
  status: "Open",
  ...overrides,
});

describe("clusterIcon", () => {
  beforeEach(() => {
    clearIconCache();
    // rank cutoffs so tiers work: top 3 → red, 4–8 → yellow, rest → green
    computeRankCutoffs([200, 150, 100, 50, 40, 30, 20, 10, 5, 3, 1]);
  });

  it("returns a green icon for low-count clusters", () => {
    const icon = clusterIcon(makeCluster(5));
    const html = icon.options.html as string;

    expect(html).toContain(COLOUR3);
    expect(html).toContain(">5<");
  });

  it("returns a yellow icon for mid-count clusters", () => {
    const icon = clusterIcon(makeCluster(50));
    const html = icon.options.html as string;

    expect(html).toContain(COLOUR2);
    expect(html).toContain(">50<");
  });

  it("returns a red icon for high-count clusters", () => {
    const icon = clusterIcon(makeCluster(150));
    const html = icon.options.html as string;

    expect(html).toContain(COLOUR1);
    expect(html).toContain(">150<");
  });

  it("uses cluster-icon-circle className", () => {
    const icon = clusterIcon(makeCluster(1));
    expect(icon.options.className).toBe("cluster-icon-circle");
  });

  it("renders circle elements instead of polygons", () => {
    const icon = clusterIcon(makeCluster(10));
    const html = icon.options.html as string;
    expect(html).toContain("<circle");
    expect(html).not.toContain("<polygon");
  });

  it("renders white text for the count label", () => {
    const icon = clusterIcon(makeCluster(10));
    const html = icon.options.html as string;
    expect(html).toContain('fill="#fff"');
  });

  it("defaults to green tier when no cutoffs are set", () => {
    clearIconCache();
    computeRankCutoffs([]);
    const icon = clusterIcon(makeCluster(999));
    const html = icon.options.html as string;
    expect(html).toContain(COLOUR3);
  });
});

describe("createPopup", () => {
  it("renders complaint type, borough, and date", () => {
    const html = createPopup(makePoint());
    expect(html).toContain("Noise");
    expect(html).toContain("Manhattan");
    expect(html).toContain("2025-03-01");
  });

  it("uses slate colour for Closed status", () => {
    const html = createPopup(makePoint({ status: "Closed" }));
    expect(html).toContain("#64748b");
    expect(html).toContain("Closed");
  });

  it("uses green colour for Open status", () => {
    const html = createPopup(makePoint({ status: "Open" }));
    expect(html).toContain("#16a34a");
    expect(html).toContain("Open");
  });

  it("uses pink colour for Pending status", () => {
    const html = createPopup(makePoint({ status: "Pending" as GeoPoint["status"] }));
    expect(html).toContain("#db2777");
  });

  it("uses purple colour for In Progress status in dark mode", () => {
    const html = createPopup(makePoint({ status: "In Progress" }), true);
    expect(html).toContain("#c084fc");
  });
});
