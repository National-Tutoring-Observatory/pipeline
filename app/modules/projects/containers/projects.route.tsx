import getDocuments from "~/core/documents/getDocuments";
import createDocument from "~/core/documents/createDocument";
import { useSubmit } from "react-router";
import type { Route } from "./+types/projects.route";
import Projects from "../components/projects";
import deleteDocument from "~/core/documents/deleteDocument";

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

  if (intent === 'CREATE') {
    const name = formData.get("name");
    if (typeof name !== "string") {
      throw new Error("Project name is required and must be a string.");
    }
    const project = await createDocument({ collection: 'projects', document: { name } });
    return project;
  } else {
    const projectIdValue = formData.get("projectId");
    if (typeof projectIdValue !== "string" || isNaN(Number(projectIdValue))) {
      throw new Error("Project ID is required and must be a valid number.");
    }
    return await deleteDocument({ collection: 'projects', document: { _id: Number(projectIdValue) } })
  }
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}


export default function ProjectsRoute({ loaderData }: Route.ComponentProps) {
  const { projects } = loaderData;
  const submit = useSubmit();

  const onCreateNewProjectClicked = (name: string) => {
    submit({ intent: 'CREATE', name }, { method: 'POST' });
  }

  const onDeleteProjectClicked = (projectId: string) => {
    submit({ intent: 'DELETE', projectId: projectId }, { method: 'DELETE' });
  }

  return (
    <Projects
      projects={projects?.data}
      onCreateNewProjectClicked={onCreateNewProjectClicked}
      onDeleteProjectClicked={onDeleteProjectClicked}
    />
  );
}
