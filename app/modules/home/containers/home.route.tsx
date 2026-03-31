import { redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import Home from "../components/home";
import type { Route } from "./+types/home.route";

export async function loader({ request }: Route.LoaderArgs) {
  if (process.env.OPEN_SIGNUP !== "true") return redirect("/projects");

  const user = await getSessionUser({ request });
  if (!user) return redirect("/signup");

  return {};
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function HomeRoute() {
  return <Home />;
}
