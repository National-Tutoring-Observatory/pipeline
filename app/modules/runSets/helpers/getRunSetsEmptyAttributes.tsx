import { FolderOpen } from "lucide-react";

export default () => {
  return {
    icon: <FolderOpen />,
    title: "No run sets yet",
    description:
      "You haven't created any run sets yet. Get started by creating your first run set.",
    actions: [
      {
        action: "CREATE",
        text: "Create run set",
      },
    ],
  };
};
