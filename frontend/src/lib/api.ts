import type { GeoPoint } from "@/types/geopoints";
import type { HealthCheck } from "../types/api";
import { logError } from "./util";
import { MOCK_POINTS  } from "./api.constants";
import type { DataRefresh } from "@/types/logs";
import { MOCK_REFRESH } from "./api.mocks";

const useMocks = import.meta.env.VITE_USE_MOCKS === "true";

export const checkHealth = async (): Promise<HealthCheck> => {
  try {
    const response = await fetch("/api/health");
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    logError(error);
    return { status: "error" };
  }
};

export const fetchGeoPointsMock = async (): Promise<GeoPoint[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_POINTS;
};

export const fetchGeoPointsReal = async (params?: {
  borough?: string;
  complaintType?: string;
  status?: string;
}): Promise<GeoPoint[]> => {
  try {
    const query = new URLSearchParams();
    if (params?.borough) query.set("borough", params.borough);
    if (params?.complaintType) query.set("complaintType", params.complaintType);
    if (params?.status) query.set("status", params.status);

    const url = `/api/complaints/geo/points${query.toString() ? `?${query}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch geo points: ${response.status}`);
    return await response.json();
  } catch (error) {
    logError(error);
    return [];
  }
};

export const fetchLastRefreshMock = async (): Promise<DataRefresh | null> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_REFRESH;
};

export const fetchLastRefreshReal = async (): Promise<DataRefresh | null> => {
  try {
    const response = await fetch("/api/complaints/geo/last-refresh");
    if (!response.ok) throw new Error(`Failed to fetch last refresh: ${response.status}`);
    return await response.json();
  } catch (error) {
    logError(error);
    return null;
  }
};

export const fetchGeoPoints = useMocks ? fetchGeoPointsMock : fetchGeoPointsReal;
export const fetchLastRefresh = useMocks ? fetchLastRefreshMock : fetchLastRefreshReal;

