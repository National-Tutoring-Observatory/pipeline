import type { Project } from "~/modules/projects/projects.types";
import type { Team } from "../teams.types";
import type { User } from "~/modules/users/users.types";
import map from 'lodash/map';
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

interface TeamProps {
  team: Team,
  projects: Project[]
  users: User[]
  onCreateProjectButtonClicked: () => void;
}

export default function Team({
  team,
  projects,
  users = [],
  onCreateProjectButtonClicked
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
                      className="block border-b border-black/10 p-4 last:border-0 hover:bg-gray-50"
                    >
                      {project.name}
                    </Link>
                  )
                })}
              </div>
            )
            }
          </div>
        </div>
        <div className="opacity-0">
          <div className="flex items-center justify-between">
            <h2>Users</h2>
            <Button >
              Invite user
            </Button>
          </div>
          <div>
            {(users.length === 0) && (
              <div className="mt-4 mb-4 p-8 border border-black/10 rounded-md text-center">
                No users are associated with this team
              </div>
            )}
            {map(users, (user) => {
              return (
                <div key={user._id}>{user.firstName}</div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}