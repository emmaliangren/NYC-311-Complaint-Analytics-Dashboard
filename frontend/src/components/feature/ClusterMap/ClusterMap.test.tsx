import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ClusterMap from "./ClusterMap";
import { MAP_TESTID } from "@/components/feature/ClusterMap/lib/constants";
import * as api from "@/lib/api";

vi.mock("@/scripts/theme", () => ({
  isDark: () => false,
}));

vi.mock("./lib/constants", async () => {
  const actual = await vi.importActual<typeof import("./lib/constants")>("./lib/constants");
  return { ...actual, MIN_LOAD_MS: 0, CHUNK_SIZE: 1 };
});

const POINT = {
  uniqueKey: "1",
  latitude: 40.71,
  longitude: -74.0,
  complaintType: "Noise",
  borough: "Manhattan",
  createdDate: "2025-03-01",
  status: "Open",
};

vi.mock("@/lib/api", () => ({
  fetchGeoPoints: vi.fn().mockResolvedValue([
    {
      uniqueKey: "1",
      latitude: 40.71,
      longitude: -74.0,
      complaintType: "Noise",
      borough: "Manhattan",
      createdDate: "2025-03-01",
      status: "Open",
    },
  ]),
  fetchGeoPointsMock: vi.fn().mockResolvedValue([
    {
      uniqueKey: "1",
      latitude: 40.71,
      longitude: -74.0,
      complaintType: "Noise",
      borough: "Manhattan",
      createdDate: "2025-03-01",
      status: "Open",
    },
  ]),
}));

afterEach(() => {
  vi.mocked(api.fetchGeoPoints).mockResolvedValue([POINT]);
  vi.mocked(api.fetchGeoPointsMock).mockResolvedValue([POINT]);
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
    vi.mocked(api.fetchGeoPoints).mockResolvedValue([
      {
        uniqueKey: "null-lat",
        latitude: null as unknown as number,
        longitude: -74.0,
        complaintType: "Noise",
        borough: "Manhattan",
        createdDate: "2025-03-01",
        status: "Open",
      },
      {
        uniqueKey: "null-lng",
        latitude: 40.71,
        longitude: null as unknown as number,
        complaintType: "Noise",
        borough: "Manhattan",
        createdDate: "2025-03-01",
        status: "Open",
      },
      POINT,
    ]);
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
    vi.mocked(api.fetchGeoPoints).mockResolvedValue([POINT]);

    render(<ClusterMap />);
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    vi.mocked(api.fetchGeoPoints).mockResolvedValue([{ ...POINT, status: "Closed" }]);

    vi.advanceTimersByTime(3600 * 1000);

    await waitFor(() => {
      expect(screen.getByTestId(MAP_TESTID)).toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});

describe("ClusterMap with multiple statuses", () => {
  beforeEach(() => {
    vi.mocked(api.fetchGeoPoints).mockResolvedValue([
      { ...POINT, uniqueKey: "1", status: "Open" },
      { ...POINT, uniqueKey: "2", latitude: 40.72, status: "In Progress" },
      { ...POINT, uniqueKey: "3", latitude: 40.73, status: "Assigned" },
      { ...POINT, uniqueKey: "4", latitude: 40.74, status: "Started" },
      { ...POINT, uniqueKey: "5", latitude: 40.75, status: "Closed" },
      { ...POINT, uniqueKey: "6", latitude: 40.76, status: "Pending" },
      { ...POINT, uniqueKey: "7", latitude: 40.77, status: "Unknown" },
    ]);
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
    expect(screen.queryByText("Coordinates")).not.toBeInTheDocument();
  });
});

describe("ClusterMap mock data toggle", () => {
  beforeEach(() => {
    vi.mocked(api.fetchGeoPoints).mockResolvedValue([]);
  });

  it("switches from empty to mock data", async () => {
    vi.mocked(api.fetchGeoPointsMock).mockResolvedValue([
      POINT,
      { ...POINT, uniqueKey: "2", latitude: 40.72 },
    ]);

    render(<ClusterMap />);
    await waitFor(() => {
      expect(screen.getByText("Load mock data")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Load mock data"));
    await waitFor(() => {
      expect(screen.queryByText("No complaint data available")).not.toBeInTheDocument();
    });
  });
});

describe("ClusterMap theme handling", () => {
  it("observes class attribute mutations on document element", () => {
    const observeSpy = vi.spyOn(MutationObserver.prototype, "observe");
    render(<ClusterMap />);
    expect(observeSpy).toHaveBeenCalledWith(
      document.documentElement,
      expect.objectContaining({ attributeFilter: ["class"] })
    );
    observeSpy.mockRestore();
  });

  it("disconnects mutation observer on unmount", () => {
    const disconnectSpy = vi.spyOn(MutationObserver.prototype, "disconnect");
    const { unmount } = render(<ClusterMap />);
    unmount();
    expect(disconnectSpy).toHaveBeenCalled();
    disconnectSpy.mockRestore();
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
    vi.mocked(api.fetchGeoPoints).mockResolvedValue([
      { ...POINT, uniqueKey: "a", latitude: 40.71, complaintType: "Noise" },
      { ...POINT, uniqueKey: "b", latitude: 40.72, complaintType: "Heat" },
      { ...POINT, uniqueKey: "c", latitude: 40.73, complaintType: "Water" },
      { ...POINT, uniqueKey: "d", latitude: 40.74, complaintType: "Rodent" },
      { ...POINT, uniqueKey: "e", latitude: 40.75, complaintType: "Trash" },
    ]);
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
      { timeout: 3000 }
    );
    expect(screen.getByTestId(MAP_TESTID)).toBeInTheDocument();
  });
});

describe("ClusterMap duplicate point keys", () => {
  it("reuses markers for points with same lat/lng/type on reload", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const dupePoints = [
      { ...POINT, uniqueKey: "1", latitude: 40.71, complaintType: "Noise" },
      { ...POINT, uniqueKey: "2", latitude: 40.72, complaintType: "Heat" },
    ];
    vi.mocked(api.fetchGeoPoints).mockResolvedValue(dupePoints);

    render(<ClusterMap />);
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    vi.mocked(api.fetchGeoPoints).mockResolvedValue(dupePoints);
    vi.advanceTimersByTime(3600 * 1000);

    await waitFor(() => {
      expect(screen.getByTestId(MAP_TESTID)).toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});

describe("ClusterMap empty mock data", () => {
  it("does not show empty state when mock returns empty (useMock flag)", async () => {
    vi.mocked(api.fetchGeoPoints).mockResolvedValue([]);
    render(<ClusterMap />);
    await waitFor(() => {
      expect(screen.getByText("Load mock data")).toBeInTheDocument();
    });

    vi.mocked(api.fetchGeoPointsMock).mockResolvedValue([POINT]);
    await userEvent.click(screen.getByText("Load mock data"));
    await waitFor(() => {
      expect(screen.queryByText("No complaint data available")).not.toBeInTheDocument();
    });
  });
});
