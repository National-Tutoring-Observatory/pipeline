import getDocuments from "~/core/documents/getDocuments";
import createDocument from "~/core/documents/createDocument";
import { useSubmit } from "react-router";
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

type Projects = {
  data: [],
};

export async function loader({ params }: Route.LoaderArgs) {
  const projects = await getDocuments({ collection: 'projects' }) as Projects;
  return { projects };
}

export async function action({
  request,
}: Route.ActionArgs) {

  const formData = await request.formData();

  const intent = formData.get('intent');
  const name = formData.get("name");
  const projectId = formData.get("projectId");

  switch (intent) {
    case 'CREATE':
      if (typeof name !== "string") {
        throw new Error("Project name is required and must be a string.");
      }
      return await createDocument({ collection: 'projects', update: { name } });
    case 'UPDATE':
      return await updateDocument({ collection: 'projects', document: { _id: Number(projectId) }, update: { name } });
    case 'DELETE':
      return await deleteDocument({ collection: 'projects', document: { _id: Number(projectId) } })
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
    submit({ intent: 'CREATE', name }, { method: 'POST' });
  }

  const onEditProjectClicked = (project: Project) => {
    submit({ intent: 'UPDATE', projectId: project._id, name: project.name }, { method: 'PUT' }).then(() => {
      toast.success('Updated project');
    });
  }

  const onDeleteProjectClicked = (projectId: string) => {
    submit({ intent: 'DELETE', projectId: projectId }, { method: 'DELETE' }).then(() => {
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
