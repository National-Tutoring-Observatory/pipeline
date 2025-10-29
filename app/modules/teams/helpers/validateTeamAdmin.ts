import find from 'lodash/find';
import type { User } from '~/modules/users/users.types';

export function isTeamAdmin({ user, teamId }: { user: User, teamId: string }): boolean {
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

export function validateTeamAdmin({ user, teamId }: { user: User, teamId: string }) {
  if (!isTeamAdmin({ user, teamId })) {
    throw new Error("You do not have admin permissions for this team.");
  }
}