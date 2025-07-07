import getDocuments from "~/core/documents/getDocuments";
import type { Session } from "../sessions.types";
import type { Route } from "./+types/sessionsList.route";

type Sessions = {
  data: [Session],
};


export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const project = url.searchParams.get('project');
  const sessions = await getDocuments({ collection: 'sessions', match: { project: Number(project), hasConverted: true }, sort: {} }) as Sessions;
  return { sessions };
}