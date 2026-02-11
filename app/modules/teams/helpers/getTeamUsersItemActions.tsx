import type { CollectionItemAction } from "@/components/ui/collectionContentItem";
import { Trash2 } from "lucide-react";
import type { User } from "~/modules/users/users.types";
import TeamAuthorization from "../authorization";

export default function getTeamUsersItemActions(
  item: User,
  user: User,
  teamId: string,
): CollectionItemAction[] {
  const actions: CollectionItemAction[] = [];

  if (TeamAuthorization.Users.canUpdate(user, teamId)) {
    actions.push({
      action: "REMOVE",
      icon: <Trash2 />,
      text: "Remove",
      variant: "destructive",
    });
  }

  return actions;
}
