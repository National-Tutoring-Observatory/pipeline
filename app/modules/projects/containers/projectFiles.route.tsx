import getDocuments from "~/core/documents/getDocuments";
import { useLoaderData } from "react-router";
import ProjectFiles from "../components/projectFiles";
import type { File } from "~/modules/files/files.types";
import type { Route } from "./+types/projectFiles.route";

type Files = {
  data: [File],
};

export async function loader({ params }: Route.LoaderArgs) {
  const files = await getDocuments({ collection: 'files', match: { project: parseInt(params.id) }, sort: {} }) as Files;
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