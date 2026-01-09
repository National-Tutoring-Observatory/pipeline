import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { AuditRecord } from '~/modules/audits/audit.types';

dayjs.extend(relativeTime);

const getActionLabel = (action: string): string => {
  const labels: Record<string, string> = {
    'ADD_SUPERADMIN': 'User promoted to super admin',
    'REMOVE_SUPERADMIN': 'Super admin privileges revoked'
  };
  return labels[action] || 'Role updated';
};

interface AuditLogProps {
  audits: AuditRecord[];
}

export default function AuditLog({ audits }: AuditLogProps) {
  if (audits.length === 0) {
    return (
      <div className="text-center py-8">
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
          className="flex gap-4 p-4 rounded border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
        >
          <div className="flex-shrink-0 pt-1">
            {audit.action === 'ADD_SUPERADMIN' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : audit.action === 'REMOVE_SUPERADMIN' ? (
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            ) : null}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <p className="font-medium text-sm">{getActionLabel(audit.action)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {dayjs(audit.createdAt).format('MMM D, YYYY h:mm A')}
              </p>
            </div>

            <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              {audit.context?.reason && (
                <p>
                  <span className="font-medium">Reason:</span> {audit.context.reason}
                </p>
              )}

              {audit.performedByUsername && (
                <p>
                  <span className="font-medium">By:</span> {audit.performedByUsername}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
