import { Projects } from "~/modules/projects/components/projects";



type DashboardProps = {
  projects: [],
  onCreateNewProjectClicked: () => void
};

export function Dashboard({
  projects,
  onCreateNewProjectClicked
}: DashboardProps) {
  return (
    <main>
      <Projects
        projects={projects}
        onCreateNewProjectClicked={onCreateNewProjectClicked}
      />
    </main>
  );
}
