import getDocuments from "~/core/documents/getDocuments";
import type { Route } from "./+types/project.route";
import { useLoaderData } from "react-router";
import ProjectFiles from "../components/projectFiles";

type Files = {
  data: [],
};

export async function loader({ params }: Route.LoaderArgs) {
  const files = await getDocuments({ collection: 'files', match: { project: parseInt(params.id) }, }) as Files;
  return { files };
}

export default function ProjectFilesRoute() {
  const { files } = useLoaderData();
  return (
    <ProjectFiles
      files={files.data}
    />
  )
}