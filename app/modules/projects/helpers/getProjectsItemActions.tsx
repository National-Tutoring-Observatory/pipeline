import type { CollectionItemAction } from "@/components/ui/collectionContentItem";
import { Edit, Trash2 } from "lucide-react";
import useProjectAuthorization from "../hooks/useProjectAuthorization";
import type { Project } from "../projects.types";

export default (item: Project): CollectionItemAction[] => {
  const teamId = (item.team as any)._id || item.team;
  const { canUpdate, canDelete } = useProjectAuthorization(teamId);

  const actions: CollectionItemAction[] = [];

  if (canUpdate) {
    actions.push({
      action: 'EDIT',
      icon: <Edit />,
      text: 'Edit'
    });
  }

  if (canDelete) {
    actions.push({
      action: 'DELETE',
      icon: <Trash2 />,
      text: 'Delete',
      variant: 'destructive'
    })
  }

  return actions;

}
