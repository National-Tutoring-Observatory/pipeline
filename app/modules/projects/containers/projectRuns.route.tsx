import { useEffect } from "react";
import { redirect, useActionData, useLoaderData, useNavigate, useSubmit } from "react-router";
import { toast } from "sonner";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import type { DocumentAdapter } from "~/modules/documents/documents.types";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import ProjectAuthorization from "~/modules/projects/authorization";
import type { Project } from "~/modules/projects/projects.types";
import type { Run } from "~/modules/runs/runs.types";
import CreateRunDialog from '../components/createRunDialog';
import DuplicateRunDialog from '../components/duplicateRunDialog';
import EditRunDialog from "../components/editRunDialog";
import ProjectRuns from "../components/projectRuns";
import type { Route } from "./+types/projectRuns.route";

export async function loader({ params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const result = await documents.getDocuments<Run>({ collection: 'runs', match: { project: params.id }, sort: {}, populate: [{ path: 'prompt' }] });
  const runs = { data: result.data };
  return { runs };
}

async function getExistingRun(documents: DocumentAdapter, runId: string): Promise<Run> {
  const existingRun = await documents.getDocument<Run>({
    collection: 'runs',
    match: {
      _id: runId,
    }
  });

  if (!existingRun.data) {
    throw new Error("Run not found.");
  }

  return existingRun.data;
}

export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json();

  const user = await getSessionUser({ request });
  if (!user) {
    return redirect('/');
  }

  const { name, annotationType } = payload;
  let run;

  const documents = getDocumentsAdapter();

  const project = await documents.getDocument<Project>({
    collection: 'projects',
    match: { _id: params.id },
  });
  if (!project.data) {
    throw new Error('Project not found');
  }
  const teamId = (project.data.team as any)._id || project.data.team;

  switch (intent) {
    case 'CREATE_RUN': {
      if (typeof name !== "string") {
        throw new Error("Run name is required and must be a string.");
      }
      if (typeof annotationType !== "string") {
        throw new Error("Annotation type is required and must be a string.");
      }
      if (!ProjectAuthorization.canManageRuns(user, teamId)) {
        throw new Error('You do not have permission to create a run in this project.');
      }
      run = await documents.createDocument<Run>({
        collection: 'runs', update: {
          project: params.id,
          name,
          annotationType,
          hasSetup: false,
          isRunning: false,
          isComplete: false
        }
      });
      return {
        intent: 'CREATE_RUN',
        ...run
      }
    }
    case 'UPDATE_RUN': {
      if (typeof name !== "string") {
        throw new Error("Run name is required and must be a string.");
      }

      if (!ProjectAuthorization.canManageRuns(user, teamId)) {
        throw new Error('You do not have permission to update runs in this project.');
      }

      const existingRun = await getExistingRun(documents, entityId);

      await documents.updateDocument<Run>({
        collection: 'runs',
        match: {
          _id: entityId,
        },
        update: {
          name
        }
      });
      return {};
    }
    case 'DUPLICATE_RUN': {

      if (typeof name !== "string") {
        throw new Error("Run name is required and must be a string.");
      }

      if (!ProjectAuthorization.canManageRuns(user, teamId)) {
        throw new Error('You do not have permission to duplicate runs in this project.');
      }

      const existingRun = await getExistingRun(documents, entityId);

      const { project, annotationType, prompt, promptVersion, model, sessions } = existingRun;

      run = await documents.createDocument<Run>({
        collection: 'runs',
        update: {
          project,
          name: name,
          annotationType,
          prompt,
          promptVersion,
          model,
          sessions,
          hasSetup: false,
          isRunning: false,
          isComplete: false
        }
      });
      return {
        intent: 'DUPLICATE_RUN',
        ...run
      };
    }
    default: {
      return {};
    }
  }
}

export default function ProjectRunsRoute() {
  const { runs } = useLoaderData();
  const submit = useSubmit();
  const actionData = useActionData();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData?.intent === 'CREATE_RUN' || actionData?.intent === 'DUPLICATE_RUN') {
      navigate(`/projects/${actionData.data.project}/runs/${actionData.data._id}`)
    }
  }, [actionData]);

  const onCreateNewRunClicked = ({ name, annotationType }: { name: string, annotationType: string }) => {
    submit(JSON.stringify({ intent: 'CREATE_RUN', payload: { name, annotationType } }), { method: 'POST', encType: 'application/json' });
  }

  const onEditRunClicked = (run: Run) => {
    submit(JSON.stringify({ intent: 'UPDATE_RUN', entityId: run._id, payload: { name: run.name } }), { method: 'PUT', encType: 'application/json' }).then(() => {
      toast.success('Updated run');
    });
  }

  const onDuplicateNewRunClicked = ({ name, runId }: { name: string, runId: string }) => {
    submit(JSON.stringify({ intent: 'DUPLICATE_RUN', entityId: runId, payload: { name: name } }), { method: 'POST', encType: 'application/json' }).then(() => {
      toast.success('Duplicated run');
    });
  }

  const onEditRunButtonClicked = (run: Run) => {
    addDialog(<EditRunDialog
      run={run}
      onEditRunClicked={onEditRunClicked}
    />);
  }

  const onCreateRunButtonClicked = () => {
    addDialog(
      <CreateRunDialog
        onCreateNewRunClicked={onCreateNewRunClicked}
      />
    );
  }

  const onDuplicateRunButtonClicked = (run: Run) => {
    addDialog(<DuplicateRunDialog
      run={run}
      onDuplicateNewRunClicked={onDuplicateNewRunClicked}
    />
    );
  }

  return (
    <ProjectRuns
      runs={runs.data}
      onCreateRunButtonClicked={onCreateRunButtonClicked}
      onEditRunButtonClicked={onEditRunButtonClicked}
      onDuplicateRunButtonClicked={onDuplicateRunButtonClicked}
    />
  )
}
