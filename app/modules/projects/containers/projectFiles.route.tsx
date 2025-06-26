import getDocuments from "~/core/documents/getDocuments";
import type { Route } from "./+types/project.route";
import { useLoaderData } from "react-router";

type Files = {
  data: [],
};

export async function loader({ params }: Route.LoaderArgs) {
  const files = await getDocuments({ collection: 'files', match: { project: parseInt(params.id) }, }) as Files;
  return { files };
}

export default function ProjectRunsRoute() {
  const data = useLoaderData();
  return (
    <div className="pt-4">
      Files list will display here
    </div>
  )
}