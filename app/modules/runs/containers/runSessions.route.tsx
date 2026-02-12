import fse from "fs-extra";
import find from "lodash/find";
import map from "lodash/map";
import { redirect, useLoaderData } from "react-router";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import { RunSetService } from "~/modules/runSets/runSet";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import RunSessions from "../components/runSessions";
import buildSessionNavigation from "../helpers/buildSessionNavigation";
import type { Route } from "./+types/runSessions.route";

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
  const session = find(run.sessions, (session) => {
    if (session.sessionId === params.sessionId) {
      return session;
    }
  }) as { name: string };

  const sessionPath = `storage/${params.projectId}/runs/${params.runId}/${params.sessionId}/${session?.name}`;

  const storage = getStorageAdapter();

  const downloadedPath = await storage.download({ sourcePath: sessionPath });
  const sessionFile = await fse.readJSON(downloadedPath);

  const runSetId = params.runSetId;
  const runSet = runSetId ? await RunSetService.findById(runSetId) : null;

  const { currentIndex, totalDone, prevSessionId, nextSessionId } =
    buildSessionNavigation(run.sessions, params.sessionId);

  const buildSessionUrl = (sessionId: string) => {
    const base = runSetId
      ? `/projects/${params.projectId}/run-sets/${runSetId}/runs/${params.runId}`
      : `/projects/${params.projectId}/runs/${params.runId}`;
    return `${base}/sessions/${sessionId}`;
  };

  const sessionNavigation = {
    currentIndex,
    totalDone,
    prevSessionUrl: prevSessionId ? buildSessionUrl(prevSessionId) : null,
    nextSessionUrl: nextSessionId ? buildSessionUrl(nextSessionId) : null,
  };

  return { project, run, session, sessionFile, runSet, sessionNavigation };
}

export default function ProjectRunSessionsRoute() {
  const { project, run, sessionFile, session, runSet, sessionNavigation } =
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

  return (
    <RunSessions
      run={run}
      session={session}
      sessionFile={sessionFile}
      breadcrumbs={breadcrumbs}
      sessionNavigation={sessionNavigation}
    />
  );
}
