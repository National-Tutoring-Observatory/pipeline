import type { CollectionItemAction } from "@/components/ui/collectionContentItem";
import { Trash2 } from "lucide-react";
import type { User } from "~/modules/users/users.types";
import useTeamAuthorization from "../hooks/useTeamAuthorization";

export default (item: User, teamId: string): CollectionItemAction[] => {
  const { users: usersAuthorization } = useTeamAuthorization(teamId);

  const actions: CollectionItemAction[] = [];

  if (usersAuthorization.canUpdate) {
    actions.push({
      action: "REMOVE",
      icon: <Trash2 />,
      text: "Remove",
      variant: "destructive",
    });
  }

  return actions;
};
