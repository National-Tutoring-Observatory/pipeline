
import getDocument from "~/core/documents/getDocument";
import type { Route } from "./+types/project.route";
import type { Project as ProjectType } from "../projects.types";
import Project from '../components/project';

export async function loader({ params }: Route.LoaderArgs) {
  const project = await getDocument({ collection: 'projects', document: { _id: parseInt(params.id) } }) as { data: ProjectType };
  return { project };
}


export function HydrateFallback() {
  return <div>Loading...</div>;
}


export default function ProjectRoute({ loaderData }: Route.ComponentProps) {
  const { project } = loaderData;
  return (
    <Project
      project={project.data}
    />
  );
}
