import { Collection } from "@/components/ui/collection";
import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import type { AuditRecord } from "~/modules/audits/audit.types";
import getEmptyStateAttributes from "../helpers/getEmptyStateAttributes";
import getUserManagementItemActions from "../helpers/getUserManagementItemActions";
import getUserManagementItemAttributes from "../helpers/getUserManagementItemAttributes";
import type { User } from "../users.types";
import AuditLog from "./auditLog";

interface AdminUsersProps {
  users: User[];
  audits: AuditRecord[];
  currentUser: User;
  breadcrumbs: Breadcrumb[];
  onItemActionClicked: ({ id, action }: { id: string; action: string }) => void;
}

export default function AdminUsers({
  users,
  audits,
  currentUser,
  breadcrumbs,
  onItemActionClicked,
}: AdminUsersProps) {
  const onActionClicked = (action: string) => {
    // No collection-level actions
  };

  return (
    <div className="max-w-6xl p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
      </PageHeader>
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
            getItemActions={(item) =>
              getUserManagementItemActions(item, currentUser)
            }
            onActionClicked={onActionClicked}
            onItemActionClicked={onItemActionClicked}
            onPaginationChanged={() => {}}
            onSortValueChanged={() => {}}
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Role Change History
          </h2>
          <AuditLog audits={audits} />
        </div>
      </div>
    </div>
  );
}
