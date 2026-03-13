import type { GeoPoint } from "@/types/geopoints";
import type { HealthCheck } from "../types/api";
import type { DataRefresh } from "@/types/logs";
import { logError, MOCK_POINTS } from "./util";
import { MOCK_REFRESH } from "./api.mocks";
import { MOCK_DELAY_MS } from "./api.constants";

export const checkHealth = async (): Promise<HealthCheck> => {
  try {
    const response = await fetch("/api/health");
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    // logError(error);
    return { status: "error" };
  }
};

export const fetchGeoPointsMock = async (): Promise<GeoPoint[]> => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  return MOCK_POINTS;
};

export const fetchGeoPoints = async (params?: {
  borough?: string;
  complaintType?: string;
  status?: string;
}): Promise<GeoPoint[]> => {
  try {
    const query = new URLSearchParams();
    if (params?.borough) query.set("borough", params.borough);
    if (params?.complaintType) query.set("complaintType", params.complaintType);
    if (params?.status) query.set("status", params.status);

    const url = `/api/complaints/geopoints${query.toString() ? `?${query}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch geo points: ${response.status}`);
    return await response.json();
  } catch (error) {
    // logError(error);
    return [];
  }
};

export const fetchLastRefreshMock = async (): Promise<DataRefresh | null> => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  return MOCK_REFRESH;
};

export const fetchLastRefresh = async (): Promise<DataRefresh | null> => {
  try {
    const response = await fetch("/api/refreshlogs/latest");
    if (!response.ok) throw new Error(`Failed to fetch last refresh: ${response.status}`);
    return await response.json();
  } catch (error) {
    // logError(error);
    return null;
  }
};
