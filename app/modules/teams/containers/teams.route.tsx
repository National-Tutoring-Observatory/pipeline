import { useActionData, useNavigate, useSubmit } from "react-router";
import type { Route } from "./+types/teams.route";
import Teams from "../components/teams";
import { toast } from "sonner"
import addDialog from "~/modules/dialogs/addDialog";
import CreateTeamDialog from "../components/createTeamDialog";
import EditTeamDialog from "../components/editTeamDialog";
import DeleteTeamDialog from "../components/deleteTeamDialog";
import type { Team } from "../teams.types";
import { useEffect } from "react";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";

type Teams = {
  data: [],
};

export async function loader({ params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const teams = await documents.getDocuments({ collection: 'teams', match: {}, sort: {} }) as Teams;
  return { teams };
}

export async function action({
  request,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json()

  const { name } = payload;

  const documents = getDocumentsAdapter();

  switch (intent) {
    case 'CREATE_TEAM':
      if (typeof name !== "string") {
        throw new Error("Team name is required and must be a string.");
      }
      const team = await documents.createDocument({ collection: 'teams', update: { name } }) as { data: Team };
      return {
        intent: 'CREATE_TEAM',
        ...team
      }
    case 'UPDATE_TEAM':
      return await documents.updateDocument({ collection: 'teams', match: { _id: entityId }, update: { name } });
    case 'DELETE_TEAM':
      return await documents.deleteDocument({ collection: 'teams', match: { _id: entityId } })
    default:
      return {};
  }
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}


export default function TeamsRoute({ loaderData }: Route.ComponentProps) {
  const { teams } = loaderData;
  const submit = useSubmit();
  const actionData = useActionData();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData?.intent === 'CREATE_TEAM') {
      navigate(`/teams/${actionData.data._id}`)
    }
  }, [actionData]);

  useEffect(() => {
    updateBreadcrumb([{ text: 'Teams' }])
  }, []);

  const onCreateTeamButtonClicked = () => {
    addDialog(
      <CreateTeamDialog
        onCreateNewTeamClicked={onCreateNewTeamClicked}
      />
    );
  }

  const onEditTeamButtonClicked = (team: Team) => {
    addDialog(<EditTeamDialog
      team={team}
      onEditTeamClicked={onEditTeamClicked}
    />);
  }

  const onDeleteTeamButtonClicked = (team: Team) => {
    addDialog(
      <DeleteTeamDialog
        team={team}
        onDeleteTeamClicked={onDeleteTeamClicked}
      />
    );
  }

  const onCreateNewTeamClicked = (name: string) => {
    submit(JSON.stringify({ intent: 'CREATE_TEAM', payload: { name } }), { method: 'POST', encType: 'application/json' });
  }

  const onEditTeamClicked = (team: Team) => {
    submit(JSON.stringify({ intent: 'UPDATE_TEAM', entityId: team._id, payload: { name: team.name } }), { method: 'PUT', encType: 'application/json' }).then(() => {
      toast.success('Updated team');
    });
  }

  const onDeleteTeamClicked = (teamId: string) => {
    submit(JSON.stringify({ intent: 'DELETE_TEAM', entityId: teamId }), { method: 'DELETE', encType: 'application/json' }).then(() => {
      toast.success('Deleted team');
    });
  }

  return (
    <Teams
      teams={teams?.data}
      onCreateTeamButtonClicked={onCreateTeamButtonClicked}
      onEditTeamButtonClicked={onEditTeamButtonClicked}
      onDeleteTeamButtonClicked={onDeleteTeamButtonClicked}
    />
  );
}
