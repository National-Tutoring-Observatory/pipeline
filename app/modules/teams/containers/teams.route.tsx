import getDocuments from "~/core/documents/getDocuments";
import createDocument from "~/core/documents/createDocument";
import { useActionData, useNavigate, useSubmit } from "react-router";
import type { Route } from "./+types/teams.route";
import Teams from "../components/teams";
import deleteDocument from "~/core/documents/deleteDocument";
import { toast } from "sonner"
import addDialog from "~/core/dialogs/addDialog";
import CreateTeamDialog from "../components/createTeamDialog";
import EditTeamDialog from "../components/editTeamDialog";
import DeleteTeamDialog from "../components/deleteTeamDialog";
import type { Team } from "../teams.types";
import updateDocument from "~/core/documents/updateDocument";
import { useEffect } from "react";
import updateBreadcrumb from "~/core/app/updateBreadcrumb";

type Teams = {
  data: [],
};

export async function loader({ params }: Route.LoaderArgs) {
  const teams = await getDocuments({ collection: 'teams', match: {}, sort: {} }) as Teams;
  return { teams };
}

export async function action({
  request,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json()

  const { name } = payload;

  switch (intent) {
    case 'CREATE_PROJECT':
      if (typeof name !== "string") {
        throw new Error("Team name is required and must be a string.");
      }
      const team = await createDocument({ collection: 'teams', update: { name } }) as { data: Team };
      return {
        intent: 'CREATE_PROJECT',
        ...team
      }
    case 'UPDATE_PROJECT':
      return await updateDocument({ collection: 'teams', match: { _id: Number(entityId) }, update: { name } });
    case 'DELETE_PROJECT':
      return await deleteDocument({ collection: 'teams', match: { _id: Number(entityId) } })
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
    if (actionData?.intent === 'CREATE_PROJECT') {
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
    submit(JSON.stringify({ intent: 'CREATE_PROJECT', payload: { name } }), { method: 'POST', encType: 'application/json' });
  }

  const onEditTeamClicked = (team: Team) => {
    submit(JSON.stringify({ intent: 'UPDATE_PROJECT', entityId: team._id, payload: { name: team.name } }), { method: 'PUT', encType: 'application/json' }).then(() => {
      toast.success('Updated team');
    });
  }

  const onDeleteTeamClicked = (teamId: string) => {
    submit(JSON.stringify({ intent: 'DELETE_PROJECT', entityId: teamId }), { method: 'DELETE', encType: 'application/json' }).then(() => {
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
