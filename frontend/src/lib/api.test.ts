import { describe, it, expect, beforeAll } from "vitest";
import { ENDPOINTS as E, ENDPOINTS, FIXTURES as F, FIXTURES } from "../mocks/constants";
import { mock } from "../mocks/mock";
import {
  checkHealth,
  fetchGeoPoints,
  fetchLastRefresh,
  fetchGeoPointsMock,
  fetchLastRefreshMock,
} from "./api";
import { expectResult } from "../tests/helpers";
import { server } from "@/mocks/server";

let lastUrl = "";

beforeAll(() => {
  server.events.on("request:start", ({ request }) => {
    if (request.url.includes(ENDPOINTS.geoPoints)) {
      lastUrl = request.url;
    }
  });
});

describe("checkHealth", () => {
  it("returns parsed health response", async () => {
    mock.success(E.health, F.health.ok);
    await expectResult(checkHealth, F.health.ok);
  });

  it("returns error status on failure", async () => {
    mock.failure(E.health);
    await expectResult(checkHealth, F.health.error);
  });

  it("returns error status on network failure", async () => {
    mock.offline(E.health);
    await expectResult(checkHealth, F.health.error);
  });
});

describe("fetchGeoPoints", () => {
  it("returns parsed geo points on success", async () => {
    mock.success(E.geoPoints, F.geoPoints.ok);
    await expectResult(fetchGeoPoints, F.geoPoints.ok);
  });

  it("returns empty array on server error", async () => {
    mock.failure(E.geoPoints);
    await expectResult(fetchGeoPoints, F.geoPoints.empty);
  });

  it("returns empty array on network failure", async () => {
    mock.offline(E.geoPoints);
    await expectResult(fetchGeoPoints, F.geoPoints.empty);
  });

  it("passes borough query param", async () => {
    mock.success(E.geoPoints, F.geoPoints.ok);
    const result = await fetchGeoPoints({ borough: "MANHATTAN" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("passes complaintType query param", async () => {
    mock.success(E.geoPoints, F.geoPoints.ok);
    const result = await fetchGeoPoints({ complaintType: "Noise" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("passes status query param", async () => {
    mock.success(E.geoPoints, F.geoPoints.ok);
    const result = await fetchGeoPoints({ status: "Open" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("passes dateFrom query param", async () => {
    mock.success(E.geoPoints, F.geoPoints.ok);
    const result = await fetchGeoPoints({ dateFrom: "2025-01-01" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("passes dateTo query param", async () => {
    mock.success(E.geoPoints, F.geoPoints.ok);
    const result = await fetchGeoPoints({ dateTo: "2025-12-31" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("passes all params together", async () => {
    mock.success(E.geoPoints, F.geoPoints.ok);
    const result = await fetchGeoPoints({
      borough: "BROOKLYN",
      complaintType: "Rodent",
      status: "Closed",
      dateFrom: "2025-01-01",
      dateTo: "2025-12-31",
    });
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns empty array on failure with params", async () => {
    mock.failure(E.geoPoints);
    const result = await fetchGeoPoints({ borough: "BRONX" });
    expect(result).toEqual([]);
  });
});

describe("fetchLastRefresh", () => {
  it("returns parsed refresh data on success", async () => {
    mock.success(E.lastRefresh, F.lastRefresh.ok);
    await expectResult(fetchLastRefresh, F.lastRefresh.ok);
  });

  it("returns null on server error", async () => {
    mock.failure(E.lastRefresh);
    await expectResult(fetchLastRefresh, F.lastRefresh.empty);
  });

  it("returns null on network failure", async () => {
    mock.offline(E.lastRefresh);
    await expectResult(fetchLastRefresh, F.lastRefresh.empty);
  });

  it("returns the fixture payload on a successful response", async () => {
    await expectResult(() => fetchGeoPoints(), FIXTURES.geoPoints.ok);
  });

  it("calls the geopoints endpoint with no query string when called with no params", async () => {
    await fetchGeoPoints();

    expect(new URL(lastUrl).pathname).toBe(ENDPOINTS.geoPoints);
  });

  it("does not append a trailing ? when called with no params", async () => {
    await fetchGeoPoints();

    expect(lastUrl).not.toContain("?");
  });

  it("does not append a trailing ? when all params are undefined", async () => {
    await fetchGeoPoints({
      complaintType: undefined,
      borough: undefined,
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });

    expect(lastUrl).not.toContain("?");
  });

  it("appends complaintType to the query string when provided", async () => {
    await fetchGeoPoints({ complaintType: "Noise" });

    expect(lastUrl).toContain("complaintType=Noise");
  });

  it("appends borough to the query string when provided", async () => {
    await fetchGeoPoints({ borough: "Manhattan" });

    expect(lastUrl).toContain("borough=Manhattan");
  });

  it("appends status to the query string when provided", async () => {
    await fetchGeoPoints({ status: "Open" });

    expect(lastUrl).toContain("status=Open");
  });

  it("appends dateFrom to the query string when provided", async () => {
    await fetchGeoPoints({ dateFrom: "2026-01-01" });

    expect(lastUrl).toContain("dateFrom=2026-01-01");
  });

  it("appends dateTo to the query string when provided", async () => {
    await fetchGeoPoints({ dateTo: "2026-03-01" });

    expect(lastUrl).toContain("dateTo=2026-03-01");
  });

  it("appends all five params when all are provided", async () => {
    await fetchGeoPoints({
      complaintType: "Noise",
      borough: "Bronx",
      status: "Open",
      dateFrom: "2026-01-01",
      dateTo: "2026-03-01",
    });

    expect(lastUrl).toContain("complaintType=Noise");
    expect(lastUrl).toContain("borough=Bronx");
    expect(lastUrl).toContain("status=Open");
    expect(lastUrl).toContain("dateFrom=2026-01-01");
    expect(lastUrl).toContain("dateTo=2026-03-01");
  });

  it("appends both date params when a date range is provided", async () => {
    await fetchGeoPoints({ dateFrom: "2026-01-01", dateTo: "2026-03-01" });

    expect(lastUrl).toContain("dateFrom=2026-01-01");
    expect(lastUrl).toContain("dateTo=2026-03-01");
  });

  it("appends complaintType and dateFrom together for an AND filter combination", async () => {
    await fetchGeoPoints({ complaintType: "Noise", dateFrom: "2026-01-01" });

    expect(lastUrl).toContain("complaintType=Noise");
    expect(lastUrl).toContain("dateFrom=2026-01-01");
  });

  it("does not append complaintType when undefined — other params still appear", async () => {
    await fetchGeoPoints({ complaintType: undefined, borough: "Brooklyn" });

    expect(lastUrl).not.toContain("complaintType");
    expect(lastUrl).toContain("borough=Brooklyn");
  });

  it("does not append dateFrom when undefined — dateTo still appears", async () => {
    await fetchGeoPoints({ dateFrom: undefined, dateTo: "2026-03-01" });
    expect(lastUrl).not.toContain("dateFrom");
    expect(lastUrl).toContain("dateTo=2026-03-01");
  });

  it("does not append dateTo when undefined — dateFrom still appears", async () => {
    await fetchGeoPoints({ dateFrom: "2026-01-01", dateTo: undefined });
    expect(lastUrl).toContain("dateFrom=2026-01-01");
    expect(lastUrl).not.toContain("dateTo");
  });

  it("uses a ? separator before the first query param when params are present", async () => {
    await fetchGeoPoints({ status: "Closed" });
    const search = new URL(lastUrl).search;
    expect(search).toMatch(/^\?/);
  });

  it("returns an empty array when the server responds with a 500", async () => {
    mock.failure(ENDPOINTS.geoPoints);
    await expectResult(() => fetchGeoPoints(), []);
  });

  it("returns an empty array when the server responds with a 404", async () => {
    mock.failure(ENDPOINTS.geoPoints, 404);
    await expectResult(() => fetchGeoPoints(), []);
  });

  it("returns an empty array when the request fails with a network error", async () => {
    mock.offline(ENDPOINTS.geoPoints);
    await expectResult(() => fetchGeoPoints(), []);
  });

  it("resolves with an empty array on any failure without throwing", async () => {
    mock.failure(ENDPOINTS.geoPoints);
    await expectResult(() => fetchGeoPoints(), []);
  });
});

describe("fetchGeoPointsMock", () => {
  it("returns an array of geo points", async () => {
    const result = await fetchGeoPointsMock();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns points with required fields", async () => {
    const result = await fetchGeoPointsMock();
    const point = result[0];
    expect(point).toHaveProperty("uniqueKey");
    expect(point).toHaveProperty("latitude");
    expect(point).toHaveProperty("longitude");
    expect(point).toHaveProperty("complaintType");
    expect(point).toHaveProperty("borough");
    expect(point).toHaveProperty("status");
  });
});

describe("fetchLastRefreshMock", () => {
  it("returns a non-null refresh object", async () => {
    const result = await fetchLastRefreshMock();
    expect(result).not.toBeNull();
  });

  it("returns refresh with required fields", async () => {
    const result = await fetchLastRefreshMock();
    expect(result).toHaveProperty("refreshCompletedAt");
    expect(result).toHaveProperty("recordsProcessed");
    expect(result).toHaveProperty("status");
  });
});
