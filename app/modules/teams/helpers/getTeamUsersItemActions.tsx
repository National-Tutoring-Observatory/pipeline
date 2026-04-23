import type { CollectionItemAction } from "@/components/ui/collectionItemActions";
import find from "lodash/find";
import { ShieldCheck, ShieldMinus, Trash2 } from "lucide-react";
import type { User } from "~/modules/users/users.types";
import TeamAuthorization from "../authorization";

export default function getTeamUsersItemActions(
  item: User,
  user: User,
  teamId: string,
): CollectionItemAction[] {
  const actions: CollectionItemAction[] = [];

  if (
    !TeamAuthorization.Users.canUpdate(user, teamId) ||
    item._id === user._id
  ) {
    return actions;
  }

  const itemTeam = find(item.teams, { team: teamId });
  const currentRole = itemTeam?.role;

  if (currentRole === "MEMBER") {
    actions.push({
      action: "MAKE_ADMIN",
      icon: <ShieldCheck />,
      text: "Make Admin",
    });
  } else if (currentRole === "ADMIN") {
    actions.push({
      action: "MAKE_MEMBER",
      icon: <ShieldMinus />,
      text: "Make Member",
    });
  }

  actions.push({
    action: "REMOVE",
    icon: <Trash2 />,
    text: "Remove",
    variant: "destructive",
  });

  return actions;
}
