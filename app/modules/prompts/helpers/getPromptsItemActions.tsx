import type { CollectionItemAction } from "@/components/ui/collectionItemActions";
import { Edit, Trash2 } from "lucide-react";
import type { User } from "~/modules/users/users.types";
import PromptAuthorization from "../authorization";
import type { Prompt } from "../prompts.types";

export default function getPromptsItemActions(
  item: Prompt,
  user: User,
): CollectionItemAction[] {
  const canUpdate = PromptAuthorization.canUpdate(user, item);
  const canDelete = PromptAuthorization.canDelete(user, item);

  const actions: CollectionItemAction[] = [];

  if (canUpdate) {
    actions.push({
      action: "EDIT",
      icon: <Edit />,
      text: "Edit",
    });
  }

  if (canDelete) {
    actions.push({
      action: "DELETE",
      icon: <Trash2 />,
      text: "Delete",
      variant: "destructive",
    });
  }

  return actions;
}
