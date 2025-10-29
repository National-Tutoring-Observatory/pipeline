import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import validateTeamMembership from "~/modules/teams/helpers/validateTeamMembership";
import type { User } from "~/modules/users/users.types";

export default async function validatePromptOwnership({
  user,
  promptId,
}: {
  user: User;
  promptId: string;
}) {
  const documents = getDocumentsAdapter();

  const prompt = await documents.getDocument({
    collection: 'prompts',
    match: { _id: promptId },
  }) as { data: { team: string } | null };

  if (!prompt.data) {
    throw new Error("The prompt does not exist.");
  }

  validateTeamMembership({ user: user, teamId: prompt.data.team })
}
