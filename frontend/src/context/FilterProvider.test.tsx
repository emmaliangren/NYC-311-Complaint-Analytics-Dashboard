import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { FilterProvider, useFilters } from "@/context/FilterProvider";
import { mock } from "@/mocks/mock";

const basePoint = {
  uniqueKey: "1",
  latitude: 40.7,
  longitude: -74.0,
  complaintType: "Noise - Residential",
  borough: "MANHATTAN",
  status: "Open",
  createdDate: "2025-06-15",
};

const FilterConsumer = ({ points }: { points: any[] }) => {
  const ctx = useFilters();
  const filtered = ctx.filterPoints(points);
  return <span data-testid="count">{filtered.length}</span>;
};

const setup = (points: any[] = [basePoint]) => {
  let ctxRef: ReturnType<typeof useFilters>;

  const Capture = () => {
    ctxRef = useFilters();
    return <FilterConsumer points={points} />;
  };

  render(
    <FilterProvider>
      <Capture />
    </FilterProvider>
  );

  return {
    getCount: () => Number(screen.getByTestId("count").textContent),
    ctx: () => ctxRef,
  };
};

describe("FilterProvider", () => {
  beforeEach(() => {
    mock.filterOptions.loaded();
  });

  describe("filterPoints — complaintType branch", () => {
    it("keeps point when complaintType filter matches", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setComplaintType("Noise - Residential" as any));
      expect(getCount()).toBe(1);
    });

    it("removes point when complaintType filter does not match", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setComplaintType("Rodent" as any));
      expect(getCount()).toBe(0);
    });
  });

  describe("filterPoints — borough branch", () => {
    it("keeps point when borough filter matches", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setBorough("MANHATTAN" as any));
      expect(getCount()).toBe(1);
    });

    it("removes point when borough filter does not match", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setBorough("BROOKLYN" as any));
      expect(getCount()).toBe(0);
    });
  });

  describe("filterPoints — status branch", () => {
    it("keeps point when status filter matches", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setStatus("Open" as any));
      expect(getCount()).toBe(1);
    });

    it("removes point when status filter does not match", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setStatus("Closed" as any));
      expect(getCount()).toBe(0);
    });
  });

  describe("filterPoints — dateFrom branch", () => {
    it("keeps point when createdDate is on or after dateFrom", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setDateFrom("2025-01-01"));
      expect(getCount()).toBe(1);
    });

    it("removes point when createdDate is before dateFrom", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setDateFrom("2025-07-01"));
      expect(getCount()).toBe(0);
    });
  });

  describe("filterPoints — dateTo branch", () => {
    it("keeps point when createdDate is on or before dateTo", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setDateTo("2025-12-31"));
      expect(getCount()).toBe(1);
    });

    it("removes point when createdDate is after dateTo", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setDateTo("2025-01-01"));
      expect(getCount()).toBe(0);
    });
  });

  describe("filterPoints — no active filters", () => {
    it("returns all points when no filter is set", () => {
      const points = [basePoint, { ...basePoint, uniqueKey: "2" }];
      const { getCount } = setup(points);
      expect(getCount()).toBe(2);
    });
  });

  describe("filterPoints — multiple filters combined", () => {
    it("applies all active filters together", async () => {
      const { getCount, ctx } = setup();
      await act(async () => {
        ctx().setComplaintType("Noise - Residential" as any);
        ctx().setBorough("MANHATTAN" as any);
        ctx().setStatus("Open" as any);
        ctx().setDateFrom("2025-01-01");
        ctx().setDateTo("2025-12-31");
      });
      expect(getCount()).toBe(1);
    });

    it("returns 0 when one filter in a combination does not match", async () => {
      const { getCount, ctx } = setup();
      await act(async () => {
        ctx().setComplaintType("Noise - Residential" as any);
        ctx().setBorough("BRONX" as any); // won't match
      });
      expect(getCount()).toBe(0);
    });
  });

  describe("reset", () => {
    it("clears all filters so filterPoints returns all points", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setBorough("BRONX" as any));
      expect(getCount()).toBe(0);
      await act(async () => ctx().reset());
      expect(getCount()).toBe(1);
    });
  });

  describe("removeFilter", () => {
    it("removes a single active filter", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setBorough("BRONX" as any));
      expect(getCount()).toBe(0);
      await act(async () => ctx().removeFilter("borough"));
      expect(getCount()).toBe(1);
    });
  });

  describe("activeEntries", () => {
    it("is empty when no filters are set", () => {
      const { ctx } = setup();
      expect(ctx().activeEntries).toHaveLength(0);
    });

    it("reflects set filters", async () => {
      const { ctx } = setup();
      await act(async () => ctx().setBorough("MANHATTAN" as any));
      const entry = ctx().activeEntries.find((e) => e.key === "borough");
      expect(entry?.value).toBe("MANHATTAN");
    });
  });

  describe("useFilters outside provider", () => {
    it("throws when used outside FilterProvider", () => {
      const Bad = () => {
        useFilters();
        return null;
      };
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => render(<Bad />)).toThrow("useFilters must be used within a FilterProvider");
      consoleSpy.mockRestore();
    });
  });
});
