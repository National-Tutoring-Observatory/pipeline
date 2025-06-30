import getDocuments from "~/core/documents/getDocuments";
import type { Route } from "./+types/project.route";
import { useLoaderData } from "react-router";
import ProjectSessions from "../components/projectSessions";
import type { Session } from "~/modules/sessions/sessions.types";

type Sessions = {
  data: [Session],
};

export async function loader({ params }: Route.LoaderArgs) {
  const sessions = await getDocuments({ collection: 'sessions', match: { project: parseInt(params.id) }, }) as Sessions;
  return { sessions };
}

export default function ProjectSessionsRoute() {
  const { sessions } = useLoaderData();
  return (
    <ProjectSessions
      sessions={sessions.data}
    />
  )
}