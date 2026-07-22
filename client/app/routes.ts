import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/dashboard/layout.tsx", [
    index("routes/dashboard/overview.tsx"),
    route("documents", "routes/dashboard/documents.tsx"),
    route("chat", "routes/dashboard/chat.tsx"),
    route("settings", "routes/dashboard/settings.tsx"),
  ]),
] satisfies RouteConfig;
