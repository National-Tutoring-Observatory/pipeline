import PromptAuthorization from "~/modules/prompts/authorization";
import type { User } from "~/modules/users/users.types";

export default (teamId: string, user: User | null) => {
  if (PromptAuthorization.canCreate(user, teamId)) {
    return [
      {
        action: "CREATE",
        text: "Create prompt",
      },
    ];
  } else {
    return [];
  }
};
