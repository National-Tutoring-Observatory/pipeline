import map from 'lodash/map';
import { useEffect } from "react";
import { redirect, useActionData, useNavigate, useRevalidator, useSubmit } from "react-router";
import { toast } from "sonner";
import useHandleSockets from '~/modules/app/hooks/useHandleSockets';
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import addDialog from "~/modules/dialogs/addDialog";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import { validateTeamMembership } from "~/modules/teams/helpers/teamMembership";
import type { User } from "~/modules/users/users.types";
import CreateProjectDialog from "../components/createProjectDialog";
import DeleteProjectDialog from "../components/deleteProjectDialog";
import EditProjectDialog from "../components/editProjectDialog";
import Projects from "../components/projects";
import { validateProjectOwnership } from "../helpers/projectOwnership";
import type { Project } from "../projects.types";
import deleteProject from "../services/deleteProject.server";
import type { Route } from "./+types/projects.route";

export async function loader({ request, params, context }: Route.LoaderArgs & { context: any }) {
  const documents = getDocumentsAdapter();
  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, 'team');

  const result = await documents.getDocuments<Project>({ collection: 'projects', match: { team: { $in: teamIds } }, sort: {}, populate: [{ path: 'team' }] });
  const projects = { data: result.data };

  return { projects };
}

export async function action({
  request,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json();

  const { name, team } = payload;

  const user = await getSessionUser({ request }) as User;

  if (!user) {
    return redirect('/');
  }

  const documents = getDocumentsAdapter();

  switch (intent) {
    case 'CREATE_PROJECT':
      if (typeof name !== "string") {
        throw new Error("Project name is required and must be a string.");
      }

      await validateTeamMembership({ user, teamId: team });

      const project = await documents.createDocument({
        collection: 'projects',
        update: { name, team },
      }) as { data: Project };

      return {
        intent: 'CREATE_PROJECT',
        ...project,
      };

    case 'UPDATE_PROJECT':
      await validateProjectOwnership({
        user,
        projectId: entityId,
      });

      return await documents.updateDocument({
        collection: 'projects',
        match: { _id: entityId },
        update: { name },
      });

    case 'DELETE_PROJECT':
      await validateProjectOwnership({
        user,
        projectId: entityId,
      });
      return await deleteProject({ projectId: entityId });

    default:
      return {};
  }
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}


export default function ProjectsRoute({ loaderData }: Route.ComponentProps) {
  const { projects } = loaderData;
  const submit = useSubmit();
  const actionData = useActionData();
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();

  useEffect(() => {
    if (actionData?.intent === 'CREATE_PROJECT') {
      navigate(`/projects/${actionData.data._id}`)
    }
  }, [actionData]);

  useHandleSockets({
    event: 'DELETE_PROJECT',
    matches: [{ status: 'FINISHED' }],
    callback: revalidate
  });

  useEffect(() => {
    updateBreadcrumb([{ text: 'Projects' }])
  }, []);

  const onCreateProjectButtonClicked = () => {
    addDialog(
      <CreateProjectDialog
        hasTeamSelection={true}
        onCreateNewProjectClicked={onCreateNewProjectClicked}
      />
    );
  }

  const onEditProjectButtonClicked = (project: Project) => {
    addDialog(<EditProjectDialog
      project={project}
      onEditProjectClicked={onEditProjectClicked}
    />);
  }

  const onDeleteProjectButtonClicked = (project: Project) => {
    addDialog(
      <DeleteProjectDialog
        project={project}
        onDeleteProjectClicked={onDeleteProjectClicked}
      />
    );
  }

  const onCreateNewProjectClicked = ({ name, team }: {
    name: string, team: string | null
  }) => {
    submit(JSON.stringify({ intent: 'CREATE_PROJECT', payload: { name, team } }), { method: 'POST', encType: 'application/json' });
  }

  const onEditProjectClicked = (project: Project) => {
    submit(JSON.stringify({ intent: 'UPDATE_PROJECT', entityId: project._id, payload: { name: project.name } }), { method: 'PUT', encType: 'application/json' }).then(() => {
      toast.success('Updated project');
    });
  }

  const onDeleteProjectClicked = (projectId: string) => {
    submit(JSON.stringify({ intent: 'DELETE_PROJECT', entityId: projectId }), { method: 'DELETE', encType: 'application/json' }).then(() => {
      toast.success('Deleted project');
    });
  }

  return (
    <Projects
      projects={projects?.data}
      onCreateProjectButtonClicked={onCreateProjectButtonClicked}
      onEditProjectButtonClicked={onEditProjectButtonClicked}
      onDeleteProjectButtonClicked={onDeleteProjectButtonClicked}
    />
  );
}
