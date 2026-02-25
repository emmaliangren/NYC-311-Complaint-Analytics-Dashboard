export type Method = "get" | "post" | "put" | "patch" | "delete";

export type ServiceStatus = "ok" | "error";

export type HttpLabel = "ok" | "created" | "badRequest" | "notFound" | "serverError";

type Informational = 100;
type Success = 200 | 201 | 204;
type Redirect = 301 | 302;
type ClientError = 400 | 401 | 403 | 404;
type ServerError = 500 | 502 | 503;

export type HttpCode = Informational | Success | Redirect | ClientError | ServerError;

export type HealthCheck = {
  status: ServiceStatus;
  uptime?: number;
};
