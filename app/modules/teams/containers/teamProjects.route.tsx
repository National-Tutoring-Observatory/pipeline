import { useContext, useEffect } from "react";
import { redirect, useActionData, useLoaderData, useNavigate, useOutletContext, useParams, useSubmit } from "react-router";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import { AuthenticationContext } from '~/modules/authentication/containers/authentication.container';
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import CreateProjectDialog from "~/modules/projects/components/createProjectDialog";
import type { Project } from "~/modules/projects/projects.types";
import { validateTeamMembership } from "~/modules/teams/helpers/teamMembership";
import type { User } from "~/modules/users/users.types";
import TeamProjects from "../components/teamProjects";
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
    <TeamProjects
      projects={projects}
      team={ctx.team}
      canCreateProjects={canCreateProjects}
      onCreateProjectButtonClicked={onCreateProjectButtonClicked}
    />
  );
}
