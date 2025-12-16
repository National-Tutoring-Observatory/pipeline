import { redirect, useLoaderData } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import ProjectAuthorization from "~/modules/projects/authorization";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { File } from "~/modules/files/files.types";
import type { Project } from "~/modules/projects/projects.types";
import type { User } from "~/modules/users/users.types";
import ProjectFiles from "../components/projectFiles";
import type { Route } from "./+types/projectFiles.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  const documents = getDocumentsAdapter();
  const project = await documents.getDocument<Project>({ collection: 'projects', match: { _id: params.id } });
  if (!project.data) {
    return redirect('/');
  }

  const teamId = (project.data.team as any)._id || project.data.team;
  if (!ProjectAuthorization.canView(user, teamId)) {
    return redirect('/');
  }

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
