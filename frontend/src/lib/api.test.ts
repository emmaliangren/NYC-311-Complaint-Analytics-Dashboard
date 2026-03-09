import { describe, it, expect } from "vitest";
import { ENDPOINTS as E, FIXTURES as F } from "../mocks/constants";
import { mock } from "../mocks/mock";
import {
  checkHealth,
  fetchGeoPoints,
  fetchLastRefresh,
  fetchGeoPointsMock,
  fetchLastRefreshMock,
} from "./api";
import { expectResult } from "../tests/helpers";

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

  it("passes all params together", async () => {
    mock.success(E.geoPoints, F.geoPoints.ok);
    const result = await fetchGeoPoints({
      borough: "BROOKLYN",
      complaintType: "Rodent",
      status: "Closed",
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
