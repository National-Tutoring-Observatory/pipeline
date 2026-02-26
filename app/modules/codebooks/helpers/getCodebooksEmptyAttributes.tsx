import { Notebook } from "lucide-react";

export default function getCodebooksEmptyAttributes() {
  return {
    icon: <Notebook />,
    title: "No Codebooks yet",
    description:
      "You haven't created any codebooks yet. Get started by creating your first codebook.",
    actions: [
      {
        action: "CREATE",
        text: "Create codebook",
      },
    ],
  };
}
