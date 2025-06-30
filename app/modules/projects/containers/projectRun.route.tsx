import { useLoaderData } from "react-router";
import ProjectRun from "../components/projectRun";
import type { Run as RunType } from "~/modules/runs/runs.types";
import getDocument from "~/core/documents/getDocument";
import type { Route } from "./+types/projectRun.route";

type Run = {
  data: RunType,
};

export async function loader({ params }: Route.LoaderArgs) {
  const run = await getDocument({ collection: 'runs', match: { _id: parseInt(params.runId), project: parseInt(params.projectId) }, }) as Run;
  return { run };
}

export default function ProjectRunRoute() {
  const { run } = useLoaderData();

  return (
    <ProjectRun
      run={run.data}
    />
  )
}