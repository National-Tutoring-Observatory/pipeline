import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useContext, useEffect } from "react";
import { redirect, useLoaderData, useOutletContext, useParams, useSubmit } from "react-router";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import { AuthenticationContext } from "~/modules/authentication/containers/authentication.container";
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import { isSuperAdmin } from "~/modules/authentication/helpers/superAdmin";
import addDialog from "~/modules/dialogs/addDialog";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User } from "~/modules/users/users.types";
import getUserRoleInTeam from "../helpers/getUserRoleInTeam";
import { validateTeamAdmin } from "../helpers/teamAdmin";
import type { Route } from "./+types/teamUsers.route";
import AddUserToTeamDialogContainer from './addUserToTeamDialog.container';
import InviteUserToTeamDialogContainer from "./inviteUserToTeamDialogContainer";

export async function loader({ request, params }: Route.LoaderArgs) {
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
      <ConfirmRemoveUserDialog
        onConfirm={() => {
          submit(JSON.stringify({ intent: 'REMOVE_USER_FROM_TEAM', payload: { userId } }), { method: 'PUT', encType: 'application/json' });
        }}
      />
    );
  }

  function ConfirmRemoveUserDialog({ onConfirm }: { onConfirm: () => void }) {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove user from team?</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this user from the team? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" variant="destructive" onClick={onConfirm}>
              Remove
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    );
  }

  useEffect(() => {
    updateBreadcrumb([
      { text: 'Teams', link: '/teams' },
      { text: ctx.team.name, link: `/teams/${params.id}` },
      { text: 'Users' }
    ]);
  }, [params.id]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2>Users</h2>
        <div>

          {isSuperAdminUser && (
            <Button variant="secondary" onClick={onAddUserToTeamButtonClicked}>
              Add existing user
            </Button>
          )}
          <Button onClick={onInviteUserToTeamButtonClicked} className="ml-2">
            Invite new user
          </Button>
        </div>
      </div>
      <div>
        {(data.users.length === 0) && (
          <div className="mt-4 mb-4 p-8 border border-black/10 rounded-md text-center">
            No users are associated with this team
          </div>
        )}
        {(data.users.length > 0) && (
          <div className="mt-4 border border-black/10 rounded-md ">
            {data.users.map((user: User) => {
              const { name: roleName } = getUserRoleInTeam({ user, team: ctx.team });

              let username = user.username;
              if (!user.isRegistered) {
                if (user.username) {
                  username = `${user.username} - Invited user`;
                } else {
                  username = 'Invited user';
                }
              }

              return (
                <div
                  key={user._id}
                  className="flex border-b border-black/10 p-4 last:border-0 hover:bg-gray-50 text-sm items-center justify-between"
                >
                  <div>
                    <div>
                      {username}
                    </div>
                    {(!user.isRegistered) && (
                      <div className="text-xs text-muted-foreground">
                        {`${window.location.origin}/invite/${user.inviteId}`}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{roleName}</span>
                    <button
                      type="button"
                      aria-label="Remove user from team"
                      className="ml-2 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemoveUserFromTeamClicked(user._id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
