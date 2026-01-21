import find from "lodash/find";
import type { User } from "~/modules/users/users.types";
import type { Team } from "../teams.types";

type RoleKey = "ADMIN";

const ROLES: Record<RoleKey, { name: string }> = {
  ADMIN: {
    name: "Admin",
  },
};

export default ({ user, team }: { user: User; team: Team }) => {
  const usersTeam = find(user.teams, { team: team._id });
  const roleInTeam = usersTeam?.role as RoleKey | undefined;
  return {
    role: roleInTeam,
    name: roleInTeam && ROLES[roleInTeam] ? ROLES[roleInTeam].name : undefined,
  };
};
