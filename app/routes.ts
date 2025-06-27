import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  layout("modules/dashboard/containers/dashboard.route.tsx", [
    index("modules/projects/containers/projects.route.tsx")
  ]),
  ...prefix("projects", [
    route(":id", "modules/projects/containers/project.route.tsx", [
      index("modules/projects/containers/projectRuns.route.tsx", {
        id: "RUNS"
      }),
      route("files", "modules/projects/containers/projectFiles.route.tsx", {
        id: "FILES"
      })
    ])
  ]),
  route("events", "core/events/containers/events.route.tsx")
] satisfies RouteConfig;
