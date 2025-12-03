import { redirect } from "react-router";
import type { Route } from "./+types/teamIndex.route";

export async function loader({ params }: Route.LoaderArgs) {
  const id = params.id as string;
  return redirect(`/teams/${id}/projects`);
}

export default function TeamIndexRoute() {
  return null;
}
