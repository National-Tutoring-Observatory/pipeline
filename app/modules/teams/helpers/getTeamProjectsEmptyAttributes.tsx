import { FolderOpen } from "lucide-react";

export default function getTeamProjectsEmptyAttributes() {
  return {
    icon: <FolderOpen />,
    title: "No Projects yet",
    description: "No projects are associated with this team",
    actions: [],
  };
}
