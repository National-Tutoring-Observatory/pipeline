import { ClipboardList } from "lucide-react";

export default () => {
  return {
    icon: <ClipboardList />,
    title: "No evaluations found",
    description: "Create an evaluation to get started",
    actions: [
      {
        action: "CREATE_EVALUATION",
        text: "Create evaluation",
      },
    ],
  };
};
