import { Users } from "lucide-react";

export default () => {
  return {
    icon: <Users />,
    title: "No Teams yet",
    description:
      "You haven't created any teams yet. Get started by creating your first team.",
    actions: [
      {
        action: "CREATE",
        text: "Create team",
      },
    ],
  };
};
