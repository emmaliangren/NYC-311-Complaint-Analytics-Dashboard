import { describe, it, expect, vi, beforeEach } from "vitest";
import { DataService } from "./DataService";
import { mock } from "@/mocks/mock";
import { ENDPOINTS as E, FIXTURES as F } from "@/mocks/constants";
import * as api from "@/lib/api";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DataService", () => {
  it("calls fetchGeoPoints when useMock=false and fetchGeoPointsMock when true", async () => {
    mock.success(E.geoPoints, F.geoPoints.ok);
    const svc = new DataService();
    expect(await svc.fetchPoints()).toEqual(F.geoPoints.ok);

    vi.spyOn(api, "fetchGeoPointsMock").mockResolvedValue(F.geoPoints.ok);
    svc.setUseMock(true);
    expect(await svc.fetchPoints()).toEqual(F.geoPoints.ok);
    expect(api.fetchGeoPointsMock).toHaveBeenCalledOnce();
  });

  it("returns [] and skips the network call when already fetching", async () => {
    let resolve!: (v: typeof F.geoPoints.ok) => void;
    vi.spyOn(api, "fetchGeoPoints").mockReturnValueOnce(
      new Promise((r) => {
        resolve = r as typeof resolve;
      })
    );

    const svc = new DataService();
    const first = svc.fetchPoints();
    const second = svc.fetchPoints();

    resolve(F.geoPoints.ok);
    const [r1, r2] = await Promise.all([first, second]);

    expect(r1).toEqual(F.geoPoints.ok);
    expect(r2).toEqual([]);
    expect(api.fetchGeoPoints).toHaveBeenCalledOnce();
  });

  it("resets isFetching after a successful fetch", async () => {
    mock.success(E.geoPoints, F.geoPoints.ok);
    const svc = new DataService();
    await svc.fetchPoints();
    expect(svc.isFetching()).toBe(false);
  });

  it("resets isFetching after a failed fetch", async () => {
    mock.offline(E.geoPoints);
    const svc = new DataService();
    const result = await svc.fetchPoints();
    expect(result).toEqual([]);
    expect(svc.isFetching()).toBe(false);
  });
});
