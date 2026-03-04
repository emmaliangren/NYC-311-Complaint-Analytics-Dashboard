import { describe, it } from "vitest";
import { ENDPOINTS as E, FIXTURES as F } from "../mocks/constants";
import { mock } from "../mocks/mock";
import { checkHealth, fetchGeoPoints, fetchLastRefresh } from "./api";
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
