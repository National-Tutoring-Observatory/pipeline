import fse from 'fs-extra';
import find from 'lodash/find';
import map from 'lodash/map';
import { useEffect } from "react";
import { redirect, useLoaderData } from "react-router";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import ProjectRunSessions from "../components/projectRunSessions";
import type { Route } from "./+types/projectRunSessions.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, 'team');
  const project = await ProjectService.findOne({ _id: params.projectId, team: { $in: teamIds } });
  if (!project) {
    return redirect('/');
  }
  const run = await RunService.findOne({ _id: params.runId, project: params.projectId });
  if (!run) {
    return redirect('/');
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
  return { project, run, session, sessionFile };
}

export default function ProjectRunSessionsRoute() {
  const { project, run, sessionFile, session } = useLoaderData();
  useEffect(() => {
    updateBreadcrumb([{
      text: 'Projects', link: `/`
    }, {
      text: project.name, link: `/projects/${project._id}`
    }, {
      text: 'Runs', link: `/projects/${project._id}`
    }, {
      text: run.name, link: `/projects/${project._id}/runs/${run._id}`
    }, {
      text: 'Session'
    }])
  }, []);

  return (
    <ProjectRunSessions
      run={run}
      session={session}
      sessionFile={sessionFile}
    />
  )
}
