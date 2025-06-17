import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  layout("modules/dashboard/containers/dashboard.route.tsx", [
    index("modules/projects/containers/projects.route.tsx")
  ]),
  ...prefix("projects", [
    route(":id", "modules/projects/containers/project.route.tsx"),
  ]),
] satisfies RouteConfig;
