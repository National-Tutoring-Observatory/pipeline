import map from 'lodash/map';
import type { User } from '~/modules/users/users.types';

export async function isTeamMember({ user, teamId }: { user: User, teamId: string }): Promise<boolean> {
  const userTeamIds = map(user.teams, 'team');
  return userTeamIds.includes(teamId);
}

export async function validateTeamMembership({ user, teamId }: { user: User, teamId: string }) {
  if (!(await isTeamMember({ user, teamId }))) {
    throw new Error("You do not have permission to manage this team.");
  }
}
