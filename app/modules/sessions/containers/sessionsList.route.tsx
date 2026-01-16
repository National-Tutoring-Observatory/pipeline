import { redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import type { User } from "~/modules/users/users.types";
import { SessionService } from "../session";
import type { Route } from "./+types/sessionsList.route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get('project');

  if (!projectId) {
    return redirect('/');
  }

  const project = await ProjectService.findById(projectId);
  if (!project) {
    return redirect('/');
  }

  if (!ProjectAuthorization.canView(user, project)) {
    return redirect('/');
  }

  const sessionsList = await SessionService.find({
    match: { project: projectId, hasConverted: true },
    sort: {}
  });
  const count = await SessionService.count({ project: projectId, hasConverted: true });

  return { sessions: { data: sessionsList, count } };
}
