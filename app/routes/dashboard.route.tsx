import type { Route } from "./+types/dashboard.route";
import { Dashboard } from "../modules/dashboard/components/dashboard";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function DashboardRoute() {
  return <Dashboard />;
}
