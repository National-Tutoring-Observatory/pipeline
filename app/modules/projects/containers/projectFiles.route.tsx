import { redirect, useLoaderData } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import ProjectAuthorization from "~/modules/projects/authorization";
import { FileService } from "~/modules/files/file";
import type { File } from "~/modules/files/files.types";
import type { Project } from "~/modules/projects/projects.types";
import type { User } from "~/modules/users/users.types";
import { ProjectService } from "../project";
import ProjectFiles from "../components/projectFiles";
import type { Route } from "./+types/projectFiles.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  const project = await ProjectService.findById(params.id);
  if (!project) {
    return redirect('/');
  }

  if (!ProjectAuthorization.canView(user, project)) {
    return redirect('/');
  }

  const files = await FileService.findByProject(params.id);
  return { files };
}

export default function ProjectFilesRoute() {
  const { files } = useLoaderData();
  return (
    <ProjectFiles
      files={files}
    />
  )
}
