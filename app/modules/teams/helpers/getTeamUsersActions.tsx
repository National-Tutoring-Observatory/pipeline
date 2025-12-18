import useTeamAuthorization from "../hooks/useTeamAuthorization";

export default (teamId: string) => {
  const { users: usersAuthorization } = useTeamAuthorization(teamId);

  const actions = [];

  if (usersAuthorization.canRequestAccess) {
    actions.push({
      action: 'REQUEST_ACCESS',
      text: 'Request Access to Team'
    });
  }

  if (usersAuthorization.canUpdate) {
    actions.push({
      action: 'ADD_USER',
      text: 'Add existing user'
    });
  }

  if (usersAuthorization.canInvite) {
    actions.push({
      action: 'INVITE_USER',
      text: 'Invite new user'
    });
  }

  return actions;
}
