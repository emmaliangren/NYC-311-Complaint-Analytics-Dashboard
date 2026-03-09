import { http, HttpResponse } from "msw";
import { ENDPOINTS as E, FIXTURES as F } from "./constants";

export const handlers = [
  http.get(E.health, () => HttpResponse.json(F.health.ok)),
  http.get(E.geoPoints, () => HttpResponse.json(F.geoPoints.ok)),
  http.get(E.lastRefresh, () => HttpResponse.json(F.lastRefresh.ok)),
];

