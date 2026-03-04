import type { GeoPoint, DataRefresh } from "@/types/geo";
import type { HealthCheck, ServiceStatus, HttpLabel, HttpCode } from "../types/api";

export const ENDPOINTS = {
  health: "/api/health",
  geoPoints: "/api/complaints/geo/points",
  lastRefresh: "/api/complaints/geo/last-refresh",
} as const;

export const FIXTURES = {
  health: {
    ok: { status: "ok" },
    error: { status: "error" },
  } satisfies Record<ServiceStatus, HealthCheck>,
  geoPoints: {
    ok: [
      {
        uniqueKey: "1",
        latitude: 40.7128,
        longitude: -74.006,
        complaintType: "Noise",
        borough: "Manhattan",
        createdDate: "2025-03-01",
        status: "Open",
      },
      {
        uniqueKey: "2",
        latitude: 40.6782,
        longitude: -73.9442,
        complaintType: "Pothole",
        borough: "Brooklyn",
        createdDate: "2025-03-02",
        status: "Closed",
      },
    ] satisfies GeoPoint[],
    empty: [] as GeoPoint[],
  },
  lastRefresh: {
    ok: {
      refreshCompletedAt: "2025-03-04T12:00:00Z",
      recordsProcessed: 1500,
      status: "completed",
    } satisfies DataRefresh,
    empty: null,
  },
} as const;

export const HTTP = {
  ok: 200,
  created: 201,
  badRequest: 400,
  notFound: 404,
  serverError: 500,
} as const satisfies Record<HttpLabel, HttpCode>;
