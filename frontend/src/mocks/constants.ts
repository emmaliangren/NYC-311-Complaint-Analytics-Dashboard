import type { HealthCheck, ServiceStatus, HttpLabel, HttpCode } from "../types/api";

export const ENDPOINTS = {
  health: "/api/health",
} as const;

export const FIXTURES = {
  health: {
    ok: { status: "ok" },
    error: { status: "error" },
  } satisfies Record<ServiceStatus, HealthCheck>,
} as const;

export const HTTP = {
  ok: 200,
  created: 201,
  badRequest: 400,
  notFound: 404,
  serverError: 500,
} as const satisfies Record<HttpLabel, HttpCode>;
