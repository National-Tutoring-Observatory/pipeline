import has from 'lodash/has';
import map from 'lodash/map';
import throttle from 'lodash/throttle';
import { useEffect, useState } from "react";
import { redirect, useFetcher, useLoaderData, useRevalidator, useSubmit } from "react-router";
import { toast } from "sonner";
import useHandleSockets from '~/modules/app/hooks/useHandleSockets';
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import addDialog from "~/modules/dialogs/addDialog";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Prompt, PromptVersion } from "~/modules/prompts/prompts.types";
import exportRun from "~/modules/runs/helpers/exportRun";
import type { CreateRun, Run } from "~/modules/runs/runs.types";
import EditRunDialog from "../components/editRunDialog";
import ProjectRun from "../components/projectRun";
import type { Project } from "../projects.types";
import createRunAnnotations from '../services/createRunAnnotations.server';
import startRun from '../services/startRun.server';
import type { Route } from "./+types/projectRun.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, 'team');
  const project = await documents.getDocument<Project>({ collection: 'projects', match: { _id: params.projectId, team: { $in: teamIds } } });
  if (!project.data) {
    return redirect('/');
  }
  const run = await documents.getDocument<Run>({ collection: 'runs', match: { _id: params.runId, project: params.projectId }, });
  if (!run.data) {
    return redirect('/');
  }
  let runPrompt;
  let runPromptVersion;
  if (run.data.hasSetup) {
    runPrompt = await documents.getDocument<Prompt>({ collection: 'prompts', match: { _id: run.data.prompt } });
    runPromptVersion = await documents.getDocument<PromptVersion>({ collection: 'promptVersions', match: { prompt: run.data.prompt, version: Number(run.data.promptVersion) } });
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
        modelCode: model
      }, { request, context });

      if (!run.data) throw new Error('Run not created');
      createRunAnnotations({ runId: run.data._id }, { request });

      return {}
    }
    case 'RE_RUN': {
      const run = await documents.getDocument<Run>({
        collection: 'runs',
        match: { _id: params.runId, project: params.projectId }
      });
      if (!run.data) throw new Error('Run not found');
      createRunAnnotations({ runId: run.data._id }, { request });

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
  const fetcher = useFetcher();
  const { revalidate, state } = useRevalidator();

  useEffect(() => {
    if (fetcher.state === 'idle' && (fetcher.data)) {
      toast.success('Updated run');
    }
  }, [fetcher.state, fetcher.data]);

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

  const onEditRunButtonClicked = (run: Run) => {
    addDialog(<EditRunDialog
      run={run}
      onEditRunClicked={(r: Run) => {
        fetcher.submit(JSON.stringify({ intent: 'UPDATE_RUN', entityId: r._id, payload: { name: r.name } }), { method: 'PUT', encType: 'application/json', action: `/projects/${project.data._id}` });
      }}
    />);
  }

  useHandleSockets({
    event: 'ANNOTATE_RUN',
    matches: [{
      runId: run.data._id,
      task: 'ANNOTATE_RUN:START',
      status: 'FINISHED'
    }, {
      runId: run.data._id,
      task: 'ANNOTATE_RUN:PROCESS',
      status: 'STARTED'
    }, {
      runId: run.data._id,
      task: 'ANNOTATE_RUN:PROCESS',
      status: 'FINISHED'
    }, {
      runId: run.data._id,
      task: 'ANNOTATE_RUN:FINISH',
      status: 'FINISHED'
    }], callback: (payload) => {
      if (has(payload, 'progress')) {
        setRunSessionsProgress(payload.progress);
      }
      if (has(payload, 'step')) {
        setRunSessionsStep(payload.step);
      }
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
            // If the export finished, trigger download automatically.
            if (data.status === 'DONE') {
              const url = data.url;
              const a = document.createElement('a');
              a.href = url;
              a.target = '_blank';
              a.rel = 'noopener';
              // Append to body before clicking to ensure Safari compatibility
              document.body.appendChild(a);
              a.click();
              // Remove after click
              document.body.removeChild(a);
            }
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
      onEditRunButtonClicked={onEditRunButtonClicked}
    />
  )
}
