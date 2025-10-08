import type { Project } from "~/modules/projects/projects.types";
import type { Team } from "../teams.types";
import type { User } from "~/modules/users/users.types";
import map from 'lodash/map';
import find from 'lodash/find';
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import type { Prompt } from "~/modules/prompts/prompts.types";
import getUserRoleInTeam from "../helpers/getUserRoleInTeam";

interface TeamProps {
  team: Team,
  projects: Project[],
  prompts: Prompt[],
  users: User[]
  authentication: User | null,
  onCreateProjectButtonClicked: () => void,
  onCreatePromptButtonClicked: () => void,
  onAddUserToTeamClicked: () => void,
  onInviteUserToTeamClicked: () => void,
}

export default function Team({
  team,
  projects,
  users = [],
  prompts,
  authentication,
  onCreateProjectButtonClicked,
  onCreatePromptButtonClicked,
  onAddUserToTeamClicked,
  onInviteUserToTeamClicked
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
            <Button
              onClick={() => {
                onCreateProjectButtonClicked()
              }}
            >
              Create project
            </Button>
          </div>
          <div>
            {(projects.length === 0) && (
              <div className="mt-4 mb-4 p-8 border border-black/10 rounded-md text-center">
                No projects are associated with this team
              </div>
            )}
            {(projects.length > 0) && (
              <div className="mt-4 border border-black/10 rounded-md ">
                {map(projects, (project) => {
                  return (
                    <Link
                      key={project._id}
                      to={`/projects/${project._id}`}
                      className="block border-b border-black/10 p-4 last:border-0 hover:bg-gray-50 text-sm"
                    >
                      {project.name}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h2>Prompts</h2>
            <Button
              onClick={() => {
                onCreatePromptButtonClicked()
              }}
            >
              Create prompt
            </Button>
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
                  return (
                    <Link
                      key={prompt._id}
                      to={`/prompts/${prompt._id}/${prompt.productionVersion}`}
                      className="block border-b border-black/10 p-4 last:border-0 hover:bg-gray-50 text-sm"
                    >
                      {prompt.name}
                    </Link>
                  )
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
                    name
                  } = getUserRoleInTeam({ user, team });

                  return (
                    <div
                      key={user._id}
                      className="flex border-b border-black/10 p-4 last:border-0 hover:bg-gray-50 text-sm items-center justify-between"
                    >
                      {(user.isRegistered) && (
                        <div>
                          {user.username}
                        </div>
                      ) || (
                          <div>
                            <div>
                              Invited user
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {`${window.location.origin}/invite/${user.inviteId}`}
                            </div>
                          </div>
                        )}
                      <div>
                        {name}
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