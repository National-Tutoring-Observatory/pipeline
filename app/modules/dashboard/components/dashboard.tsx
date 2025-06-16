import { Projects } from "~/modules/projects/components/projects";



type DashboardProps = {
  projects: []
};

export function Dashboard({
  projects
}: DashboardProps) {
  console.log(projects);
  return (
    <main>
      Dashboard
      <Projects />
    </main>
  );
}
