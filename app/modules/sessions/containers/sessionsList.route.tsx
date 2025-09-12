import type { Session } from "../sessions.types";
import type { Route } from "./+types/sessionsList.route";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";

type Sessions = {
  data: [Session],
};


export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const project = url.searchParams.get('project');
  const documents = getDocumentsAdapter();
  const sessions = await documents.getDocuments({ collection: 'sessions', match: { project: project, hasConverted: true }, sort: {} }) as Sessions;
  return { sessions };
}