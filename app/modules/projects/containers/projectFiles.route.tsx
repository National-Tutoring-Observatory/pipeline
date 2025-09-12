import { useLoaderData } from "react-router";
import ProjectFiles from "../components/projectFiles";
import type { File } from "~/modules/files/files.types";
import type { Route } from "./+types/projectFiles.route";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";

type Files = {
  data: [File],
};

export async function loader({ params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const files = await documents.getDocuments({ collection: 'files', match: { project: params.id }, sort: {} }) as Files;
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