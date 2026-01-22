import { useEffect } from "react";
import { data, redirect, useFetcher } from "react-router";
import { toast } from "sonner";
import { AuditService } from "~/modules/audits/audit";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { userIsSuperAdmin } from "~/modules/authorization/helpers/superAdmin";
import addDialog from "~/modules/dialogs/addDialog";
import UserManagementAuthorization from "../authorization";
import AdminUsers from "../components/adminUsers";
import { UserService } from "../user";
import type { User } from "../users.types";
import AssignSuperAdminDialogContainer from "./assignSuperAdminDialogContainer";
import RevokeSuperAdminDialogContainer from "./revokeSuperAdminDialogContainer";

import type { Route } from "./+types/adminUsers.route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getSessionUser({ request });

  if (!user || !userIsSuperAdmin(user)) {
    return redirect("/");
  }

  // Fetch all users
  const users = await UserService.find({});

  // Fetch audit trail for role changes
  const audits = await AuditService.find({
    match: { action: { $in: ["ADD_SUPERADMIN", "REMOVE_SUPERADMIN"] } },
    sort: { createdAt: -1 },
    pagination: { skip: 0, limit: 100 },
  });

  return { users, audits, currentUser: user };
}

export async function action({ request }: Route.ActionArgs) {
  const user = (await getSessionUser({ request })) as User;

  if (!user || !userIsSuperAdmin(user)) {
    return data({ errors: { general: "Access denied" } }, { status: 403 });
  }

  const { intent, payload = {} } = await request.json();

  switch (intent) {
    case "ASSIGN_SUPER_ADMIN": {
      const { targetUserId, reason } = payload;

      if (!targetUserId || typeof targetUserId !== "string") {
        return data(
          { errors: { general: "Invalid request" } },
          { status: 400 },
        );
      }

      if (typeof reason !== "string" || !reason.trim()) {
        return data(
          { errors: { reason: "Reason is required" } },
          { status: 400 },
        );
      }

      let targetUser;
      try {
        targetUser = await UserService.findById(targetUserId);
      } catch {
        return data({ errors: { general: "User not found" } }, { status: 400 });
      }

      if (!targetUser) {
        return data({ errors: { general: "User not found" } }, { status: 400 });
      }

      if (
        !UserManagementAuthorization.canAssignSuperAdminToUser({
          target: targetUser,
          performer: user,
        })
      ) {
        return data(
          { errors: { general: "Cannot perform this action" } },
          { status: 400 },
        );
      }

      try {
        await UserService.assignSuperAdminRole({
          targetUserId: targetUserId.toString(),
          performedByUserId: user._id.toString(),
          reason: reason.trim(),
          performedByUsername: user.username,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        return data({ errors: { general: errorMessage } }, { status: 500 });
      }

      return data({ success: true, intent: "ASSIGN_SUPER_ADMIN" });
    }

    case "REVOKE_SUPER_ADMIN": {
      const { targetUserId, reason } = payload;

      if (!targetUserId || typeof targetUserId !== "string") {
        return data(
          { errors: { general: "Invalid request" } },
          { status: 400 },
        );
      }

      if (typeof reason !== "string" || !reason.trim()) {
        return data(
          { errors: { reason: "Reason is required" } },
          { status: 400 },
        );
      }

      let targetUser;
      try {
        targetUser = await UserService.findById(targetUserId);
      } catch {
        return data({ errors: { general: "User not found" } }, { status: 400 });
      }

      if (!targetUser) {
        return data({ errors: { general: "User not found" } }, { status: 400 });
      }

      if (
        !UserManagementAuthorization.canRevokeSuperAdminFromUser({
          target: targetUser,
          performer: user,
        })
      ) {
        return data(
          { errors: { general: "Cannot perform this action" } },
          { status: 400 },
        );
      }

      try {
        await UserService.revokeSuperAdminRole({
          targetUserId: targetUserId.toString(),
          performedByUserId: user._id.toString(),
          reason: reason.trim(),
          performedByUsername: user.username,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        return data({ errors: { general: errorMessage } }, { status: 500 });
      }

      return data({ success: true, intent: "REVOKE_SUPER_ADMIN" });
    }

    default:
      return data({ errors: { general: "Invalid intent" } }, { status: 400 });
  }
}

export default function UserManagementRoute({
  loaderData,
}: Route.ComponentProps) {
  const { users, audits, currentUser } = loaderData;
  const fetcher = useFetcher();

  const breadcrumbs = [{ text: "Users" }];

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (
        fetcher.data.success &&
        fetcher.data.intent === "ASSIGN_SUPER_ADMIN"
      ) {
        toast.success("User promoted to super admin");
        addDialog(null);
      } else if (
        fetcher.data.success &&
        fetcher.data.intent === "REVOKE_SUPER_ADMIN"
      ) {
        toast.success("Super admin status revoked");
        addDialog(null);
      } else if (fetcher.data.errors) {
        toast.error(fetcher.data.errors.general || "An error occurred");
      }
    }
  }, [fetcher.state, fetcher.data]);

  const onAssignSuperAdminClicked =
    (targetUserId: string) => (reason: string) => {
      fetcher.submit(
        JSON.stringify({
          intent: "ASSIGN_SUPER_ADMIN",
          payload: { targetUserId, reason },
        }),
        { method: "POST", encType: "application/json" },
      );
    };

  const onRevokeSuperAdminClicked =
    (targetUserId: string) => (reason: string) => {
      fetcher.submit(
        JSON.stringify({
          intent: "REVOKE_SUPER_ADMIN",
          payload: { targetUserId, reason },
        }),
        { method: "POST", encType: "application/json" },
      );
    };

  const onItemActionClicked = ({
    id,
    action,
  }: {
    id: string;
    action: string;
  }) => {
    const targetUser = users.find((u) => u._id === id);
    if (!targetUser) return;

    if (action === "ASSIGN_SUPER_ADMIN") {
      addDialog(
        <AssignSuperAdminDialogContainer
          targetUser={targetUser}
          isSubmitting={fetcher.state === "submitting"}
          onAssignSuperAdminClicked={onAssignSuperAdminClicked(targetUser._id)}
        />,
      );
    } else if (action === "REVOKE_SUPER_ADMIN") {
      addDialog(
        <RevokeSuperAdminDialogContainer
          targetUser={targetUser}
          isSubmitting={fetcher.state === "submitting"}
          onRevokeSuperAdminClicked={onRevokeSuperAdminClicked(targetUser._id)}
        />,
      );
    }
  };

  return (
    <AdminUsers
      users={users}
      audits={audits}
      currentUser={currentUser}
      breadcrumbs={breadcrumbs}
      onItemActionClicked={onItemActionClicked}
    />
  );
}
