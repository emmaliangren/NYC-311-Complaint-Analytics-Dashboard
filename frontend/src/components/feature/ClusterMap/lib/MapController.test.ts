import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MapController } from "./MapController";
import { MAX_ZOOM, MIN_ZOOM } from "./constants";
import { mock } from "@/mocks/mock";
import { ENDPOINTS, FIXTURES } from "@/mocks/constants";
import type { MapControllerCallbacks } from "./types";
import type { GeoPoint } from "@/types/geopoints";

const CONTAINER_WIDTH = "800px";
const CONTAINER_HEIGHT = "600px";

const DEBOUNCE_MS = 100;
const DEBOUNCE_HALF_MS = DEBOUNCE_MS / 2;
const DEBOUNCE_JUST_UNDER_MS = DEBOUNCE_MS - 1;
const DEBOUNCE_OVER_MS = DEBOUNCE_MS * 2;

const INTERVAL_ADVANCE_MS = 10_000;

const makeCallbacks = (
  overrides: Partial<MapControllerCallbacks> = {}
): MapControllerCallbacks => ({
  onLoadingChange: vi.fn(),
  onEmptyChange: vi.fn(),
  onZoomChange: vi.fn(),
  getColourByStatus: () => true,
  getPanOnMarker: () => true,
  getPanOnCluster: () => true,
  ...overrides,
});

const makeContainer = () => {
  const el = document.createElement("div");
  el.style.width = CONTAINER_WIDTH;
  el.style.height = CONTAINER_HEIGHT;
  document.body.appendChild(el);
  return el;
};

// tests

let container: HTMLDivElement;
let controller: MapController;

beforeEach(() => {
  mock.success(ENDPOINTS.geoPoints, FIXTURES.geoPoints.ok);
  container = makeContainer();
});

afterEach(() => {
  controller?.destroy();
  container.remove();
  vi.useRealTimers();
});

describe("MapController lifecycle", () => {
  it("mounts without error", () => {
    controller = new MapController(makeCallbacks());
    expect(() => controller.mount(container)).not.toThrow();
  });

  it("does not mount twice on same instance", async () => {
    controller = new MapController(makeCallbacks());
    await controller.mount(container);
    expect(() => controller.mount(container)).not.toThrow();
  });

  it("destroys cleanly", async () => {
    controller = new MapController(makeCallbacks());
    await controller.mount(container);
    expect(() => controller.destroy()).not.toThrow();
  });

  it("destroy stops the refresh interval", async () => {
    const callbacks = makeCallbacks();
    controller = new MapController(callbacks);
    await controller.mount(container);
    vi.useFakeTimers();
    controller.destroy();
    const callsBefore = (callbacks.onLoadingChange as ReturnType<typeof vi.fn>).mock.calls.length;
    vi.advanceTimersByTime(INTERVAL_ADVANCE_MS);
    expect((callbacks.onLoadingChange as ReturnType<typeof vi.fn>).mock.calls.length).toBe(
      callsBefore
    );
  });
});

describe("MapController zoom controls", () => {
  beforeEach(async () => {
    controller = new MapController(makeCallbacks());
    await controller.mount(container);
  });

  it("zoomIn delegates to map", () => {
    expect(() => controller.zoomIn()).not.toThrow();
  });

  it("zoomOut delegates to map", () => {
    expect(() => controller.zoomOut()).not.toThrow();
  });

  it("resetView resets without error", () => {
    controller.zoomIn();
    expect(() => controller.resetView()).not.toThrow();
  });

  it("getMaxZoom returns MAX_ZOOM", () => {
    expect(controller.getMaxZoom()).toBe(MAX_ZOOM);
  });

  it("getMinZoom returns MIN_ZOOM", () => {
    expect(controller.getMinZoom()).toBe(MIN_ZOOM);
  });
});

describe("MapController.setUseMock", () => {
  it("triggers reload and sets loading true", async () => {
    const callbacks = makeCallbacks();
    controller = new MapController(callbacks);
    await controller.mount(container);
    (callbacks.onLoadingChange as ReturnType<typeof vi.fn>).mockClear();
    controller.setUseMock(true);
    expect(callbacks.onLoadingChange).toHaveBeenCalledWith(true);
  });
});

