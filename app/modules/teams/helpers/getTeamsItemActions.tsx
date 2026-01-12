import type { CollectionItemAction } from "@/components/ui/collectionContentItem"
import { Edit } from "lucide-react"
import useTeamAuthorization from "../hooks/useTeamAuthorization"
import type { Team } from "../teams.types"

export default (item: Team): CollectionItemAction[] => {
  const { canUpdate } = useTeamAuthorization(item._id);

  const actions: CollectionItemAction[] = [];

  if (canUpdate) {
    actions.push({
      action: 'EDIT',
      icon: <Edit />,
      text: 'Edit'
    });
  }

  return actions;
}
