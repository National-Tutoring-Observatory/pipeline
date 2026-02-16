import type { CollectionItemAction } from "@/components/ui/collectionContentItem";
import { Edit } from "lucide-react";
import type { User } from "~/modules/users/users.types";
import TeamAuthorization from "../authorization";
import type { Team } from "../teams.types";

export default function getTeamsItemActions(
  item: Team,
  user: User,
): CollectionItemAction[] {
  const actions: CollectionItemAction[] = [];

  if (TeamAuthorization.canUpdate(user, item._id)) {
    actions.push({
      action: "EDIT",
      icon: <Edit />,
      text: "Edit",
    });
  }

  return actions;
}
