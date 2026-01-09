import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  layout("modules/dashboard/containers/dashboard.route.tsx", [
    index("modules/projects/containers/projects.route.tsx")
  ]),
  ...prefix("projects", [
    route(":id", "modules/projects/containers/project.route.tsx", { id: 'project' }, [
      index("modules/projects/containers/projectRuns.route.tsx", {
        id: "RUNS"
      }),
      route("files", "modules/projects/containers/projectFiles.route.tsx", {
        id: "FILES"
      }),
      route("sessions", "modules/projects/containers/projectSessions.route.tsx", {
        id: "SESSIONS"
      }),
      route("collections", "modules/projects/containers/projectCollections.route.tsx", {
        id: "COLLECTIONS"
      }),
    ]),
    route(":projectId/create-run", "modules/projects/containers/projectCreateRun.route.tsx"),
    route(":projectId/runs/:runId", "modules/projects/containers/projectRun.route.tsx"),
    route(":projectId/runs/:runId/sessions/:sessionId", "modules/projects/containers/projectRunSessions.route.tsx"),
    route(":projectId/collections/:collectionId", "modules/projects/containers/projectCollection.route.tsx")
  ]),
  ...prefix("prompts", [
    index("modules/prompts/containers/prompts.route.tsx"),
    route(":id", "modules/prompts/containers/prompt.route.tsx", [
      route(":version", "modules/prompts/containers/promptEditor.route.tsx", {
        id: "VERSION"
      }),
    ]),
  ]),
  ...prefix("teams", [
    index("modules/teams/containers/teams.route.tsx"),
    route(":id", "modules/teams/containers/team.route.tsx", { id: 'team' }, [
      index("modules/teams/containers/teamIndex.route.tsx"),
      route("projects", "modules/teams/containers/teamProjects.route.tsx"),
      route("prompts", "modules/teams/containers/teamPrompts.route.tsx"),
      route("users", "modules/teams/containers/teamUsers.route.tsx"),
    ]),
  ]),
  ...prefix("invite", [
    route(":id", "modules/teams/containers/invite.route.tsx", { id: "invite" }),
  ]),
  ...prefix("featureFlags", [
    route("/", "modules/featureFlags/containers/featureFlags.route.tsx", [
      route(":id", "modules/featureFlags/containers/featureFlag.route.tsx"),
    ]),
  ]),
  route("migrations", "modules/migrations/containers/migrations.route.tsx"),
  route("api", "modules/app/containers/api.route.tsx"),
  route("api/annotations/:runId/:sessionId/:annotationId", "modules/annotations/containers/annotations.route.tsx"),
  route("api/authentication", "modules/authentication/containers/authentication.route.tsx"),
  route("api/availableFeatureFlagUsers", "modules/users/containers/availableFeatureFlagUsers.route.tsx"),
  route("api/availableTeamUsers", "modules/users/containers/availableTeamUsers.route.tsx"),
  route("api/availableTeams", "modules/teams/containers/availableTeams.route.tsx", { id: 'availableTeams' }),
  route("api/downloads/:projectId/:runId", "modules/runs/containers/downloadRun.route.tsx"),
  route("api/events", "modules/events/containers/events.route.tsx"),
  route("api/projects", "modules/projects/containers/projects.route.tsx", { id: 'projects' }),
  route("api/promptVersionAlignment", "modules/prompts/containers/promptVersionAlignment.route.tsx"),
  route("api/promptVersionsList", "modules/prompts/containers/promptVersionsList.route.tsx"),
  route("api/prompts", "modules/prompts/containers/prompts.route.tsx", { id: 'prompts' }),
  route("api/promptsList", "modules/prompts/containers/promptsList.route.tsx"),
  route("api/runsList", "modules/runs/containers/runsList.route.tsx"),
  route("api/sessionsList", "modules/sessions/containers/sessionsList.route.tsx"),
  route("api/storage", "modules/storage/containers/storage.route.tsx"),
  route("api/supportArticles", "modules/support/containers/supportArticles.route.tsx"),
  route("api/teams", "modules/teams/containers/teams.route.tsx", { id: 'teams' }),
  route("api/teams/generateInviteToTeam", "modules/teams/containers/generateInviteToTeam.route.tsx"),
  route("auth/callback/:provider", "modules/authentication/containers/authCallback.route.tsx"),
  ...prefix("queues", [
    index("modules/queues/containers/queues.route.tsx"),
    layout("modules/queues/containers/queuesLayout.route.tsx", [
      route(":type", "modules/queues/containers/queue.route.tsx", [
        index("modules/queues/containers/queueIndex.route.tsx"),
        route(":state", "modules/queues/containers/queueJobs.route.tsx"),
      ]),
    ]),
  ]),
  ...prefix("admin", [
    route("users", "modules/users/containers/adminUsers.route.tsx"),
  ]),

] satisfies RouteConfig;
