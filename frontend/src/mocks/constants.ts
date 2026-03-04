import type { GeoPoint } from "@/types/GeoPoint";
import type { HealthCheck, ServiceStatus, HttpLabel, HttpCode } from "../types/api";

export const ENDPOINTS = {
  health: "/api/health",
  geoPoints: "/api/points",
} as const;

export const FIXTURES = {
  health: {
    ok: { status: "ok" },
    error: { status: "error" },
  } satisfies Record<ServiceStatus, HealthCheck>,
  geoPoints: {
    ok: [
      {
        id: "1",
        lat: 40.7128,
        lng: -74.006,
        complaintType: "Noise",
        borough: "Manhattan",
        date: "2025-03-01",
        status: "Open",
      },
      {
        id: "2",
        lat: 40.6782,
        lng: -73.9442,
        complaintType: "Pothole",
        borough: "Brooklyn",
        date: "2025-03-02",
        status: "Closed",
      },
    ] satisfies GeoPoint[],
    empty: [] as GeoPoint[],
  },
} as const;

export const HTTP = {
  ok: 200,
  created: 201,
  badRequest: 400,
  notFound: 404,
  serverError: 500,
} as const satisfies Record<HttpLabel, HttpCode>;
