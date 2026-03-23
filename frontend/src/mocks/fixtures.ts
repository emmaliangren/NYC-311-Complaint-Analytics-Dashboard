import { COMPLAINT_TYPES, BOROUGHS, STATUSES } from "@/lib/api.constants";
import { MOCK_RESOLUTION_TIME_GROUP } from "@/api/resolutionTime/mock";
import { MOCK_RECORDS_PROCESSED } from "./constants";
import type {
  DomainFixtures,
  HealthCheck,
  DataRefresh,
  FilterOptionsResponse,
  GeoPoint,
  HttpCode,
  HttpLabel,
} from "@/types";
import { AGENCIES } from "@/lib/agency";

export const POINTS: GeoPoint[] = [
  {
    uniqueKey: "1",
    latitude: 40.71,
    longitude: -74.0,
    complaintType: "Noise - Residential",
    borough: "MANHATTAN",
    createdDate: "2025-03-01",
    status: "Open",
    agency: "NYPD",
  },
  {
    uniqueKey: "null-lat",
    latitude: null as unknown as number,
    longitude: -74.0,
    complaintType: "Homeless Encampment",
    borough: "MANHATTAN",
    createdDate: "2025-03-01",
    status: "Open",
    agency: "NYPD",
  },
  {
    uniqueKey: "null-lng",
    latitude: 40.71,
    longitude: null as unknown as number,
    complaintType: "Heat/Hot Water",
    borough: "MANHATTAN",
    createdDate: "2025-03-01",
    status: "Open",
    agency: "NYPD",
  },
];

export const POINT = POINTS[0];

export const FIXTURES = {
  health: {
    ok: { status: "ok" },
    empty: { status: "error" },
  } satisfies DomainFixtures<HealthCheck>,

  geoPoints: {
    ok: POINTS,
    single: [POINTS[0]],
    empty: [] as GeoPoint[],
  },

  lastRefresh: {
    ok: {
      refreshStartedAt: new Date().toISOString(),
      refreshCompletedAt: new Date().toISOString(),
      recordsProcessed: MOCK_RECORDS_PROCESSED,
      status: "completed",
    } satisfies DataRefresh,
    empty: null,
  },

  filterOptions: {
    ok: {
      complaintTypes: COMPLAINT_TYPES,
      boroughs: BOROUGHS,
      statuses: STATUSES,
      agency: AGENCIES,
    } satisfies FilterOptionsResponse,
    empty: {
      complaintTypes: [],
      boroughs: [],
      statuses: [],
      agency: [],
    } satisfies FilterOptionsResponse,
  },

  resolutionTime: {
    ok: MOCK_RESOLUTION_TIME_GROUP.ok,
    single: MOCK_RESOLUTION_TIME_GROUP.single,
    empty: MOCK_RESOLUTION_TIME_GROUP.empty,
  },
} as const;

export const HTTP = {
  ok: 200,
  created: 201,
  badRequest: 400,
  notFound: 404,
  serverError: 500,
} as const satisfies Record<HttpLabel, HttpCode>;
