import type { User } from "~/modules/users/users.types";
import TeamAuthorization from "../authorization";

export default (user: User | null) => {
  if (!TeamAuthorization.canCreate(user)) return [];

  return [
    {
      action: "CREATE",
      text: "Create team",
    },
  ];
};
