import type { CollectionItemAttributes } from "@/components/ui/collectionContentItem";
import dayjs from "dayjs";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { AuditRecord } from "~/modules/audits/audit.types";

const getActionLabel = (action: string): string => {
  const labels: Record<string, string> = {
    ADD_SUPERADMIN: "User promoted to super admin",
    REMOVE_SUPERADMIN: "Super admin privileges revoked",
  };
  return labels[action] || "Role updated";
};

export default (audit: AuditRecord): CollectionItemAttributes => {
  const icon =
    audit.action === "ADD_SUPERADMIN" ? (
      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
    ) : audit.action === "REMOVE_SUPERADMIN" ? (
      <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
    ) : null;

  const details = [
    audit.context?.targetUsername && `User: ${audit.context.targetUsername}`,
    audit.context?.reason && `Reason: ${audit.context.reason}`,
    audit.performedByUsername && `By: ${audit.performedByUsername}`,
  ]
    .filter(Boolean)
    .join(" • ");

  return {
    id: audit._id,
    title: getActionLabel(audit.action),
    description: details,
    meta: [
      {
        text: dayjs(audit.createdAt).format("MMM D, YYYY h:mm A"),
        icon: icon || undefined,
      },
    ],
  };
};
