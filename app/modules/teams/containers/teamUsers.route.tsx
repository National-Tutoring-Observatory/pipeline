import { useContext, useEffect } from "react";
import { redirect, useLoaderData, useOutletContext, useParams, useSubmit } from "react-router";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import { AuthenticationContext } from "~/modules/authentication/containers/authentication.container";
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import { isSuperAdmin } from "~/modules/authentication/helpers/superAdmin";
import addDialog from "~/modules/dialogs/addDialog";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User } from "~/modules/users/users.types";
import ConfirmRemoveUserDialog from "../components/confirmRemoveUserDialog";
import TeamUsers from "../components/teamUsers";
import { isTeamAdmin, validateTeamAdmin } from "../helpers/teamAdmin";
import type { Route } from "./+types/teamUsers.route";
import AddUserToTeamDialogContainer from './addUserToTeamDialog.container';
import InviteUserToTeamDialogContainer from "./inviteUserToTeamDialogContainer";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request });
  if (!user) {
    return redirect('/');
  }
  if (!(await isTeamAdmin({ user, teamId: params.id }))) {
    return redirect('/');
  }
  const documents = getDocumentsAdapter();
  const teamsResult = await documents.getDocuments<User>({ collection: 'users', match: { "teams.team": params.id } });
  return { users: teamsResult.data };
}

export async function action({ request, params }: Route.ActionArgs) {
  const { intent, payload = {} } = await request.json();
  const { userIds, userId } = payload;

  const user = await getSessionUser({ request }) as User | null;
  if (!user) return redirect('/');

  await validateTeamAdmin({ user, teamId: params.id });

  const documents = getDocumentsAdapter();

  switch (intent) {
    case 'ADD_USERS_TO_TEAM':
      for (const id of userIds) {
        if (isSuperAdmin(user) && id === user._id) {
          throw new Error("Super admin cannot be added to a team.");
        }
        const userDoc = await documents.getDocument<User>({ collection: 'users', match: { _id: id } });
        if (userDoc.data) {
          if (!userDoc.data.teams) userDoc.data.teams = [];
          userDoc.data.teams.push({ team: params.id, role: 'ADMIN' });
          await documents.updateDocument({ collection: 'users', match: { _id: id }, update: { teams: userDoc.data.teams } });
        }
      }
      return {};
    case 'REMOVE_USER_FROM_TEAM':
      if (!userId) return {};
      const userDoc = await documents.getDocument<User>({ collection: 'users', match: { _id: userId } });
      if (userDoc.data && Array.isArray(userDoc.data.teams)) {
        userDoc.data.teams = userDoc.data.teams.filter(t => t.team !== params.id);
        await documents.updateDocument({ collection: 'users', match: { _id: userId }, update: { teams: userDoc.data.teams } });
      }
      return {};
    default:
      return {};
  }
}

export default function TeamUsersRoute() {
  const data = useLoaderData<typeof loader>();
  const params = useParams();
  const ctx = useOutletContext<any>();
  const submit = useSubmit();
  const authentication = useContext(AuthenticationContext) as User | null;
  const isSuperAdminUser = isSuperAdmin(authentication);

  const onAddUsersClicked = (userIds: string[]) => {
    submit(JSON.stringify({ intent: 'ADD_USERS_TO_TEAM', payload: { userIds } }), { method: 'PUT', encType: 'application/json' });
  }

  const onAddUserToTeamButtonClicked = () => {
    addDialog(
      <AddUserToTeamDialogContainer
        teamId={ctx.team._id}
        superAdminId={isSuperAdminUser ? authentication!._id : null}
        onAddUsersClicked={onAddUsersClicked}
      />
    );
  }

  const onInviteUserToTeamButtonClicked = () => {
    addDialog(
      <InviteUserToTeamDialogContainer
        teamId={ctx.team._id}
      />
    );
  }

  const onRemoveUserFromTeamClicked = (userId: string) => {
    addDialog(
      <ConfirmRemoveUserDialog onConfirm={() => {
        submit(JSON.stringify({ intent: 'REMOVE_USER_FROM_TEAM', payload: { userId } }), { method: 'PUT', encType: 'application/json' });
      }} />
    );
  }

  useEffect(() => {
    updateBreadcrumb([
      { text: 'Teams', link: '/teams' },
      { text: ctx.team.name, link: `/teams/${params.id}` },
      { text: 'Users' }
    ]);
  }, [params.id]);

  const users = data.users ?? [];

  return (
    <TeamUsers
      users={users}
      team={ctx.team}
      isSuperAdminUser={isSuperAdminUser}
      onAddUserToTeamButtonClicked={onAddUserToTeamButtonClicked}
      onInviteUserToTeamButtonClicked={onInviteUserToTeamButtonClicked}
      onRemoveUserFromTeamClicked={onRemoveUserFromTeamClicked}
    />
  );
}
