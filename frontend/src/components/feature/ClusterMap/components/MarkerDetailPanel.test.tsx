import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import MarkerDetailPanel from "./MarkerDetailPanel";
import type { GeoPoint } from "@/types/geopoints";

const POINT: GeoPoint = {
  uniqueKey: "abc-123",
  latitude: 40.7128,
  longitude: -74.006,
  complaintType: "Noise – Residential",
  borough: "Manhattan",
  createdDate: "2025-03-01",
  status: "Open",
};

describe("MarkerDetailPanel", () => {
  it("renders the complaint type as the panel title", () => {
    render(<MarkerDetailPanel point={POINT} onClose={vi.fn()} />);
    expect(screen.getByText("Noise – Residential")).toBeInTheDocument();
  });

  it("renders the borough", () => {
    render(<MarkerDetailPanel point={POINT} onClose={vi.fn()} />);
    expect(screen.getByText("Manhattan")).toBeInTheDocument();
  });

  it("renders the status in a Row", () => {
    render(<MarkerDetailPanel point={POINT} onClose={vi.fn()} />);
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("renders the createdDate in the Opened row", () => {
    render(<MarkerDetailPanel point={POINT} onClose={vi.fn()} />);
    expect(screen.getByText("2025-03-01")).toBeInTheDocument();
  });

  it("renders latitude and longitude formatted to 4 decimal places", () => {
    render(<MarkerDetailPanel point={POINT} onClose={vi.fn()} />);
    // 40.7128, -74.0060 → "40.7128, -74.0060"
    expect(screen.getByText(/40\.7128.*-74\.0060/)).toBeInTheDocument();
  });

  it("renders the row labels Status, Opened, and Coordinates", () => {
    render(<MarkerDetailPanel point={POINT} onClose={vi.fn()} />);
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Opened")).toBeInTheDocument();
    expect(screen.getByText("Coordinates")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    render(<MarkerDetailPanel point={POINT} onClose={onClose} />);
    const closeButton = screen.getByRole("button");
    await userEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders a different complaint type correctly", () => {
    render(
      <MarkerDetailPanel
        point={{ ...POINT, complaintType: "Heat/Hot Water", borough: "Bronx" }}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("Heat/Hot Water")).toBeInTheDocument();
    expect(screen.getByText("Bronx")).toBeInTheDocument();
  });

  it("displays Closed status", () => {
    render(<MarkerDetailPanel point={{ ...POINT, status: "Closed" }} onClose={vi.fn()} />);
    expect(screen.getByText("Closed")).toBeInTheDocument();
  });
});
