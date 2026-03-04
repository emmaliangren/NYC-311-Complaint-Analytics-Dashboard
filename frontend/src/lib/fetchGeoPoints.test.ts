import { describe, it } from "vitest";
import { ENDPOINTS as E, FIXTURES as F } from "@/mocks/constants";
import { mock } from "@/mocks/mock";
import { fetchGeoPoints } from "./fetchGeoPoints";
import { expectResult } from "@/tests/helpers";

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
