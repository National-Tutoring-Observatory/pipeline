import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { User } from "~/modules/users/users.types";
import getUserRoleInTeam from "../helpers/getUserRoleInTeam";
import type { Team } from "../teams.types";

interface TeamUsersProps {
  users: User[];
  team: Team;
  isSuperAdminUser: boolean;
  onAddUserToTeamButtonClicked: () => void;
  onInviteUserToTeamButtonClicked: () => void;
  onRemoveUserFromTeamClicked: (userId: string) => void;
}

export default function TeamUsers({ users, team, isSuperAdminUser, onAddUserToTeamButtonClicked, onInviteUserToTeamButtonClicked, onRemoveUserFromTeamClicked }: TeamUsersProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">Users</div>
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
        {(users.length === 0) && (
          <div className="mt-4 mb-4 p-8 border border-black/10 rounded-md text-center">
            No users are associated with this team
          </div>
        )}
        {(users.length > 0) && (
          <div className="mt-4 border border-black/10 rounded-md ">
            {users.map((user: User) => {
              const { name: roleName } = getUserRoleInTeam({ user, team });

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
