import { useEffect } from "react";
import { Link, useLoaderData, useOutletContext, useParams } from "react-router";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Project } from "~/modules/projects/projects.types";
import type { Route } from "./+types/teamProjects.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const projectsResult = await documents.getDocuments<Project>({ collection: 'projects', match: { team: params.id } });
  return { projects: projectsResult.data };
}

export default function TeamProjectsRoute() {
  const data = useLoaderData<typeof loader>();
  const params = useParams();
  const ctx = useOutletContext<any>();

  useEffect(() => {
    updateBreadcrumb([
      { text: 'Teams', link: '/teams' },
      { text: ctx.team.name, link: `/teams/${params.id}` },
      { text: 'Projects' }
    ]);
  }, [params.id]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2>Projects</h2>
        {(ctx.canCreateProjects) && (
          <button onClick={ctx.onCreateProjectButtonClicked} className="btn">
            Create project
          </button>
        )}
      </div>
      <div>
        {(data.projects.length === 0) && (
          <div className="mt-4 mb-4 p-8 border border-black/10 rounded-md text-center">
            No projects are associated with this team
          </div>
        )}
        {(data.projects.length > 0) && (
          <div className="mt-4 border border-black/10 rounded-md overflow-hidden">
            {data.projects.map((project: Project) => (
              ctx.canCreateProjects ? (
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
