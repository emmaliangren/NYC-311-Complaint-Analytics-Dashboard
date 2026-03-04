import { describe, it, expect } from "vitest";
import L from "leaflet";
import { clusterIcon, createPopup } from "./utils";
import type { GeoPoint } from "@/types/geo";

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
  it("returns a small green icon for clusters with fewer than 10 markers", () => {
    const icon = clusterIcon(makeCluster(5));
    const html = icon.options.html as string;

    expect(html).toContain("30px");
    expect(html).toContain("rgba(34,197,94,0.7)");
    expect(html).toContain("5");
    expect(icon.options.iconSize).toEqual(L.point(30, 30));
  });

  it("returns a medium yellow icon for clusters with 10–99 markers", () => {
    const icon = clusterIcon(makeCluster(50));
    const html = icon.options.html as string;

    expect(html).toContain("40px");
    expect(html).toContain("rgba(234,179,8,0.7)");
    expect(html).toContain("50");
    expect(icon.options.iconSize).toEqual(L.point(40, 40));
  });

  it("returns a large red icon for clusters with 100 or more markers", () => {
    const icon = clusterIcon(makeCluster(150));
    const html = icon.options.html as string;

    expect(html).toContain("50px");
    expect(html).toContain("rgba(239,68,68,0.7)");
    expect(html).toContain("150");
    expect(icon.options.iconSize).toEqual(L.point(50, 50));
  });

  it("uses an empty className so Leaflet does not add default styles", () => {
    const icon = clusterIcon(makeCluster(1));
    expect(icon.options.className).toBe("");
  });

  it("sits exactly on the boundary: count === 10 uses the yellow style", () => {
    const icon = clusterIcon(makeCluster(10));
    const html = icon.options.html as string;
    expect(html).toContain("rgba(234,179,8,0.7)");
  });

  it("sits exactly on the boundary: count === 100 uses the red style", () => {
    const icon = clusterIcon(makeCluster(100));
    const html = icon.options.html as string;
    expect(html).toContain("rgba(239,68,68,0.7)");
  });
});

describe("createPopup", () => {
  it("renders complaint type, borough, and date", () => {
    const html = createPopup(makePoint());
    expect(html).toContain("Noise");
    expect(html).toContain("Manhattan");
    expect(html).toContain("2025-03-01");
  });

  it("uses green colour for Closed status", () => {
    const html = createPopup(makePoint({ status: "Closed" }));
    expect(html).toContain("#16a34a");
    expect(html).toContain("Closed");
  });

  it("uses orange colour for Open status", () => {
    const html = createPopup(makePoint({ status: "Open" }));
    expect(html).toContain("#ea580c");
    expect(html).toContain("Open");
  });

  it("uses orange colour for any non-Closed status", () => {
    const html = createPopup(makePoint({ status: "Pending" as GeoPoint["status"] }));
    expect(html).toContain("#ea580c");
  });
});
