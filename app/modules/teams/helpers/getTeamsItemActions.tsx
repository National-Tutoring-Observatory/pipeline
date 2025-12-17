import type { CollectionItemAction } from "@/components/ui/collectionContentItem"
import { Edit, Trash2 } from "lucide-react"
import useTeamAuthorization from "../hooks/useTeamAuthorization"
import type { Team } from "../teams.types"

export default (item: Team): CollectionItemAction[] => {
  const { canUpdate, canDelete } = useTeamAuthorization(item._id);

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
    });
  }

  return actions;
}
