import { redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { TeamCreditService } from "~/modules/billing/teamCredit";
import Home from "../components/home";
import type { Route } from "./+types/home.route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getSessionUser({ request });
  if (!user) return redirect("/");

  const teamId = (user.teams[0] as any)?.team;
  const creditBalance = teamId
    ? await TeamCreditService.sumByTeam(String(teamId))
    : 0;

  return { creditBalance, userName: user.name || user.username };
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function HomeRoute({ loaderData }: Route.ComponentProps) {
  const { creditBalance, userName } = loaderData;
  return <Home creditBalance={creditBalance} userName={userName} />;
}
