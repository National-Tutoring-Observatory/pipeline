import getDocuments from "~/core/documents/getDocuments";
import { useLoaderData } from "react-router";
import ProjectSessions from "../components/projectSessions";
import type { Session } from "~/modules/sessions/sessions.types";
import type { Route } from "./+types/projectSessions.route";

type Sessions = {
  data: [Session],
};

export async function loader({ params }: Route.LoaderArgs) {
  const sessions = await getDocuments({ collection: 'sessions', match: { project: parseInt(params.id) }, sort: {} }) as Sessions;
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