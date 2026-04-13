import fse from "fs-extra";
import map from "lodash/map";
import { redirect, useLoaderData, useNavigation } from "react-router";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import { RunSetService } from "~/modules/runSets/runSet";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import RunSessions from "../components/runSessions";
import type { Route } from "./+types/runSessions.route";

export const meta: Route.MetaFunction = () => [
  { title: "Session - Sandpiper" },
];

export async function loader({ request, params }: Route.LoaderArgs) {
  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, "team");
  const project = await ProjectService.findOne({
    _id: params.projectId,
    team: { $in: teamIds },
  });
  if (!project) {
    return redirect("/");
  }
  const run = await RunService.findOne({
    _id: params.runId,
    project: params.projectId,
  });
  if (!run) {
    return redirect("/");
  }
  const session = run.sessions.find((s) => s.sessionId === params.sessionId);
  if (!session) {
    return redirect("/");
  }

  const sessionPath = `storage/${params.projectId}/runs/${params.runId}/${params.sessionId}/${session.name}`;

  const storage = getStorageAdapter();

  const downloadedPath = await storage.download({ sourcePath: sessionPath });
  const sessionFile = await fse.readJSON(downloadedPath);

  const runSetId = params.runSetId;
  const runSet = runSetId ? await RunSetService.findById(runSetId) : null;

  const sidebarQueryParams = getQueryParamsFromRequest(
    request,
    { searchValue: "", currentPage: 1, sort: "name", filters: {} },
    { paramPrefix: "sidebar" },
  );

  const paginatedSessions = RunService.paginateSessions(run.sessions, {
    searchValue: sidebarQueryParams.searchValue,
    sort: sidebarQueryParams.sort,
    page: sidebarQueryParams.currentPage,
    filters: sidebarQueryParams.filters,
  });

  return {
    project,
    run,
    session,
    sessionFile,
    runSet,
    paginatedSessions,
  };
}

export default function ProjectRunSessionsRoute({
  params,
}: Route.ComponentProps) {
  const { project, run, sessionFile, session, runSet, paginatedSessions } =
    useLoaderData();

  const parentBreadcrumbs = runSet
    ? [
        {
          text: "Run Sets",
          link: `/projects/${project._id}/run-sets`,
        },
        {
          text: runSet.name,
          link: `/projects/${project._id}/run-sets/${runSet._id}`,
        },
      ]
    : [
        {
          text: "Runs",
          link: `/projects/${project._id}`,
        },
      ];

  const runLink = runSet
    ? `/projects/${project._id}/run-sets/${runSet._id}/runs/${run._id}`
    : `/projects/${project._id}/runs/${run._id}`;

  const breadcrumbs = [
    {
      text: "Projects",
      link: `/`,
    },
    {
      text: project.name,
      link: `/projects/${project._id}`,
    },
    ...parentBreadcrumbs,
    {
      text: run.name,
      link: runLink,
    },
    {
      text: session.name,
    },
  ];

  const {
    searchValue: sidebarSearchValue,
    setSearchValue: setSidebarSearchValue,
    currentPage: sidebarCurrentPage,
    setCurrentPage: setSidebarCurrentPage,
    isSyncing: sidebarIsSyncing,
  } = useSearchQueryParams(
    { searchValue: "", currentPage: 1, sortValue: "name" },
    { paramPrefix: "sidebar" },
  );

  const navigation = useNavigation();
  const isLoadingSession =
    navigation.state === "loading" &&
    navigation.location?.pathname.endsWith(`/sessions/${params.sessionId}`) ===
      false;

  return (
    <RunSessions
      run={run}
      session={session}
      sessionFile={sessionFile}
      breadcrumbs={breadcrumbs}
      runLink={runLink}
      currentSessionId={params.sessionId}
      paginatedSessions={paginatedSessions}
      sidebarSearchValue={sidebarSearchValue}
      sidebarCurrentPage={sidebarCurrentPage}
      sidebarIsSyncing={sidebarIsSyncing}
      isLoadingSession={isLoadingSession}
      onSidebarSearchValueChanged={setSidebarSearchValue}
      onSidebarPaginationChanged={setSidebarCurrentPage}
    />
  );
}
