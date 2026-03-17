import type { GeoPoint } from "@/types/geopoints";
import type { Borough, ComplaintType, HealthCheck, Status } from "../types/api";
import type { DataRefresh } from "@/types/logs";
import { logError, MOCK_POINTS } from "./util";
import { MOCK_REFRESH } from "./api.mocks";
import {
  API_HEALTH_URL,
  API_GEO_POINTS_URL,
  API_FILTER_OPTIONS_URL,
  API_LAST_REFRESH_URL,
  MOCK_DELAY_MS,
} from "./api.constants";

import type { FilterOptionsResponse } from "@/types/ClusterMap";

const isDev = import.meta.env.DEV;

export const checkHealth = async (): Promise<HealthCheck> => {
  try {
    const response = await fetch(API_HEALTH_URL);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (isDev) logError(error);
    return { status: "error" };
  }
};

export const fetchGeoPointsMock = async (): Promise<GeoPoint[]> => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  return MOCK_POINTS;
};

export const fetchFilterOptions = async (): Promise<FilterOptionsResponse> => {
  const response = await fetch(API_FILTER_OPTIONS_URL);
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

    const url = `${API_GEO_POINTS_URL}${query.toString() ? `?${query}` : ""}`;
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`Failed to fetch geo points: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error; // -> DataService will handle it
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
    const response = await fetch(API_LAST_REFRESH_URL);
    if (!response.ok) throw new Error(`Failed to fetch last refresh: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (isDev) logError(error);
    return null;
  }
};
