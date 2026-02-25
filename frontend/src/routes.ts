import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/landing.tsx"),
  layout("routes/layout.tsx", [route("dashboard", "routes/dashboard.tsx")]),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
