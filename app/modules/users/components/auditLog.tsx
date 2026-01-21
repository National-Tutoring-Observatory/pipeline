import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { AuditRecord } from "~/modules/audits/audit.types";

dayjs.extend(relativeTime);

const getActionLabel = (action: string): string => {
  const labels: Record<string, string> = {
    ADD_SUPERADMIN: "User promoted to super admin",
    REMOVE_SUPERADMIN: "Super admin privileges revoked",
  };
  return labels[action] || "Role updated";
};

interface AuditLogProps {
  audits: AuditRecord[];
}

export default function AuditLog({ audits }: AuditLogProps) {
  if (audits.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No role changes recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {audits.map((audit) => (
        <div
          key={audit._id}
          className="flex gap-4 rounded border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
        >
          <div className="flex-shrink-0 pt-1">
            {audit.action === "ADD_SUPERADMIN" ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : audit.action === "REMOVE_SUPERADMIN" ? (
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-baseline gap-2">
              <p className="text-sm font-medium">
                {getActionLabel(audit.action)}
              </p>
              <p className="text-xs whitespace-nowrap text-gray-500 dark:text-gray-400">
                {dayjs(audit.createdAt).format("MMM D, YYYY h:mm A")}
              </p>
            </div>

            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              {audit.context?.reason && (
                <p>
                  <span className="font-medium">Reason:</span>{" "}
                  {audit.context.reason}
                </p>
              )}

              {audit.performedByUsername && (
                <p>
                  <span className="font-medium">By:</span>{" "}
                  {audit.performedByUsername}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
