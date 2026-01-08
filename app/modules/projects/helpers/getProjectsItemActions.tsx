import type { CollectionItemAction } from "@/components/ui/collectionContentItem";
import { Edit, Trash2 } from "lucide-react";
import { useContext } from "react";
import { AuthenticationContext } from "~/modules/authentication/containers/authentication.container";
import type { User } from "~/modules/users/users.types";
import ProjectAuthorization from "../authorization";
import type { Project } from "../projects.types";

export default (item: Project): CollectionItemAction[] => {
  const user = useContext(AuthenticationContext) as User;
  const canUpdate = ProjectAuthorization.canUpdate(user, item);
  const canDelete = ProjectAuthorization.canDelete(user, item);

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
