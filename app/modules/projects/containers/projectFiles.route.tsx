import { useLoaderData } from "react-router";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { File } from "~/modules/files/files.types";
import ProjectFiles from "../components/projectFiles";
import type { Route } from "./+types/projectFiles.route";

export async function loader({ params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const result = await documents.getDocuments<File>({ collection: 'files', match: { project: params.id }, sort: {} });
  const files = { data: result.data };
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
