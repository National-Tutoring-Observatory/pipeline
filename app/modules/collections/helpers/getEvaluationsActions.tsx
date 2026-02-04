import { Plus } from "lucide-react";

export default function getEvaluationsActions(isAbleToCreateEvaluation: boolean) {
  if (!isAbleToCreateEvaluation) {
    return [];
  }

  return [
    {
      action: "CREATE_EVALUATION",
      text: "Create",
      icon: <Plus className="mr-1 h-4 w-4" />,
    },
  ];
}
