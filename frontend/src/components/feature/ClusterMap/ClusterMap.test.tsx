import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ClusterMap from "./ClusterMap";
import {
  MAP_TESTID,
  ROUNDED_BORDER,
  BG_RED_500,
  WRAPPER_TESTID,
} from "@/components/feature/ClusterMap/lib/constants";
import * as api from "@/lib/api";

vi.mock("@/scripts/theme", () => ({
  isDark: () => false,
}));

vi.mock("./lib/constants", async () => {
  const actual = await vi.importActual<typeof import("./lib/constants")>("./lib/constants");
  return { ...actual, MIN_LOAD_MS: 0 };
});

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
  vi.mocked(api.fetchGeoPoints).mockResolvedValue([
    {
      uniqueKey: "1",
      latitude: 40.71,
      longitude: -74.0,
      complaintType: "Noise",
      borough: "Manhattan",
      createdDate: "2025-03-01",
      status: "Open",
    },
  ]);
});

describe("ClusterMap", () => {
  it("should render the map container", () => {
    render(<ClusterMap />);
    expect(screen.getByTestId(MAP_TESTID)).toBeInTheDocument();
  });

  it("should apply default classes to the wrapper", () => {
    render(<ClusterMap />);
    expect(screen.getByTestId(WRAPPER_TESTID)).toHaveClass(ROUNDED_BORDER);
  });

  it("should merge a custom className onto the wrapper", () => {
    render(<ClusterMap className={BG_RED_500} />);
    const wrapper = screen.getByTestId(WRAPPER_TESTID);
    expect(wrapper).toHaveClass(BG_RED_500);
    expect(wrapper).toHaveClass(ROUNDED_BORDER);
  });
});

describe("ClusterMap loading state", () => {
  it("should show the loading overlay initially", () => {
    render(<ClusterMap />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should hide the loader after data has loaded", async () => {
    render(<ClusterMap />);
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });
});

describe("ClusterMap zoom panel", () => {
  it("should render at least 3 buttons", () => {
    render(<ClusterMap />);
    expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(3);
  });
});

describe("ClusterMap empty state", () => {
  beforeEach(() => {
    vi.mocked(api.fetchGeoPoints).mockResolvedValue([]);
  });

  it("shows 'No complaint data available' when real API returns empty", async () => {
    render(<ClusterMap />);
    await waitFor(() => {
      expect(screen.getByText("No complaint data available")).toBeInTheDocument();
    });
  });

  it("shows 'Load mock data' button when empty", async () => {
    render(<ClusterMap />);
    await waitFor(() => {
      expect(screen.getByText("Load mock data")).toBeInTheDocument();
    });
  });

  it("clicking 'Load mock data' switches to mock source and clears empty state", async () => {
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
