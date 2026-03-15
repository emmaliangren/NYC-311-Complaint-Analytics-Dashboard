import { http, HttpResponse, type JsonBodyType } from "msw";
import { server } from "./server";
import { HTTP, ENDPOINTS as E, FIXTURES as F } from "./constants";
import type { HttpCode, Method } from "../types/api";
import type { FilterOptionsResponse } from "@/types/ClusterMap";

export const mock = {
  success: (url: string, body: JsonBodyType, method: Method = "get") =>
    server.use(http[method](url, () => HttpResponse.json(body))),
  created: (url: string, body: JsonBodyType, method: Method = "post") =>
    server.use(http[method](url, () => HttpResponse.json(body, { status: HTTP.created }))),
  failure: (url: string, status: HttpCode = HTTP.serverError, method: Method = "get") =>
    server.use(http[method](url, () => HttpResponse.json(null, { status }))),
  offline: (url: string, method: Method = "get") =>
    server.use(http[method](url, () => HttpResponse.error())),
  delay: (url: string, ms = 1000, method: Method = "get") =>
    server.use(
      http[method](url, async () => {
        await new Promise((r) => setTimeout(r, ms));
        return HttpResponse.json(null);
      })
    ),
  filterOptions: {
    loaded: (data: FilterOptionsResponse = F.filterOptions.ok) =>
      server.use(http.get(E.filterOptions, () => HttpResponse.json(data))),
    empty: () =>
      server.use(http.get(E.filterOptions, () => HttpResponse.json(F.filterOptions.empty))),
    loading: (ms = 5000) =>
      server.use(
        http.get(E.filterOptions, async () => {
          await new Promise((r) => setTimeout(r, ms));
          return HttpResponse.json(null);
        })
      ),
    failure: (status: HttpCode = HTTP.serverError) =>
      server.use(http.get(E.filterOptions, () => HttpResponse.json(null, { status }))),
    offline: () => server.use(http.get(E.filterOptions, () => HttpResponse.error())),
  },
};
