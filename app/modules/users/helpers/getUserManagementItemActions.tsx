import type { CollectionItemAction } from "@/components/ui/collectionContentItem";
import type { User } from "../users.types";
import UserManagementAuthorization from "../authorization";

export default (item: User, currentUser: User): CollectionItemAction[] => {
  const actions: CollectionItemAction[] = [];

  if (
    UserManagementAuthorization.canAssignSuperAdminToUser({
      target: item,
      performer: currentUser,
    })
  ) {
    actions.push({
      action: "ASSIGN_SUPER_ADMIN",
      text: "Promote to Super Admin",
    });
  }

  if (
    UserManagementAuthorization.canRevokeSuperAdminFromUser({
      target: item,
      performer: currentUser,
    })
  ) {
    actions.push({
      action: "REVOKE_SUPER_ADMIN",
      text: "Revoke Super Admin",
    });
  }

  return actions;
};
