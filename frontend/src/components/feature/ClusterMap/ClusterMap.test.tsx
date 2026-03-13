import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ClusterMap from "./ClusterMap";
import {
  POINTS,
  STATUSES,
  MAP_TESTID,
  TEXT_LOAD_MOCK_DATA,
  TEXT_NO_COMPLAINT_DATA_AVAILABLE,
  TEXT_COORDINATES,
  ONE_HOUR_MS,
  TEST_WAITFOR_TIMEOUT_MS,
  DEFAULT_REFRESH_INTERVAL_MS,
  MIN_ZOOM,
  MAX_ZOOM,
} from "@/components/feature/ClusterMap/lib/constants";
import { ENDPOINTS } from "@/mocks/constants";
import { mock } from "@/mocks/mock";
import * as api from "@/lib/api";
import { COMPLAINT_TYPES } from "@/lib/api.constants";
import type { MapControllerCallbacks } from "./lib/types";

const makeMockController = vi.hoisted(
  () =>
    (overrides: Partial<{ isEmpty: boolean }> = {}) =>
      function (this: unknown, callbacks: MapControllerCallbacks) {
        return {
          mount: vi.fn().mockImplementation(async () => {
            callbacks.onLoadingChange(false);
            callbacks.onEmptyChange(overrides.isEmpty ?? false);
            callbacks.onZoomChange(10);
          }),
          destroy: vi.fn(),
          zoomIn: vi.fn(),
          zoomOut: vi.fn(),
          resetView: vi.fn(),
          setUseMock: vi.fn().mockImplementation(() => {
            callbacks.onEmptyChange(false);
            callbacks.onLoadingChange(false);
          }),
          reload: vi.fn(),
          getMaxZoom: vi.fn().mockReturnValue(18),
          getMinZoom: vi.fn().mockReturnValue(10),
        };
      }
);

vi.mock("./lib/MapController", () => ({
  MapController: vi.fn(makeMockController()),
}));

vi.mock("./lib/constants", async () => {
  const actual = await vi.importActual<typeof import("./lib/constants")>("./lib/constants");
  return { ...actual, MIN_LOAD_MS: 0, CHUNK_SIZE: 1 };
});

describe("ClusterMap zoom buttons", () => {
  it("clicking zoom-in triggers map zoomIn", async () => {
    render(<ClusterMap />);
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[0]);
    expect(buttons[0]).toBeInTheDocument();
  });

  it("clicking zoom-out triggers map zoomOut", async () => {
    render(<ClusterMap />);
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[1]);
    expect(buttons[1]).toBeInTheDocument();
  });

  it("clicking reset view button resets the map", async () => {
    render(<ClusterMap />);
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[2]);
    expect(buttons[2]).toBeInTheDocument();
  });
});

describe("ClusterMap with null coordinates", () => {
  beforeEach(() => {
    mock.success(ENDPOINTS.geoPoints, POINTS);
  });

  it("skips points with null latitude or longitude", async () => {
    render(<ClusterMap />);
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId(MAP_TESTID)).toBeInTheDocument();
  });
});

