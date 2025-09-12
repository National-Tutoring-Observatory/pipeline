import ProjectRunSessions from "../components/projectRunSessions";
import type { Route } from "./+types/projectRunSessions.route";
import type { Project } from "../projects.types";
import type { Run } from "~/modules/runs/runs.types";
import find from 'lodash/find';
import fse from 'fs-extra';
import { useLoaderData } from "react-router";
import { useEffect } from "react";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import path from "path";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";

export async function loader({ params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const project = await documents.getDocument({ collection: 'projects', match: { _id: params.projectId, }, }) as Project;
  const run = await documents.getDocument({ collection: 'runs', match: { _id: params.runId, project: params.projectId }, }) as { data: Run };
  const session = find(run.data.sessions, (session) => {
    if (session.sessionId === params.sessionId) {
      return session;
    }
  }) as { name: string };

  const sessionPath = `storage/${params.projectId}/runs/${params.runId}/${params.sessionId}/${session?.name}`;

  const storage = getStorageAdapter();

  await storage.download({ downloadPath: sessionPath });

  const sessionFile = await fse.readJSON(path.join('tmp', sessionPath));
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