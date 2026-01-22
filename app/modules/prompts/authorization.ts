import type { User } from "~/modules/users/users.types";
import {
  userIsTeamAdmin,
  userIsTeamMember,
} from "../authorization/helpers/teamMembership";
import type { Prompt } from "./prompts.types";

const getTeamId = (prompt: Prompt): string => {
  return typeof prompt.team === "string" ? prompt.team : prompt.team._id;
};

const getPromptCreatorId = (prompt: Prompt): string | null => {
  if (!prompt.createdBy) return null;
  return typeof prompt.createdBy === "string"
    ? prompt.createdBy
    : prompt.createdBy._id;
};

const canUserManagePrompt = (user: User | null, prompt: Prompt): boolean => {
  if (!user) {
    return false;
  }

  const teamId = getTeamId(prompt);
  if (!teamId) return false;

  const isAdmin = userIsTeamAdmin(user, teamId);
  const isTeamMember = userIsTeamMember(user, teamId);
  const ownsPrompt = user._id === getPromptCreatorId(prompt);

  return isAdmin || (isTeamMember && ownsPrompt);
};

const PromptAuthorization = {
  canCreate(user: User | null, teamId: string): boolean {
    return userIsTeamAdmin(user, teamId);
  },

  canView(user: User | null, prompt: Prompt): boolean {
    if (!user) return false;
    const teamId = getTeamId(prompt);
    if (!teamId) return false;
    return userIsTeamMember(user, teamId);
  },

  canUpdate(user: User | null, prompt: Prompt): boolean {
    return canUserManagePrompt(user, prompt);
  },

  canDelete(user: User | null, prompt: Prompt): boolean {
    return canUserManagePrompt(user, prompt);
  },
};

type PromptAuthorizationShape = {
  [K in keyof typeof PromptAuthorization]: boolean;
};

export default PromptAuthorization;
export type { PromptAuthorizationShape };
