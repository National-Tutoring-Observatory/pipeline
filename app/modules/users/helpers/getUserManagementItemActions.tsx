import type { CollectionItemAction } from "@/components/ui/collectionItemActions";
import UserManagementAuthorization from "../authorization";
import type { User } from "../users.types";

export default function getUserManagementItemActions(
  item: User,
  currentUser: User,
): CollectionItemAction[] {
  const actions: CollectionItemAction[] = [
    { action: "VIEW", text: "View Details" },
  ];

  if (UserManagementAuthorization.canUpdate(currentUser)) {
    actions.push({
      action: "EDIT",
      text: "Edit",
    });
  }

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
}