describe("MapController.debounce", () => {
  beforeEach(() => vi.useFakeTimers());

  it("delays execution", () => {
    const fn = vi.fn();
    const debounced = MapController.debounce(fn, DEBOUNCE_MS);
    debounced();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(DEBOUNCE_MS);
    expect(fn).toHaveBeenCalledOnce();
  });

  it("resets timer on subsequent calls", () => {
    const fn = vi.fn();
    const debounced = MapController.debounce(fn, DEBOUNCE_MS);
    debounced();
    vi.advanceTimersByTime(DEBOUNCE_HALF_MS);
    debounced();
    vi.advanceTimersByTime(DEBOUNCE_JUST_UNDER_MS);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledOnce();
  });

  it("cancel prevents execution", () => {
    const fn = vi.fn();
    const debounced = MapController.debounce(fn, DEBOUNCE_MS);
    debounced();
    debounced.cancel();
    vi.advanceTimersByTime(DEBOUNCE_OVER_MS);
    expect(fn).not.toHaveBeenCalled();
  });

  it("cancel is safe when no timer is pending", () => {
    const fn = vi.fn();
    const debounced = MapController.debounce(fn, DEBOUNCE_MS);
    expect(() => debounced.cancel()).not.toThrow();
  });
});

const BASE_POINT: GeoPoint = {
  uniqueKey: "cf-1",
  latitude: 40.71,
  longitude: -74.0,
  complaintType: "Noise",
  borough: "Manhattan",
  createdDate: "2025-06-15",
  status: "Open",
};

const waitForEmpty = (callbacks: MapControllerCallbacks) =>
  vi.waitFor(() => {
    expect(callbacks.onEmptyChange).toHaveBeenCalledWith(true);
  });

describe("MapController.applyFilters — client-side filter branches", () => {
  beforeEach(() => {
    mock.success(ENDPOINTS.geoPoints, [BASE_POINT]);
  });

  it("borough mismatch marks map empty", async () => {
    const callbacks = makeCallbacks();
    controller = new MapController(callbacks);
    await controller.mount(container);
    (callbacks.onEmptyChange as ReturnType<typeof vi.fn>).mockClear();
    controller.applyFilters({ borough: "Brooklyn" });
    await waitForEmpty(callbacks);
  });

  it("complaintType mismatch marks map empty", async () => {
    const callbacks = makeCallbacks();
    controller = new MapController(callbacks);
    await controller.mount(container);
    (callbacks.onEmptyChange as ReturnType<typeof vi.fn>).mockClear();
    controller.applyFilters({ complaintType: "Heat/Hot Water" });
    await waitForEmpty(callbacks);
  });

  it("status mismatch marks map empty", async () => {
    const callbacks = makeCallbacks();
    controller = new MapController(callbacks);
    await controller.mount(container);
    (callbacks.onEmptyChange as ReturnType<typeof vi.fn>).mockClear();
    controller.applyFilters({ status: "Closed" });
    await waitForEmpty(callbacks);
  });

  it("dateFrom after createdDate marks map empty", async () => {
    const callbacks = makeCallbacks();
    controller = new MapController(callbacks);
    await controller.mount(container);
    (callbacks.onEmptyChange as ReturnType<typeof vi.fn>).mockClear();
    controller.applyFilters({ dateFrom: "2025-12-01" });
    await waitForEmpty(callbacks);
  });

  it("dateTo before createdDate marks map empty", async () => {
    const callbacks = makeCallbacks();
    controller = new MapController(callbacks);
    await controller.mount(container);
    (callbacks.onEmptyChange as ReturnType<typeof vi.fn>).mockClear();
    controller.applyFilters({ dateTo: "2025-01-01" });
    await waitForEmpty(callbacks);
  });

  it("matching filters keep points visible", async () => {
    const callbacks = makeCallbacks();
    controller = new MapController(callbacks);
    await controller.mount(container);
    (callbacks.onEmptyChange as ReturnType<typeof vi.fn>).mockClear();
    controller.applyFilters({
      borough: "Manhattan",
      complaintType: "Noise",
      status: "Open",
      dateFrom: "2025-01-01",
      dateTo: "2025-12-31",
    });
    await vi.waitFor(() => {
      expect(callbacks.onEmptyChange).toHaveBeenCalledWith(false);
    });
  });

  it("no filters applied passes all points through", async () => {
    const callbacks = makeCallbacks();
    controller = new MapController(callbacks);
    await controller.mount(container);
    (callbacks.onEmptyChange as ReturnType<typeof vi.fn>).mockClear();
    controller.applyFilters({});
    await vi.waitFor(() => {
      expect(callbacks.onEmptyChange).toHaveBeenCalledWith(false);
    });
  });
});
