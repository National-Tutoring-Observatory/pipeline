import type { User } from "~/modules/users/users.types";

export function userIsTeamMember(user: User | null, teamId: string): boolean {
  if (!user) {
    return false;
  }
  return user.teams.some((t) => t.team === teamId);
}

export function userIsTeamAdmin(user: User | null, teamId: string): boolean {
  if (!user) {
    return false;
  }
  return user.teams.some((t) => t.team === teamId && t.role === "ADMIN");
}
