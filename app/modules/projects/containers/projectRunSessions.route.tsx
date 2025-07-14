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
  let runPrompt;
  let runPromptVersion;
  if (run.data.hasSetup) {
    runPrompt = await getDocument({ collection: 'prompts', match: { _id: Number(run.data.prompt) } }) as { data: Prompt };
    runPromptVersion = await getDocument({ collection: 'promptVersions', match: { prompt: Number(run.data.prompt), version: Number(run.data.promptVersion) } }) as { data: PromptVersion };
  }
  const session = find(run.data.sessions, (session) => {
    if (Number(session.sessionId) === Number(params.sessionId)) {
      return session;
    }
  }) as { name: string };
  const sessionFile = await fse.readJSON(`./storage/${params.projectId}/runs/${params.runId}/${params.sessionId}/${session?.name}`);
  return { project, run, session, sessionFile, runPrompt, runPromptVersion };
}

export default function ProjectRunSessionsRoute() {
  const { project, run, sessionFile, session, runPrompt, runPromptVersion } = useLoaderData();
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
      session={session}
      sessionFile={sessionFile}
    />
  )
}