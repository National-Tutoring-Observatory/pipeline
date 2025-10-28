import type { Project } from "~/modules/projects/projects.types";
import type { User } from "~/modules/users/users.types";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import validateTeamMembership from "~/modules/teams/helpers/validateTeamMembership";

export default async function({
  user,
  projectId,
}: {
  user: User;
  projectId: string;
}) {
  const documents = getDocumentsAdapter();

  const project = await documents.getDocument({
    collection: 'projects',
    match: { _id: projectId },
  }) as { data: { team: string } | null };

  if (!project.data) {
    throw new Error("The project does not exist.");
  }

  validateTeamMembership({ user: user, teamId: project.data.team })
}
