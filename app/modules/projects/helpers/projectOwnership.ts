import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import { isTeamMember } from "~/modules/teams/helpers/teamMembership";
import type { User } from "~/modules/users/users.types";

export async function isProjectOwner({
  user,
  projectId,
}: {
  user: User;
  projectId: string;
}): Promise<boolean> {
  const documents = getDocumentsAdapter();

  const project = await documents.getDocument({
    collection: 'projects',
    match: { _id: projectId },
  }) as { data: { team: string } | null };

  if (!project.data) {
    return false;
  }

  return await isTeamMember({ user, teamId: project.data.team });
}

export async function validateProjectOwnership({
  user,
  projectId,
}: {
  user: User;
  projectId: string;
}) {
  if (!(await isProjectOwner({ user, projectId }))) {
    throw new Error("You do not have permission to access this project.");
  }
}
