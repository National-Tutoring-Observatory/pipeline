import map from 'lodash/map';
import type { User } from '~/modules/users/users.types';

export default ({ user, teamId }: { user: User, teamId: string }) => {
  const userTeamIds = map(user.teams, 'team');
  if (!userTeamIds.includes(teamId)) {
    throw new Error("You do not have permission to manage this team.");
  }
}
