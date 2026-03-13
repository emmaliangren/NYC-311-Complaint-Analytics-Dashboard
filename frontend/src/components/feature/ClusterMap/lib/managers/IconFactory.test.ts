import { describe, it, expect, beforeEach } from "vitest";
import L from "leaflet";
import { IconFactory } from "./IconFactory";
import { STATUSES } from "../constants";

const CLUSTER_ICON_CLASS = "cluster-icon-circle";
const UNKNOWN_STATUS = "default";

const COUNTS_INITIAL = [100, 50, 10];
const COUNT_POST_RESET = 999;

const COUNTS_FEWER_THAN_THREE = [10, 5];
const COUNT_TOP_OF_TWO = COUNTS_FEWER_THAN_THREE[0];

const COUNTS_EXACTLY_THREE = [30, 20, 10];
const COUNT_MIDDLE_OF_THREE = COUNTS_EXACTLY_THREE[1];

const COUNTS_FIVE = [100, 80, 60, 40, 20];
const COUNT_FOURTH_OF_FIVE = COUNTS_FIVE[3];

const COUNT_SMALL = 5;
const COUNT_K_FORMAT = 1500;
const EXPECTED_K_LABEL = "1.5k";

const STATUS_A = STATUSES[0]; // Open
const STATUS_B = STATUSES[4]; // Closed

// helper

const mockCluster = (count: number): L.MarkerCluster =>
  ({ getChildCount: () => count }) as unknown as L.MarkerCluster;

// tests

let factory: IconFactory;

beforeEach(() => {
  factory = new IconFactory();
});

describe("IconFactory.computeRankCutoffs", () => {
  it("resets cutoffs on empty array", () => {
    factory.computeRankCutoffs(COUNTS_INITIAL);
    factory.computeRankCutoffs([]);
    const icon = factory.createClusterIcon(mockCluster(COUNT_POST_RESET));
    expect(icon).toBeDefined();
  });

  it("sets redMin to last element when fewer than 3 counts", () => {
    factory.computeRankCutoffs(COUNTS_FEWER_THAN_THREE);
    const icon = factory.createClusterIcon(mockCluster(COUNT_TOP_OF_TWO));
    expect(icon.options.className).toBe(CLUSTER_ICON_CLASS);
  });

  it("sets yellowMin to Infinity when yellowEnd <= 3", () => {
    factory.computeRankCutoffs(COUNTS_EXACTLY_THREE);
    const icon = factory.createClusterIcon(mockCluster(COUNT_MIDDLE_OF_THREE));
    expect(icon).toBeDefined();
  });

  it("sets yellowMin from sorted array when yellowEnd > 3", () => {
    factory.computeRankCutoffs(COUNTS_FIVE);
    const icon = factory.createClusterIcon(mockCluster(COUNT_FOURTH_OF_FIVE));
    expect(icon).toBeDefined();
  });
});

describe("IconFactory.createClusterIcon", () => {
  it("returns cached icon on repeated calls", () => {
    factory.computeRankCutoffs([]);
    const a = factory.createClusterIcon(mockCluster(COUNT_SMALL));
    const b = factory.createClusterIcon(mockCluster(COUNT_SMALL));
    expect(a).toBe(b);
  });

  it("returns new icon after clearClusterCache", () => {
    factory.computeRankCutoffs([]);
    const a = factory.createClusterIcon(mockCluster(COUNT_SMALL));
    factory.clearClusterCache();
    const b = factory.createClusterIcon(mockCluster(COUNT_SMALL));
    expect(a).not.toBe(b);
  });

  it("formats counts >= 1000 as Nk", () => {
    factory.computeRankCutoffs([]);
    const icon = factory.createClusterIcon(mockCluster(COUNT_K_FORMAT));
    expect(icon.options.html).toContain(EXPECTED_K_LABEL);
  });
});

describe("IconFactory.getMarkerIcons", () => {
  it("returns different icons for normal and hovered states", () => {
    const { normal, hovered } = factory.getMarkerIcons(STATUS_A, true);
    expect(normal).not.toBe(hovered);
  });

  it("returns same icon for all statuses when colourByStatus is false", () => {
    const a = factory.getMarkerIcons(STATUS_A, false);
    const b = factory.getMarkerIcons(STATUS_B, false);
    expect(a.normal).toBe(b.normal);
  });

  it("returns different icons per status when colourByStatus is true", () => {
    const a = factory.getMarkerIcons(STATUS_A, true);
    const b = factory.getMarkerIcons(STATUS_B, true);
    expect(a.normal).not.toBe(b.normal);
  });

  it("falls back to default fill for unknown status", () => {
    const { normal } = factory.getMarkerIcons(UNKNOWN_STATUS, true);
    expect(normal).toBeDefined();
  });

  it("clearAll invalidates marker cache", () => {
    const a = factory.getMarkerIcons(STATUS_A, true);
    factory.clearAll();
    const b = factory.getMarkerIcons(STATUS_A, true);
    expect(a.normal).not.toBe(b.normal);
  });
});