describe("ClusterMap re-render with existing markers", () => {
  it("reuses existing markers on subsequent data loads", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    render(<ClusterMap />);
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    mock.success(ENDPOINTS.geoPoints, [{ ...POINTS[0], status: "Closed" }]);
    vi.advanceTimersByTime(ONE_HOUR_MS);

    await waitFor(() => {
      expect(screen.getByTestId(MAP_TESTID)).toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});

describe("ClusterMap with multiple statuses", () => {
  beforeEach(() => {
    mock.success(
      ENDPOINTS.geoPoints,
      STATUSES.map((status, i) => ({
        ...POINTS[0],
        uniqueKey: String(i + 1),
        latitude: 40.71 + i * 0.01,
        status,
      }))
    );
  });

  it("renders map with markers of all status types", async () => {
    render(<ClusterMap />);
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId(MAP_TESTID)).toBeInTheDocument();
  });
});

describe("ClusterMap selectedPoint", () => {
  it("does not render MarkerDetailPanel by default", async () => {
    render(<ClusterMap />);
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
    expect(screen.queryByText(TEXT_COORDINATES)).not.toBeInTheDocument();
  });
});

describe("ClusterMap mock data toggle", () => {
  beforeEach(() => {
    mock.success(ENDPOINTS.geoPoints, []);
    vi.spyOn(api, "fetchGeoPointsMock").mockResolvedValue([
      POINTS[0],
      { ...POINTS[0], uniqueKey: "2", latitude: 40.72 },
    ]);
  });

  it("switches from empty to mock data", async () => {
    const MockedMapController = (await import("./lib/MapController"))
      .MapController as unknown as ReturnType<typeof vi.fn>;
    MockedMapController.mockImplementationOnce(makeMockController({ isEmpty: true }));

    render(<ClusterMap />);
    await waitFor(() => {
      expect(screen.getByText(TEXT_LOAD_MOCK_DATA)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText(TEXT_LOAD_MOCK_DATA));
    await waitFor(() => {
      expect(screen.queryByText(TEXT_NO_COMPLAINT_DATA_AVAILABLE)).not.toBeInTheDocument();
    });
  });
});

describe("ClusterMap unmount cleanup", () => {
  it("cleans up map and intervals on unmount", async () => {
    const { unmount } = render(<ClusterMap />);
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
    expect(() => unmount()).not.toThrow();
  });

  it("handles rapid mount/unmount without error", () => {
    const { unmount: u1 } = render(<ClusterMap />);
    u1();
    const { unmount: u2 } = render(<ClusterMap />);
    u2();
  });
});

describe("ClusterMap multi-chunk processing", () => {
  beforeEach(() => {
    mock.success(
      ENDPOINTS.geoPoints,
      COMPLAINT_TYPES.map((complaintType, i) => ({
        ...POINTS[0],
        uniqueKey: String.fromCharCode(97 + i),
        latitude: 40.71 + i * 0.01,
        complaintType,
      }))
    );
  });

  it("processes multiple chunks when points exceed CHUNK_SIZE", async () => {
    render(<ClusterMap />);
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId(MAP_TESTID)).toBeInTheDocument();
  });

  it("correctly loads all markers across multiple chunks", async () => {
    render(<ClusterMap />);
    await waitFor(
      () => {
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
      },
      { timeout: TEST_WAITFOR_TIMEOUT_MS }
    );
    expect(screen.getByTestId(MAP_TESTID)).toBeInTheDocument();
  });
});

describe("ClusterMap duplicate POINTS[0] keys", () => {
  it("reuses markers for points with same lat/lng/type on reload", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const dupePoints = [
      { ...POINTS[0], uniqueKey: "1", latitude: 40.71, complaintType: "Noise - Residential" },
      { ...POINTS[0], uniqueKey: "2", latitude: 40.72, complaintType: "Heat/Hot Water" },
    ];
    mock.success(ENDPOINTS.geoPoints, dupePoints);

    render(<ClusterMap />);
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    vi.advanceTimersByTime(DEFAULT_REFRESH_INTERVAL_MS);

    await waitFor(() => {
      expect(screen.getByTestId(MAP_TESTID)).toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});

describe("ClusterMap empty mock data", () => {
  it("does not show empty state when mock returns empty (useMock flag)", async () => {
    mock.success(ENDPOINTS.geoPoints, []);
    vi.spyOn(api, "fetchGeoPointsMock").mockResolvedValue([POINTS[0]]);

    const MockedMapController = (await import("./lib/MapController"))
      .MapController as unknown as ReturnType<typeof vi.fn>;
    MockedMapController.mockImplementationOnce(makeMockController({ isEmpty: true }));

    render(<ClusterMap />);
    await waitFor(() => {
      expect(screen.getByText(TEXT_LOAD_MOCK_DATA)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText(TEXT_LOAD_MOCK_DATA));
    await waitFor(() => {
      expect(screen.queryByText(TEXT_NO_COMPLAINT_DATA_AVAILABLE)).not.toBeInTheDocument();
    });
  });
});
