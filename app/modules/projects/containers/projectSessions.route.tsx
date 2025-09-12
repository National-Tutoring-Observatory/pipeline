import { useLoaderData } from "react-router";
import ProjectSessions from "../components/projectSessions";
import type { Session } from "~/modules/sessions/sessions.types";
import type { Route } from "./+types/projectSessions.route";
import addDialog from "~/modules/dialogs/addDialog";
import ViewSessionContainer from "~/modules/sessions/containers/viewSessionContainer";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";

type Sessions = {
  data: [Session],
};

export async function loader({ params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const sessions = await documents.getDocuments({ collection: 'sessions', match: { project: params.id }, sort: {} }) as Sessions;
  return { sessions };
}

export default function ProjectSessionsRoute() {
  const { sessions } = useLoaderData();

  const onSessionClicked = (session: Session) => {
    addDialog(
      <ViewSessionContainer
        session={session}
      />
    );
  }

  return (
    <ProjectSessions
      sessions={sessions.data}
      onSessionClicked={onSessionClicked}
    />
  )
}