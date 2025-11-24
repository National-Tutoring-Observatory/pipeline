import { Button } from "@/components/ui/button";
import map from 'lodash/map';
import { Trash2 } from "lucide-react";
import { Link } from "react-router";
import type { Project } from "~/modules/projects/projects.types";
import type { Prompt } from "~/modules/prompts/prompts.types";
import type { User } from "~/modules/users/users.types";
import getUserRoleInTeam from "../helpers/getUserRoleInTeam";
import type { Team } from "../teams.types";


interface TeamProps {
  team: Team;
  projects: Project[];
  prompts: Prompt[];
  users: User[];
  authentication: User | null;
  canCreateProjects: boolean;
  canCreatePrompts: boolean;
  onCreateProjectButtonClicked: () => void;
  onCreatePromptButtonClicked: () => void;
  onAddUserToTeamClicked: () => void;
  onInviteUserToTeamClicked: () => void;
  onRemoveUserFromTeamClicked: (userId: string) => void;
}

export default function Team({
  team,
  projects,
  users = [],
  prompts,
  authentication,
  canCreateProjects,
  canCreatePrompts,
  onCreateProjectButtonClicked,
  onCreatePromptButtonClicked,
  onAddUserToTeamClicked,
  onInviteUserToTeamClicked,
  onRemoveUserFromTeamClicked
}: TeamProps) {

  return (
    <div className="p-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-8">
        {team.name}
      </h1>
      <div className="grid grid-cols-2 gap-16">
        <div>
          <div className="flex items-center justify-between">
            <h2>Projects</h2>
            {(canCreateProjects) && (
              <Button
                onClick={() => {
                  onCreateProjectButtonClicked()
                }}
              >
                Create project
              </Button>
            )}
          </div>
          <div>
            {(projects.length === 0) && (
              <div className="mt-4 mb-4 p-8 border border-black/10 rounded-md text-center">
                No projects are associated with this team
              </div>
            )}
            {(projects.length > 0) && (
              <div className="mt-4 border border-black/10 rounded-md overflow-hidden">
                {map(projects, (project) => {
                  if (canCreateProjects) {
                    return (
                      <Link
                        key={project._id}
                        to={`/projects/${project._id}`}
                        className="block border-b border-black/10 p-4 last:border-0 hover:bg-gray-50 text-sm"
                      >
                        {project.name}
                      </Link>
                    )
                  } else {
                    return (
                      <div
                        key={project._id}
                        className="block border-b border-black/10 p-4 last:border-0 text-sm"
                      >
                        {project.name}
                      </div>
                    )
                  }
                })}
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h2>Prompts</h2>
            {(canCreatePrompts) && (
              <Button
                onClick={() => {
                  onCreatePromptButtonClicked()
                }}
              >
                Create prompt
              </Button>
            )}
          </div>
          <div>
            {(prompts.length === 0) && (
              <div className="mt-4 mb-4 p-8 border border-black/10 rounded-md text-center">
                No prompts are associated with this team
              </div>
            )}
            {(prompts.length > 0) && (
              <div className="mt-4 border border-black/10 rounded-md ">
                {map(prompts, (prompt) => {
                  if (canCreatePrompts) {
                    return (
                      <Link
                        key={prompt._id}
                        to={`/prompts/${prompt._id}/${prompt.productionVersion}`}
                        className="block border-b border-black/10 p-4 last:border-0 hover:bg-gray-50 text-sm"
                      >
                        {prompt.name}
                      </Link>
                    )
                  } else {
                    return (
                      <div
                        key={prompt._id}
                        className="block border-b border-black/10 p-4 last:border-0 text-sm"
                      >
                        {prompt.name}
                      </div>
                    )
                  }
                })}
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h2>Users</h2>
            <div>

              {(authentication?.role === 'SUPER_ADMIN') && (
                <Button variant="secondary" onClick={onAddUserToTeamClicked}>
                  Add existing user
                </Button>
              )}
              <Button onClick={onInviteUserToTeamClicked} className="ml-2">
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
                {map(users, (user) => {

                  const {
                    name: roleName
                  } = getUserRoleInTeam({ user, team });

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
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
