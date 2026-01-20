import map from 'lodash/map';
import { useEffect, useState } from "react";
import { redirect, useActionData, useLoaderData, useNavigate, useSubmit } from "react-router";
import { toast } from "sonner";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import type { CreateRun } from "~/modules/runs/runs.types";
import ProjectCreateRun from '../components/projectCreateRun';
import startRun from '../services/startRun.server';
import type { Route } from "./+types/projectCreateRun.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, 'team');
  const project = await ProjectService.findOne({ _id: params.projectId, team: { $in: teamIds } });
  if (!project) {
    return redirect('/');
  }
  return { project };
}

export async function action({
  request,
  params,
  context
}: Route.ActionArgs) {

  const { intent, payload = {} } = await request.json();

  const {
    name,
    annotationType,
    prompt,
    promptVersion,
    model,
    sessions
  } = payload;

  switch (intent) {
    case 'CREATE_AND_START_RUN': {
      if (typeof name !== "string") {
        throw new Error("Run name is required and must be a string.");
      }
      if (!['PER_UTTERANCE', 'PER_SESSION'].includes(annotationType)) {
        throw new Error("Invalid annotation type.");
      }

      const newRun = await RunService.create({
        project: params.projectId,
        name,
        annotationType,
        hasSetup: false,
        isRunning: false,
        isComplete: false
      });

      const startedRun = await startRun({
        runId: newRun._id,
        projectId: params.projectId,
        sessions,
        annotationType: annotationType,
        prompt,
        promptVersion: Number(promptVersion),
        modelCode: model
      }, { request, context });

      if (!startedRun) {
        throw new Error('Failed to start run');
      }

      await RunService.createAnnotations(startedRun);

      return {
        intent: 'CREATE_AND_START_RUN',
        data: startedRun
      }
    }
    default: {
      return {};
    }
  }
}

export default function ProjectCreateRunRoute() {
  const { project } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const navigate = useNavigate();
  const [runName, setRunName] = useState('');

  const onRunNameChanged = (name: string) => {
    setRunName(name);
  }

  const onStartRunClicked = ({
    selectedAnnotationType,
    selectedPrompt,
    selectedPromptVersion,
    selectedModel,
    selectedSessions }: CreateRun) => {

    submit(JSON.stringify({
      intent: 'CREATE_AND_START_RUN',
      payload: {
        name: runName,
        annotationType: selectedAnnotationType,
        prompt: selectedPrompt,
        promptVersion: Number(selectedPromptVersion),
        model: selectedModel,
        sessions: selectedSessions
      }
    }), { method: 'POST', encType: 'application/json' });
  }

  useEffect(() => {
    if (actionData?.intent === 'CREATE_AND_START_RUN') {
      toast.success('Run created and started');
      navigate(`/projects/${actionData.data.project}/runs/${actionData.data._id}`);
    }
  }, [actionData]);

  const breadcrumbs = [{ text: 'Projects', link: `/` }, { text: project!.name, link: `/projects/${project!._id}` }, { text: 'Create run' }];

  return (
    <ProjectCreateRun
      breadcrumbs={breadcrumbs}
      runName={runName}
      onRunNameChanged={onRunNameChanged}
      onStartRunClicked={onStartRunClicked}
    />
  )
}
