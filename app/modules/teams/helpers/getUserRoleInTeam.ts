import find from "lodash/find";
import type { User } from "~/modules/users/users.types";
import type { Team, TeamRole } from "../teams.types";

const ROLE_NAMES: Record<TeamRole, string> = {
  ADMIN: "Admin",
  MEMBER: "Member",
};

export default ({ user, team }: { user: User; team: Team }) => {
  const usersTeam = find(user.teams, { team: team._id });
  const role = usersTeam?.role as TeamRole | undefined;
  return {
    role,
    name: role ? ROLE_NAMES[role] : undefined,
  };
};
