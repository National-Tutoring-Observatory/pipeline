import { useLoaderData, useSubmit } from "react-router";
import ProjectRun from "../components/projectRun";
import type { Run as RunType } from "~/modules/runs/runs.types";
import getDocument from "~/core/documents/getDocument";
import type { Route } from "./+types/projectRun.route";
import { useEffect, useState } from "react";
import updateDocument from "~/core/documents/updateDocument";
import annotateRunSessions from "~/core/annotations/annotateRunSessions";

type Run = {
  data: RunType,
};

export async function loader({ params }: Route.LoaderArgs) {
  const run = await getDocument({ collection: 'runs', match: { _id: parseInt(params.runId), project: parseInt(params.projectId) }, }) as Run;
  return { run };
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
    sessions } = payload;

  switch (intent) {
    case 'START_RUN':
      const run = await getDocument({
        collection: 'runs',
        match: { _id: Number(params.runId), project: Number(params.projectId) }
      }) as Run;

      const sessionsAsObjects = [];

      for (const session of sessions) {
        sessionsAsObjects.push({
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
    default:
      return {};
  }
}

export default function ProjectRunRoute() {
  const { run } = useLoaderData();

  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [selectedPromptVersion, setSelectedPromptVersion] = useState('');
  const [selectedModel, setSelectedModel] = useState('GEMINI');
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [isRunButtonDisabled, setIsRunButtonDisabled] = useState(true);
  const submit = useSubmit();

  const onSelectedPromptChanged = (selectedPrompt: string) => {
    setSelectedPrompt(selectedPrompt);
  }

  const onSelectedPromptVersionChanged = (selectedPromptVersion: string) => {
    setSelectedPromptVersion(selectedPromptVersion);
  }

  const onSelectedModelChanged = (selectedModel: string) => {
    setSelectedModel(selectedModel);
  }

  const onSelectedSessionsChanged = (selectedSessions: string[]) => {
    setSelectedSessions(selectedSessions);
  }

  const onStartRunClicked = () => {
    submit(JSON.stringify({
      intent: 'START_RUN', payload: {
        prompt: Number(selectedPrompt),
        promptVersion: Number(selectedPromptVersion),
        model: selectedModel,
        sessions: selectedSessions
      }
    }), { method: 'POST', encType: 'application/json' });
  }

  useEffect(() => {
    if (selectedPrompt && selectedPromptVersion.length > 0 && selectedSessions.length > 0) {
      setIsRunButtonDisabled(false);
    }
  }, [selectedPrompt, selectedPromptVersion, selectedModel, selectedSessions]);


  return (
    <ProjectRun
      run={run.data}
      selectedPrompt={selectedPrompt}
      selectedPromptVersion={selectedPromptVersion}
      selectedModel={selectedModel}
      selectedSessions={selectedSessions}
      isRunButtonDisabled={isRunButtonDisabled}
      onSelectedPromptChanged={onSelectedPromptChanged}
      onSelectedPromptVersionChanged={onSelectedPromptVersionChanged}
      onSelectedModelChanged={onSelectedModelChanged}
      onSelectedSessionsChanged={onSelectedSessionsChanged}
      onStartRunClicked={onStartRunClicked}
    />
  )
}