
// dialog UI moved to users child route
import { useContext, useEffect } from "react";
import { redirect } from "react-router";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import { AuthenticationContext } from "~/modules/authentication/containers/authentication.container";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User } from "~/modules/users/users.types";
import Team from '../components/team';
import getUserRoleInTeam from "../helpers/getUserRoleInTeam";
import { isTeamAdmin, validateTeamAdmin } from "../helpers/teamAdmin";
import type { Team as TeamType } from "../teams.types";
import type { Route } from "./+types/team.route";
// moved add/invite handlers to child users route

export async function loader({ request, params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();

  const userSession = await getSessionUser({ request }) as User;

  if (!userSession) {
    return redirect('/');
  }

  if (!(await isTeamAdmin({ user: userSession, teamId: params.id }))) {
    return redirect('/');
  }

  const team = await documents.getDocument<TeamType>({ collection: 'teams', match: { _id: params.id } });
  if (!team.data) {
    return redirect('/teams');
  }
  return { team };
}

export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { intent, payload = {} } = await request.json()

  const { userIds, userId } = payload;

  const user = await getSessionUser({ request }) as User;

  if (!user) {
    return redirect('/');
  }

  await validateTeamAdmin({ user, teamId: params.id });

  const documents = getDocumentsAdapter();
  return {};
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function TeamRoute({ loaderData }: {
  loaderData: {
    team: { data: TeamType }
  }
}) {
  const { team } = loaderData;

  const authentication = useContext(AuthenticationContext) as User | null;


  useEffect(() => {
    updateBreadcrumb([{ text: 'Teams', link: `/teams` }, { text: team.data.name }])
  }, []);

  return (
    <Team
      team={team.data}
    />
  );
}
