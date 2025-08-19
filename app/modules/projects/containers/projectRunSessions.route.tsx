import getDocument from "~/core/documents/getDocument";
import ProjectRunSessions from "../components/projectRunSessions";
import type { Route } from "./+types/projectRunSessions.route";
import type { Project } from "../projects.types";
import type { Run } from "~/modules/runs/runs.types";
import type { Prompt, PromptVersion } from "~/modules/prompts/prompts.types";
import find from 'lodash/find';
import fse from 'fs-extra';
import { useLoaderData } from "react-router";
import { useEffect } from "react";
import updateBreadcrumb from "~/core/app/updateBreadcrumb";

export async function loader({ params }: Route.LoaderArgs) {
  const project = await getDocument({ collection: 'projects', match: { _id: parseInt(params.projectId), }, }) as Project;
  const run = await getDocument({ collection: 'runs', match: { _id: parseInt(params.runId), project: parseInt(params.projectId) }, }) as { data: Run };
  const session = find(run.data.sessions, (session) => {
    if (Number(session.sessionId) === Number(params.sessionId)) {
      return session;
    }
  }) as { name: string };
  const sessionFile = await fse.readJSON(`storage/${params.projectId}/runs/${params.runId}/${params.sessionId}/${session?.name}`);
  return { project, run, session, sessionFile };
}

export default function ProjectRunSessionsRoute() {
  const { project, run, sessionFile, session } = useLoaderData();
  useEffect(() => {
    updateBreadcrumb([{
      text: 'Projects', link: `/`
    }, {
      text: project.data.name, link: `/projects/${project.data._id}`
    }, {
      text: 'Runs', link: `/projects/${project.data._id}`
    }, {
      text: run.data.name, link: `/projects/${project.data._id}/runs/${run.data._id}`
    }, {
      text: 'Session'
    }])
  }, []);

  return (
    <ProjectRunSessions
      run={run.data}
      session={session}
      sessionFile={sessionFile}
    />
  )
}