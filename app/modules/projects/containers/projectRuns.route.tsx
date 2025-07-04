import getDocuments from "~/core/documents/getDocuments";
import { useLoaderData, useSubmit } from "react-router";
import ProjectRuns from "../components/projectRuns";
import addDialog from "~/core/dialogs/addDialog";
import CreateRunDialog from '../components/createRunDialog';
import type { Run } from "~/modules/runs/runs.types";
import createDocument from "~/core/documents/createDocument";
import type { Route } from "./+types/projectRuns.route";

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
        }
      }) as { data: Run };
      return {
        intent: 'CREATE_RUN',
        ...run
      }
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
    />
  )
}