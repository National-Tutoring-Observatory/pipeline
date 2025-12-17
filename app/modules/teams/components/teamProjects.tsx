import { Button } from '@/components/ui/button';
import { Link, useParams } from "react-router";
import useProjectAuthorization from "~/modules/projects/hooks/useProjectAuthorization";
import type { Project } from "~/modules/projects/projects.types";
import type { Team } from "../teams.types";

interface TeamProjectsProps {
  projects: Project[];
  team: Team;
  onCreateProjectButtonClicked: () => void;
}

export default function TeamProjects({ projects, team, onCreateProjectButtonClicked }: TeamProjectsProps) {
  const { canCreate } = useProjectAuthorization(team._id);
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">Projects</div>
        {(canCreate) && (
          <Button size="sm" onClick={onCreateProjectButtonClicked}>
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
            {projects.map((project: Project) => (
              canCreate ? (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="block border-b border-black/10 p-4 last:border-0 hover:bg-gray-50 text-sm"
                >
                  {project.name}
                </Link>
              ) : (
                <div
                  key={project._id}
                  className="block border-b border-black/10 p-4 last:border-0 text-sm"
                >
                  {project.name}
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
