import { http, HttpResponse } from "msw";
import { ENDPOINTS as E, FIXTURES as F } from "./constants";

export const handlers = [http.get(E.health, () => HttpResponse.json(F.health.ok))];
