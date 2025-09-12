
import type { Team as TeamType } from "../teams.types";
import Team from '../components/team';
import { useEffect } from "react";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import type { Route } from "./+types/team.route";
import type { Project } from "~/modules/projects/projects.types";
import CreateProjectDialog from "~/modules/projects/components/createProjectDialog";
import addDialog from "~/modules/dialogs/addDialog";
import { useFetcher } from "react-router";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";

export async function loader({ params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const team = await documents.getDocument({ collection: 'teams', match: { _id: params.id } }) as { data: TeamType };
  const projects = await documents.getDocuments({ collection: 'projects', match: { team: team.data._id } }) as { data: TeamType };
  return { team, projects };
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function TeamRoute({ loaderData }: { loaderData: { team: { data: TeamType }, projects: { data: Project[] } } }) {
  const { team, projects } = loaderData;

  const fetcher = useFetcher();

  const onCreateProjectButtonClicked = () => {
    addDialog(
      <CreateProjectDialog
        hasTeamSelection={false}
        onCreateNewProjectClicked={onCreateNewProjectClicked}
      />
    );
  }

  const onCreateNewProjectClicked = ({ name }: { name: string }) => {
    fetcher.submit({ intent: 'CREATE_PROJECT', payload: { name, team: team.data._id } }, {
      action: "/api/projects",
      method: "post",
      encType: "application/json"
    });
  }

  useEffect(() => {
    updateBreadcrumb([{ text: 'Teams', link: `/teams` }, { text: team.data.name }])
  }, []);

  return (
    <Team
      team={team.data}
      projects={projects.data}
      users={[]}
      onCreateProjectButtonClicked={onCreateProjectButtonClicked}
    />
  );
}
