import { useEffect } from "react";
import { redirect, useFetcher } from "react-router";
import { toast } from "sonner";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import { TeamService } from '../team';
import type { User } from "~/modules/users/users.types";
import type { Team } from "../teams.types";
import TeamAuthorization from "../authorization";
import EditTeamDialog from "../components/editTeamDialog";
import TeamComponent from '../components/team';
import type { Route } from "./+types/team.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const userSession = await getSessionUser({ request }) as User;

  if (!userSession) {
    return redirect('/');
  }

  if (!TeamAuthorization.canView(userSession, params.id)) {
    return redirect('/');
  }

  const team = await TeamService.findById(params.id);
  if (!team) {
    return redirect('/teams');
  }
  return { team };
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function TeamRoute({ loaderData }: {
  loaderData: {
    team: Team
  }
}) {
  const { team } = loaderData;

  const fetcher = useFetcher();

  const onEditTeamButtonClicked = (teamData: Team) => {
    addDialog(<EditTeamDialog
      team={teamData}
      onEditTeamClicked={(teamData: Team) => {
        fetcher.submit(JSON.stringify({ intent: 'UPDATE_TEAM', entityId: teamData._id, payload: { name: teamData.name } }), { method: 'PUT', encType: 'application/json', action: `/teams` });
      }}
    />);
  }

  useEffect(() => {
    if (fetcher.state === 'idle' && (fetcher.data)) {
      toast.success('Updated team');
    }
  }, [fetcher.state, fetcher.data]);


  useEffect(() => {
    updateBreadcrumb([{ text: 'Teams', link: `/teams` }, { text: team.name }])
  }, []);

  return (
    <TeamComponent
      team={team}
      onEditTeamButtonClicked={onEditTeamButtonClicked}
    />
  );
}
