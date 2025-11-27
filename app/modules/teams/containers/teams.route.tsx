import map from 'lodash/map';
import { useContext, useEffect } from "react";
import { redirect, useActionData, useNavigate, useSubmit } from "react-router";
import { toast } from "sonner";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import { AuthenticationContext } from "~/modules/authentication/containers/authentication.container";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User } from "~/modules/users/users.types";
import CreateTeamDialog from "../components/createTeamDialog";
import DeleteTeamDialog from "../components/deleteTeamDialog";
import EditTeamDialog from "../components/editTeamDialog";
import Teams from "../components/teams";
import { validateTeamAdmin } from "../helpers/teamAdmin";
import type { Team } from "../teams.types";
import type { Route } from "./+types/teams.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();

  let match = {};

  const userSession = await getSessionUser({ request }) as User;

  if (!userSession) {
    return redirect('/');
  }

  if (userSession.role === 'SUPER_ADMIN') {
    match = {};
  } else {
    const teamIds = map(userSession.teams, "team");
    match = { _id: { $in: teamIds } }
  }

  const result = await documents.getDocuments<Team>({ collection: 'teams', match, sort: {} });
  const teams = { data: result.data };

  return { teams };
}

export async function action({
  request,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json()

  const { name } = payload;

  const user = await getSessionUser({ request }) as User;

  if (!user) {
    return redirect('/');
  }

  const documents = getDocumentsAdapter();

  switch (intent) {
    case 'CREATE_TEAM':
      if (user.role !== 'SUPER_ADMIN') {
        throw new Error("Insufficient permissions. Only super admins can create teams.");
      }
      if (typeof name !== "string") {
        throw new Error("Team name is required and must be a string.");
      }
      const team = await documents.createDocument({ collection: 'teams', update: { name } }) as { data: Team };
      return {
        intent: 'CREATE_TEAM',
        ...team
      }
    case 'UPDATE_TEAM':
      await validateTeamAdmin({ user, teamId: entityId });
      return await documents.updateDocument({ collection: 'teams', match: { _id: entityId }, update: { name } });
    case 'DELETE_TEAM':
      if (user.role !== 'SUPER_ADMIN') {
        throw new Error("Insufficient permissions. Only super admins can delete teams.");
      }
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

  const authentication = useContext(AuthenticationContext) as User | null;

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
      authentication={authentication}
      onCreateTeamButtonClicked={onCreateTeamButtonClicked}
      onEditTeamButtonClicked={onEditTeamButtonClicked}
      onDeleteTeamButtonClicked={onDeleteTeamButtonClicked}
    />
  );
}
