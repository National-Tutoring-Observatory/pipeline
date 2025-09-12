import { useActionData, useLoaderData, useNavigate, useSubmit } from "react-router";
import ProjectRuns from "../components/projectRuns";
import addDialog from "~/modules/dialogs/addDialog";
import CreateRunDialog from '../components/createRunDialog';
import type { Run } from "~/modules/runs/runs.types";
import type { Route } from "./+types/projectRuns.route";
import EditRunDialog from "../components/editRunDialog";
import { toast } from "sonner";
import DuplicateRunDialog from '../components/duplicateRunDialog';
import { useEffect } from "react";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";

type Runs = {
  data: [],
};

export async function loader({ params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const runs = await documents.getDocuments({ collection: 'runs', match: { project: params.id }, sort: {} }) as Runs;
  return { runs };
}


export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json();

  const { name, annotationType } = payload;
  let run;

  const documents = getDocumentsAdapter();

  switch (intent) {
    case 'CREATE_RUN': {
      if (typeof name !== "string") {
        throw new Error("Run name is required and must be a string.");
      }
      if (typeof annotationType !== "string") {
        throw new Error("Annotation type is required and must be a string.");
      }
      run = await documents.createDocument({
        collection: 'runs', update: {
          project: params.id,
          name,
          annotationType,
          hasSetup: false,
          isRunning: false,
          isComplete: false
        }
      }) as { data: Run };
      return {
        intent: 'CREATE_RUN',
        ...run
      }
    }
    case 'UPDATE_RUN': {

      if (typeof name !== "string") {
        throw new Error("Run name is required and must be a string.");
      }
      await documents.updateDocument({
        collection: 'runs',
        match: {
          _id: entityId,
        },
        update: {
          name
        }
      }) as { data: Run };
      return {};
    }
    case 'DUPLICATE_RUN': {

      if (typeof name !== "string") {
        throw new Error("Run name is required and must be a string.");
      }
      const existingRun = await documents.getDocument({
        collection: 'runs',
        match: {
          _id: entityId,
        }
      }) as { data: Run };
      const { project, annotationType, prompt, promptVersion, model, sessions } = existingRun.data;

      run = await documents.createDocument({
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
      }) as { data: Run };
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