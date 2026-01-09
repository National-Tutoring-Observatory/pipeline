import { Collection } from '@/components/ui/collection';
import type { User } from '../users.types';
import type { AuditRecord } from '~/modules/audits/audit.types';
import getUserManagementItemActions from '../helpers/getUserManagementItemActions';
import getUserManagementItemAttributes from '../helpers/getUserManagementItemAttributes';
import getEmptyStateAttributes from '../helpers/getEmptyStateAttributes';
import AuditLog from './auditLog';

interface AdminUsersProps {
  users: User[];
  audits: AuditRecord[];
  currentUser: User;
  onItemActionClicked: ({ id, action }: { id: string; action: string }) => void;
}

export default function AdminUsers({
  users,
  audits,
  currentUser,
  onItemActionClicked
}: AdminUsersProps) {
  const onActionClicked = (action: string) => {
    // No collection-level actions
  };

  return (
    <div className="max-w-6xl p-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-8">
        System Administrators
      </h1>

      <div className="space-y-12">
        <div>
          <Collection
            items={users}
            itemsLayout="list"
            actions={[]}
            filters={[]}
            filtersValues={{}}
            sortOptions={[]}
            sortValue=""
            hasSearch
            hasPagination={false}
            currentPage={1}
            totalPages={1}
            emptyAttributes={getEmptyStateAttributes()}
            getItemAttributes={getUserManagementItemAttributes}
            getItemActions={(item) => getUserManagementItemActions(item, currentUser)}
            onActionClicked={onActionClicked}
            onItemActionClicked={onItemActionClicked}
            onPaginationChanged={() => {}}
            onSortValueChanged={() => {}}
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Role Change History</h2>
          <AuditLog audits={audits} />
        </div>
      </div>
    </div>
  );
}
