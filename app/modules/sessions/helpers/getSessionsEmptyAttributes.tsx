import { FileText } from "lucide-react";

export default function getSessionsEmptyAttributes() {
  return {
    icon: <FileText />,
    title: "No Sessions yet",
    description: "No sessions have been created for this project.",
    actions: [],
  };
}
