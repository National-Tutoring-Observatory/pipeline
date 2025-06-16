import type { Route } from "./+types/dashboard.route";
import { Dashboard } from "../modules/dashboard/components/dashboard";
import getDocuments from "~/core/documents/getDocuments";

type Projects = {
  data: [],
};

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const projects = await getDocuments({ collection: 'projects' }) as Projects;
  return { projects };
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}


export default function DashboardRoute({ loaderData }: Route.ComponentProps) {
  const { projects } = loaderData;

  const onCreateNewProjectClicked = () => {
    console.log('clicked');
  }

  return (
    <Dashboard
      projects={projects?.data}
      onCreateNewProjectClicked={onCreateNewProjectClicked}
    />
  );
}
