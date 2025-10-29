import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import { isTeamMember, validateTeamMembership } from "~/modules/teams/helpers/teamMembership";
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
  const documents = getDocumentsAdapter();

  const project = await documents.getDocument({
    collection: 'projects',
    match: { _id: projectId },
  }) as { data: { team: string } | null };

  if (!project.data) {
    throw new Error("The project does not exist.");
  }

  await validateTeamMembership({ user: user, teamId: project.data.team });
}
