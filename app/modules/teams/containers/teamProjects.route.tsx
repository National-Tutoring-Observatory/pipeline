import { Button } from '@/components/ui/button';
import { useContext, useEffect } from "react";
import { Link, redirect, useActionData, useLoaderData, useNavigate, useOutletContext, useParams, useSubmit } from "react-router";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import { AuthenticationContext } from '~/modules/authentication/containers/authentication.container';
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import CreateProjectDialog from "~/modules/projects/components/createProjectDialog";
import type { Project } from "~/modules/projects/projects.types";
import { validateTeamMembership } from "~/modules/teams/helpers/teamMembership";
import type { User } from "~/modules/users/users.types";
import getUserRoleInTeam from "../helpers/getUserRoleInTeam";
import { isTeamAdmin } from '../helpers/teamAdmin';
import type { Route } from "./+types/teamProjects.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request });
  if (!user) {
    return redirect('/');
  }
  if (!(await isTeamAdmin({ user, teamId: params.id }))) {
    return redirect('/');
  }

  const documents = getDocumentsAdapter();
  const projectsResult = await documents.getDocuments<Project>({ collection: 'projects', match: { team: params.id } });
  return { projects: projectsResult.data };
}

export async function action({ request, params }: Route.ActionArgs) {
  const { intent, payload = {} } = await request.json();
  const { name } = payload;

  const user = await getSessionUser({ request });
  if (!user) return { redirect: '/' };

  await validateTeamMembership({ user, teamId: params.id });

  const documents = getDocumentsAdapter();

  if (intent === 'CREATE_PROJECT') {
    if (typeof name !== 'string') throw new Error('Project name is required and must be a string.');
    const project = await documents.createDocument<Project>({ collection: 'projects', update: { name, team: params.id } });
    return {
      intent: 'CREATE_PROJECT',
      ...project
    };
  }

  return {};
}

export default function TeamProjectsRoute() {
  const data = useLoaderData<typeof loader>();
  const params = useParams();
  const ctx = useOutletContext<any>();
  const actionData = useActionData();
  const submit = useSubmit();
  const navigate = useNavigate();
  const authentication = useContext(AuthenticationContext) as User | null;
  let canCreateProjects = !!authentication && !!getUserRoleInTeam({ user: authentication, team: ctx.team }).role

  useEffect(() => {
    updateBreadcrumb([
      { text: 'Teams', link: '/teams' },
      { text: ctx.team.name, link: `/teams/${params.id}` },
      { text: 'Projects' }
    ]);
  }, [params.id]);

  useEffect(() => {
    if (actionData?.intent === 'CREATE_PROJECT') {
      navigate(`/projects/${actionData.data._id}`);
    }
  }, [actionData]);

  const onCreateProjectButtonClicked = () => {
    addDialog(
      <CreateProjectDialog
        hasTeamSelection={false}
        onCreateNewProjectClicked={onCreateNewProjectClicked}
      />
    );
  }

  const onCreateNewProjectClicked = ({ name }: { name: string }) => {
    submit(JSON.stringify({ intent: 'CREATE_PROJECT', payload: { name } }), { method: 'POST', encType: 'application/json' });
  }

  const projects = data?.projects ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">Projects</div>
        {(canCreateProjects) && (
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
              canCreateProjects ? (
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
