import { ClipboardList } from "lucide-react";

export default function getTeamPromptsEmptyAttributes() {
  return {
    icon: <ClipboardList />,
    title: "No Prompts yet",
    description: "No prompts are associated with this team",
    actions: [],
  };
}
