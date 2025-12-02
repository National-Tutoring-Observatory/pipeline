import { Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useLoaderData, useOutletContext, useParams } from "react-router";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User } from "~/modules/users/users.types";
import getUserRoleInTeam from "../helpers/getUserRoleInTeam";
import type { Route } from "./+types/teamUsers.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const teamsResult = await documents.getDocuments<User>({ collection: 'users', match: { "teams.team": params.id } });
  return { users: teamsResult.data };
}

export default function TeamUsersRoute() {
  const data = useLoaderData<typeof loader>();
  const params = useParams();
  const ctx = useOutletContext<any>();

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

          {(ctx.authentication?.role === 'SUPER_ADMIN') && (
            <button onClick={ctx.onAddUserToTeamClicked} className="btn btn-secondary">
              Add existing user
            </button>
          )}
          <button onClick={ctx.onInviteUserToTeamClicked} className="ml-2 btn">
            Invite new user
          </button>
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
                      onClick={() => ctx.onRemoveUserFromTeamClicked(user._id)}
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
