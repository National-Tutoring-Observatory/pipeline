import type { CollectionItemAction } from "@/components/ui/collectionContentItem";
import { Edit, Trash2 } from "lucide-react";
import type { User } from "~/modules/users/users.types";
import CodebookAuthorization from "../authorization";
import type { Codebook } from "../codebooks.types";

export default function getCodebooksItemActions(
  item: Codebook,
  user: User,
): CollectionItemAction[] {
  const canUpdate = CodebookAuthorization.canUpdate(user, item);
  const canDelete = CodebookAuthorization.canDelete(user, item);

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
