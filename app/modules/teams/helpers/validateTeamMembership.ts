import map from 'lodash/map';

export default ({ user, teamId }: { user: User, teamId: string }) => {
  const userTeamIds = map(user.teams, 'team');
  if (!userTeamIds.includes(teamId)) {
    throw new Error("You do not have permission to manage this team.");
  }
}
