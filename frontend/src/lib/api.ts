import type { Summary } from "@/types/api";
import type { GeoPoint } from "@/types/geopoints";
import type { Borough, ComplaintType, HealthCheck, Status } from "@/types/api";
import type { DataRefresh } from "@/types/logs";
import type { FilterOptionsResponse } from "@/types/ClusterMap";
import { getMockPoints, logError } from "./util";
import { MOCK_REFRESH, MOCK_SUMMARY } from "./api.mocks";
import { ENDPOINTS, MOCK_DELAY_MS } from "./api.constants";

const isDev = import.meta.env.DEV;

export const checkHealth = async (): Promise<HealthCheck> => {
  try {
    const response = await fetch(ENDPOINTS.health);
    if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (isDev) logError(error);
    return { status: "error" };
  }
};

export const fetchGeoPointsMock = async (): Promise<GeoPoint[]> => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  return getMockPoints();
};

export const fetchFilterOptions = async (): Promise<FilterOptionsResponse> => {
  const response = await fetch(ENDPOINTS.filterOptions);
  if (!response.ok) throw new Error(`Failed to fetch filter options: ${response.status}`);
  return await response.json();
};

export const fetchGeoPoints = async (
  params?: {
    borough?: Borough;
    complaintType?: ComplaintType;
    status?: Status;
    dateFrom?: string;
    dateTo?: string;
  },
  signal?: AbortSignal
): Promise<GeoPoint[]> => {
  try {
    const query = new URLSearchParams();
    if (params?.borough) query.set("borough", params.borough);
    if (params?.complaintType) query.set("complaintType", params.complaintType);
    if (params?.status) query.set("status", params.status);
    if (params?.dateFrom) query.set("dateFrom", params.dateFrom);
    if (params?.dateTo) query.set("dateTo", params.dateTo);

    const qs = query.toString();
    const url = `${ENDPOINTS.geoPoints}${qs ? `?${qs}` : ""}`;
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`Failed to fetch geo points: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    if (isDev) logError(error);
    return [];
  }
};

export const fetchLastRefreshMock = async (): Promise<DataRefresh | null> => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  return MOCK_REFRESH;
};

export const fetchLastRefresh = async (): Promise<DataRefresh | null> => {
  try {
    const response = await fetch(ENDPOINTS.lastRefresh);
    if (!response.ok) throw new Error(`Failed to fetch last refresh: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (isDev) logError(error);
    return null;
  }
};

export const fetchSummary = async (): Promise<Summary> => {
  try {
    const response = await fetch(ENDPOINTS.summary);
    if (!response.ok) throw new Error(`Failed to fetch summary: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (isDev) logError(error);
    return MOCK_SUMMARY;
  }
};
