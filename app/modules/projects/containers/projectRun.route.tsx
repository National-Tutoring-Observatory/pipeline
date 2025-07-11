import { useLoaderData, useRevalidator, useRouteLoaderData, useSubmit } from "react-router";
import ProjectRun from "../components/projectRun";
import type { CreateRun, Run as RunType } from "~/modules/runs/runs.types";
import getDocument from "~/core/documents/getDocument";
import type { Route } from "./+types/projectRun.route";
import { useEffect, useState } from "react";
import updateDocument from "~/core/documents/updateDocument";
import annotateRunSessions from "~/core/annotations/annotateRunSessions";
import throttle from 'lodash/throttle';
import type { Prompt, PromptVersion } from "~/modules/prompts/prompts.types";
import type { Session } from "~/modules/sessions/sessions.types";
import updateBreadcrumb from "~/core/app/updateBreadcrumb";
import type { Project } from "../projects.types";
import exportRun from "~/modules/runs/helpers/exportRun";

type Run = {
  data: RunType,
};

export async function loader({ params }: Route.LoaderArgs) {
  const project = await getDocument({ collection: 'projects', match: { _id: parseInt(params.projectId), }, }) as Project;
  const run = await getDocument({ collection: 'runs', match: { _id: parseInt(params.runId), project: parseInt(params.projectId) }, }) as Run;
  let runPrompt;
  let runPromptVersion;
  if (run.data.hasSetup) {
    runPrompt = await getDocument({ collection: 'prompts', match: { _id: Number(run.data.prompt) } }) as { data: Prompt };
    runPromptVersion = await getDocument({ collection: 'promptVersions', match: { prompt: Number(run.data.prompt), version: Number(run.data.promptVersion) } }) as { data: PromptVersion };
  }
  return { project, run, runPrompt, runPromptVersion };
}


export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json();

  const {
    prompt,
    promptVersion,
    model,
    sessions,
    exportType
  } = payload;

  switch (intent) {
    case 'START_RUN':
      const run = await getDocument({
        collection: 'runs',
        match: { _id: Number(params.runId), project: Number(params.projectId) }
      }) as Run;

      const sessionsAsObjects = [];

      for (const session of sessions) {
        const sessionModel = await getDocument({ collection: 'sessions', match: { _id: session } }) as { data: Session };
        sessionsAsObjects.push({
          name: sessionModel.data.name,
          fileType: sessionModel.data.fileType,
          sessionId: session,
          status: 'NOT_STARTED'
        });
      }

      await updateDocument({
        collection: 'runs',
        match: { _id: Number(params.runId) },
        update: {
          hasSetup: true,
          prompt,
          promptVersion,
          model,
          sessions: sessionsAsObjects
        }
      }) as Run;

      annotateRunSessions({ runId: run.data._id });

      return {}
    case 'EXPORT_RUN': {

      exportRun({ runId: Number(params.runId), exportType });

      return {};
    }
    default:
      return {};
  }
}

const debounceRevalidate = throttle((revalidate) => {
  revalidate();
}, 2000);

export default function ProjectRunRoute() {
  const { project, run, runPrompt, runPromptVersion } = useLoaderData();

  const [runSessionsProgress, setRunSessionsProgress] = useState(0);
  const [runSessionsStep, setRunSessionsStep] = useState('');
  const submit = useSubmit();
  const { revalidate, state } = useRevalidator();

  const onStartRunClicked = ({
    selectedAnnotationType,
    selectedPrompt,
    selectedPromptVersion,
    selectedModel,
    selectedSessions }: CreateRun) => {
    submit(JSON.stringify({
      intent: 'START_RUN',
      payload: {
        annotationType: selectedAnnotationType,
        prompt: Number(selectedPrompt),
        promptVersion: Number(selectedPromptVersion),
        model: selectedModel,
        sessions: selectedSessions
      }
    }), { method: 'POST', encType: 'application/json' });
  }

  const onExportRunButtonClicked = ({ exportType }: { exportType: string }) => {
    submit(JSON.stringify({
      intent: 'EXPORT_RUN',
      payload: {
        exportType
      }
    }), { method: 'POST', encType: 'application/json' });
  }

  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.runId === run.data._id) {
        switch (data.event) {
          case 'ANNOTATE_RUN_SESSION':
            setRunSessionsProgress(data.progress);
            if (data.step) {
              setRunSessionsStep(data.step);
            }
            debounceRevalidate(revalidate);
            break;
        }
      }
    };
    return () => {
      eventSource.close();
    }
  }, []);

  useEffect(() => {
    updateBreadcrumb([{
      text: 'Projects', link: `/`
    }, {
      text: project.data.name, link: `/projects/${project.data._id}`
    }, {
      text: 'Runs'
    }, {
      text: run.data.name
    }])
  }, []);


  return (
    <ProjectRun
      run={run.data}
      runPrompt={runPrompt?.data}
      runPromptVersion={runPromptVersion?.data}
      runSessionsProgress={runSessionsProgress}
      runSessionsStep={runSessionsStep}
      onStartRunClicked={onStartRunClicked}
      onExportRunButtonClicked={onExportRunButtonClicked}
    />
  )
}