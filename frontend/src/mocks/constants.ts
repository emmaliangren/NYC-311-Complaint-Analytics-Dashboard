import type { GeoPoint } from "@/types/geopoints";
import type { HealthCheck, ServiceStatus, HttpLabel, HttpCode } from "../types/api";
import type { DataRefresh } from "@/types/logs";
import type { FilterOptionsResponse } from "@/types/ClusterMap";

export const ENDPOINTS = {
  health: "/api/health",
  geoPoints: "/api/complaints/geopoints",
  filterOptions: "/api/complaints/filter-options",
  lastRefresh: "/api/refreshlogs/latest",
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
        complaintType: "Noise - Residential",
        borough: "MANHATTAN",
        createdDate: "2025-03-01",
        status: "Open",
      },
      {
        uniqueKey: "2",
        latitude: 40.6782,
        longitude: -73.9442,
        complaintType: "Street Condition",
        borough: "BROOKLYN",
        createdDate: "2025-03-02",
        status: "Closed",
      },
    ] satisfies GeoPoint[],
    empty: [] as GeoPoint[],
  },
  lastRefresh: {
    ok: {
      refreshStartedAt: new Date().toISOString(),
      refreshCompletedAt: new Date().toISOString(),
      recordsProcessed: 1500,
      status: "completed",
    } satisfies DataRefresh,
    empty: null,
  },
  filterOptions: {
    ok: {
      complaintTypes: [
        "Noise - Residential",
        "Noise - Commercial",
        "Noise - Street/Sidewalk",
        "Illegal Parking",
        "Blocked Driveway",
        "Heat/Hot Water",
        "Street Condition",
        "Water System",
        "Rodent",
        "Unsanitary Condition",
        "Traffic Signal Condition",
        "Homeless Encampment",
        "Graffiti",
        "Air Quality",
        "Sewer",
      ],
      boroughs: ["MANHATTAN", "BROOKLYN", "QUEENS", "BRONX", "STATEN ISLAND"],
      statuses: ["Open", "Closed", "In Progress", "Assigned", "Started", "Pending"],
    } satisfies FilterOptionsResponse,
    empty: {
      complaintTypes: [],
      boroughs: [],
      statuses: [],
    } satisfies FilterOptionsResponse,
  },
} as const;

export const HTTP = {
  ok: 200,
  created: 201,
  badRequest: 400,
  notFound: 404,
  serverError: 500,
} as const satisfies Record<HttpLabel, HttpCode>;
