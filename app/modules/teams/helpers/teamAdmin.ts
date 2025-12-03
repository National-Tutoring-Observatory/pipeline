import find from 'lodash/find';
import type { User } from '~/modules/users/users.types';

export async function isTeamAdmin({ user, teamId }: { user: User, teamId: string }): Promise<boolean> {
  // SUPER_ADMIN can manage any team
  if (user.role === 'SUPER_ADMIN') {
    return true;
  }

  // Check if user has ADMIN role for this specific team
  const userTeam = find(user.teams, { team: teamId });
  if (!userTeam || userTeam.role !== 'ADMIN') {
    return false;
  }

  return true;
}

export async function validateTeamAdmin({ user, teamId }: { user: User, teamId: string }) {
  if (!(await isTeamAdmin({ user, teamId }))) {
    throw new Error("You do not have admin permissions for this team.");
  }
}
