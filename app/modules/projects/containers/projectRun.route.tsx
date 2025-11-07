import map from 'lodash/map';
import throttle from 'lodash/throttle';
import { useEffect, useState } from "react";
import { redirect, useLoaderData, useRevalidator, useSubmit } from "react-router";
import annotateRunSessions from "~/functions/annotateRunSessions";
import useHandleSockets from '~/modules/app/hooks/useHandleSockets';
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import hasFeatureFlag from '~/modules/featureFlags/helpers/hasFeatureFlag';
import type { Prompt, PromptVersion } from "~/modules/prompts/prompts.types";
import exportRun from "~/modules/runs/helpers/exportRun";
import type { CreateRun, Run as RunType } from "~/modules/runs/runs.types";
import ProjectRun from "../components/projectRun";
import type { Project } from "../projects.types";
import createRunAnnotations from '../services/createRunAnnotations.server';
import startRun from '../services/startRun.server';
import type { Route } from "./+types/projectRun.route";

type Run = {
  data: RunType,
};

export async function loader({ request, params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, 'team');
  const project = await documents.getDocument({ collection: 'projects', match: { _id: params.projectId, team: { $in: teamIds } } }) as { data: Project };
  if (!project.data) {
    return redirect('/');
  }
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
  context
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

      const { runId, projectId } = params;

      const run = await startRun({
        runId,
        projectId,
        sessions,
        annotationType,
        prompt,
        promptVersion,
        model
      }, { request, context });

      const hasWorkers = await hasFeatureFlag('HAS_WORKERS', { request });

      if (hasWorkers) {
        createRunAnnotations({ runId: run.data._id }, { request });
      } else {
        annotateRunSessions({ runId: run.data._id }, { request });
      }

      return {}
    }
    case 'RE_RUN': {
      const run = await documents.getDocument({
        collection: 'runs',
        match: { _id: params.runId, project: params.projectId }
      }) as Run;
      annotateRunSessions({ runId: run.data._id }, { request });
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

  useHandleSockets({
    event: 'ANNOTATE_RUN_SESSIONS',
    matches: [{
      runId: run.data._id,
      task: 'ANNOTATE_PER_SESSION',
      status: 'STARTED'
    }, {
      runId: run.data._id,
      task: 'ANNOTATE_PER_SESSION',
      status: 'FINISHED'
    }, {
      runId: run.data._id,
      task: 'ANNOTATE_PER_UTTERANCE',
      status: 'STARTED'
    }, {
      runId: run.data._id,
      task: 'ANNOTATE_PER_UTTERANCE',
      status: 'FINISHED'
    }], callback: () => {
      debounceRevalidate(revalidate);
    }
  })

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
