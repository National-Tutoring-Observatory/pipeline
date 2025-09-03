import { useLoaderData, useRevalidator, useRouteLoaderData, useSubmit } from "react-router";
import ProjectRun from "../components/projectRun";
import type { CreateRun, Run as RunType } from "~/modules/runs/runs.types";
import type { Route } from "./+types/projectRun.route";
import { useEffect, useState } from "react";
import annotateRunSessions from "~/core/annotations/annotateRunSessions";
import throttle from 'lodash/throttle';
import type { Prompt, PromptVersion } from "~/modules/prompts/prompts.types";
import type { Session } from "~/modules/sessions/sessions.types";
import updateBreadcrumb from "~/core/app/updateBreadcrumb";
import type { Project } from "../projects.types";
import exportRun from "~/modules/runs/helpers/exportRun";
import getDocumentsAdapter from "~/core/documents/helpers/getDocumentsAdapter";

type Run = {
  data: RunType,
};

export async function loader({ params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const project = await documents.getDocument({ collection: 'projects', match: { _id: params.projectId, }, }) as Project;
  const run = await documents.getDocument({ collection: 'runs', match: { _id: params.runId, project: params.projectId }, }) as Run;
  let runPrompt;
  let runPromptVersion;
  if (run.data.hasSetup) {
    runPrompt = await documents.getDocument({ collection: 'prompts', match: { _id: run.data.prompt } }) as { data: Prompt };
    runPromptVersion = await documents.getDocument({ collection: 'promptVersions', match: { prompt: run.data.prompt, version: Number(run.data.promptVersion) } }) as { data: PromptVersion };
  }
  return { project, run, runPrompt, runPromptVersion };
}


export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json();

  const {
    annotationType,
    prompt,
    promptVersion,
    model,
    sessions,
    exportType
  } = payload;

  const documents = getDocumentsAdapter();

  switch (intent) {
    case 'START_RUN': {

      const run = await documents.getDocument({
        collection: 'runs',
        match: { _id: params.runId, project: params.projectId }
      }) as Run;

      const sessionsAsObjects = [];

      for (const session of sessions) {
        const sessionModel = await documents.getDocument({ collection: 'sessions', match: { _id: session } }) as { data: Session };
        sessionsAsObjects.push({
          name: sessionModel.data.name,
          fileType: sessionModel.data.fileType,
          sessionId: session,
          status: 'NOT_STARTED'
        });
      }

      await documents.updateDocument({
        collection: 'runs',
        match: { _id: params.runId },
        update: {
          hasSetup: true,
          annotationType,
          prompt,
          promptVersion,
          model,
          sessions: sessionsAsObjects
        }
      }) as Run;

      annotateRunSessions({ runId: run.data._id });

      return {}
    }
    case 'RE_RUN': {
      const run = await documents.getDocument({
        collection: 'runs',
        match: { _id: params.runId, project: params.projectId }
      }) as Run;
      annotateRunSessions({ runId: run.data._id });
      return {};
    }
    case 'EXPORT_RUN': {

      exportRun({ runId: params.runId, exportType });

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
        prompt: selectedPrompt,
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

  const onReRunClicked = () => {
    submit(JSON.stringify({
      intent: 'RE_RUN',
      payload: {}
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
          case 'EXPORT_RUN':
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
      text: 'Runs', link: `/projects/${project.data._id}`
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
      onReRunClicked={onReRunClicked}
    />
  )
}