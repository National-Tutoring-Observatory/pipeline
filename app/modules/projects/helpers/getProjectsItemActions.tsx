import type { CollectionItemAction } from "@/components/ui/collectionItemActions";
import { Edit, Trash2 } from "lucide-react";
import type { User } from "~/modules/users/users.types";
import ProjectAuthorization from "../authorization";
import type { Project } from "../projects.types";

export default function getProjectsItemActions(
  item: Project,
  user: User,
): CollectionItemAction[] {
  const canUpdate = ProjectAuthorization.canUpdate(user, item);
  const canDelete = ProjectAuthorization.canDelete(user, item);

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
