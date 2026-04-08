import { redirect } from "react-router";
import Home from "../components/home";
import type { Route } from "./+types/home.route";

export function loader(_: Route.LoaderArgs) {
  if (process.env.OPEN_SIGNUP !== "true") return redirect("/projects");
  return {};
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function HomeRoute() {
  return <Home />;
}
