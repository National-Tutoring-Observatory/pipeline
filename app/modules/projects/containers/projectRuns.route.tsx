import getDocuments from "~/core/documents/getDocuments";
import { useLoaderData, useSubmit } from "react-router";
import ProjectRuns from "../components/projectRuns";
import addDialog from "~/core/dialogs/addDialog";
import CreateRunDialog from '../components/createRunDialog';
import type { Run } from "~/modules/runs/runs.types";
import createDocument from "~/core/documents/createDocument";
import type { Route } from "./+types/projectRuns.route";
import EditRunDialog from "../components/editRunDialog";
import { toast } from "sonner";
import updateDocument from "~/core/documents/updateDocument";

type Runs = {
  data: [],
};

export async function loader({ params }: Route.LoaderArgs) {
  const runs = await getDocuments({ collection: 'runs', match: { project: parseInt(params.id) }, sort: {} }) as Runs;
  return { runs };
}


export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json();

  const { name, annotationType } = payload;

  switch (intent) {
    case 'CREATE_RUN':
      if (typeof name !== "string") {
        throw new Error("Run name is required and must be a string.");
      }
      const run = await createDocument({
        collection: 'runs', update: {
          project: Number(params.id),
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
    case 'UPDATE_RUN':
      if (typeof name !== "string") {
        throw new Error("Run name is required and must be a string.");
      }
      await updateDocument({
        collection: 'runs',
        match: {
          _id: Number(entityId),
        },
        update: {
          name
        }
      }) as { data: Run };
      return {};
    default:
      return {};
  }
}

export default function ProjectRunsRoute() {
  const { runs } = useLoaderData();

  const submit = useSubmit();

  const onCreateNewRunClicked = ({ name, annotationType }: { name: string, annotationType: string }) => {
    submit(JSON.stringify({ intent: 'CREATE_RUN', payload: { name, annotationType } }), { method: 'POST', encType: 'application/json' });
  }

  const onEditRunClicked = (run: Run) => {
    submit(JSON.stringify({ intent: 'UPDATE_RUN', entityId: run._id, payload: { name: run.name } }), { method: 'PUT', encType: 'application/json' }).then(() => {
      toast.success('Updated run');
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

  return (
    <ProjectRuns
      runs={runs.data}
      onCreateRunButtonClicked={onCreateRunButtonClicked}
      onEditRunButtonClicked={onEditRunButtonClicked}
    />
  )
}