import { Folder } from "lucide-react";

export default function getProjectsEmptyAttributes() {
  return {
    icon: <Folder />,
    title: "No Projects yet",
    description:
      "You haven't created any projects yet. Get started by creating your first project.",
    actions: [
      {
        action: "CREATE",
        text: "Create project",
      },
    ],
  };
}
