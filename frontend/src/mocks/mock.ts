import { http, HttpResponse, type JsonBodyType } from "msw";
import { server } from "./server";
import { HTTP } from "./constants";
import type { HttpCode, Method } from "../types/api";

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
};
