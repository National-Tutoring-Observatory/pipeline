import getDocuments from "~/core/documents/getDocuments";
import createDocument from "~/core/documents/createDocument";
import { useActionData, useNavigate, useSubmit } from "react-router";
import type { Route } from "./+types/projects.route";
import Projects from "../components/projects";
import deleteDocument from "~/core/documents/deleteDocument";
import { toast } from "sonner"
import addDialog from "~/core/dialogs/addDialog";
import CreateProjectDialog from "../components/createProjectDialog";
import EditProjectDialog from "../components/editProjectDialog";
import DeleteProjectDialog from "../components/deleteProjectDialog";
import type { Project } from "../projects.types";
import updateDocument from "~/core/documents/updateDocument";
import { useEffect } from "react";

type Projects = {
  data: [],
};

export async function loader({ params }: Route.LoaderArgs) {
  const projects = await getDocuments({ collection: 'projects', match: {} }) as Projects;
  return { projects };
}

export async function action({
  request,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json()

  const { name } = payload;

  switch (intent) {
    case 'CREATE_PROJECT':
      if (typeof name !== "string") {
        throw new Error("Project name is required and must be a string.");
      }
      const project = await createDocument({ collection: 'projects', update: { name } }) as { data: Project };
      return {
        intent: 'CREATE_PROJECT',
        ...project
      }
    case 'UPDATE_PROJECT':
      return await updateDocument({ collection: 'projects', match: { _id: Number(entityId) }, update: { name } });
    case 'DELETE_PROJECT':
      return await deleteDocument({ collection: 'projects', match: { _id: Number(entityId) } })
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

  useEffect(() => {
    if (actionData?.intent === 'CREATE_PROJECT') {
      navigate(`/projects/${actionData.data._id}`)
    }
  }, [actionData]);

  const onCreateProjectButtonClicked = () => {
    addDialog(
      <CreateProjectDialog
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

  const onCreateNewProjectClicked = (name: string) => {
    submit(JSON.stringify({ intent: 'CREATE_PROJECT', payload: { name } }), { method: 'POST', encType: 'application/json' }).then((response) => {
      console.log(response);
    });
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
