
import getDocument from "~/core/documents/getDocument";
import type { Route } from "./+types/project.route";

type Project = {
  data: {
    name: string
  }
};

export async function loader({ params }: Route.LoaderArgs) {
  const project = await getDocument({ collection: 'projects', document: { _id: parseInt(params.id) } }) as Project;
  return { project };
}


export function HydrateFallback() {
  return <div>Loading...</div>;
}


export default function ProjectRoute({ loaderData }: Route.ComponentProps) {
  const { project } = loaderData;
  return (
    <div className="max-w-5xl mx-auto p-8">
      Rendering project {project.data.name}
    </div>
  );
}
