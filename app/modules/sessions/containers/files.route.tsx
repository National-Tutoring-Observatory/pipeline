import { redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { FileService } from "~/modules/files/file";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import type { User } from "~/modules/users/users.types";
import Files from "../components/files";
import type { Route } from "./+types/files.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = (await getSessionUser({ request })) as User;
  if (!user) {
    return redirect("/");
  }

  const project = await ProjectService.findById(params.id);
  if (!project) {
    return redirect("/");
  }

  if (!ProjectAuthorization.canView(user, project)) {
    return redirect("/");
  }

  const canUpdate = ProjectAuthorization.canUpdate(user, project);
  const isProcessing = project.isUploadingFiles || project.isConvertingFiles;
  const files = await FileService.findByProject(params.id);
  return { files, projectId: params.id, canUpdate, isProcessing };
}

export default function ProjectFilesRoute({
  loaderData,
}: Route.ComponentProps) {
  const { files, projectId, canUpdate, isProcessing } = loaderData;
  return (
    <Files
      files={files}
      projectId={projectId}
      canUpdate={canUpdate}
      isProcessing={isProcessing}
    />
  );
}
