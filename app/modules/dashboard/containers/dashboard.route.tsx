import { Dashboard } from "../components/dashboard";
import type { Route } from "./+types/dashboard.route";

type Projects = {
  data: [],
};

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "NTO pipeline" },
    { name: "description", content: "A UI to manage the NTO pipeline" },
  ];
}

export default function DashboardRoute() {
  return (
    <Dashboard />
  );
}
