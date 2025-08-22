
import getDocument from "~/core/documents/getDocument";
import type { Team as TeamType } from "../teams.types";
import Team from '../components/team';
import throttle from 'lodash/throttle';
import { useEffect } from "react";
import updateBreadcrumb from "~/core/app/updateBreadcrumb";
import type { Route } from "./+types/team.route";

export async function loader({ params }: Route.LoaderArgs) {
  const team = await getDocument({ collection: 'teams', match: { _id: parseInt(params.id) } }) as { data: TeamType };
  return { team };
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function TeamRoute({ loaderData }: { loaderData: { team: { data: TeamType } } }) {
  const { team } = loaderData;

  useEffect(() => {
    updateBreadcrumb([{ text: 'Teams', link: `/teams` }, { text: team.data.name }])
  }, []);

  return (
    <Team
      team={team.data}
    />
  );
}
