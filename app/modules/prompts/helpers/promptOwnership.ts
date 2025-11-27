import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import { isTeamMember } from "~/modules/teams/helpers/teamMembership";
import type { User } from "~/modules/users/users.types";
import type { Prompt } from "../prompts.types";

export async function isPromptOwner({
  user,
  promptId,
}: {
  user: User;
  promptId: string;
}): Promise<boolean> {
  const documents = getDocumentsAdapter();

  const prompt = await documents.getDocument<Prompt>({
    collection: 'prompts',
    match: { _id: promptId },
  })

  if (!prompt.data) {
    return false;
  }

  return await isTeamMember({ user, teamId: (prompt.data.team as string) });
}

export async function validatePromptOwnership({
  user,
  promptId,
}: {
  user: User;
  promptId: string;
}) {
  if (!(await isPromptOwner({ user, promptId }))) {
    throw new Error("You do not have permission to access this prompt.");
  }
}
