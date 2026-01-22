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
  searchValue: string;
  currentPage: number;
  totalPages: number;
  sortValue: string;
  filtersValues: Record<string, any>;
  isSyncing?: boolean;
  onItemActionClicked: ({ id, action }: { id: string; action: string }) => void;
  onSearchValueChanged: (searchValue: string) => void;
  onPaginationChanged: (currentPage: number) => void;
  onSortValueChanged: (sortValue: string) => void;
  onFiltersValueChanged: (filterValue: any) => void;
}

export default function AdminUsers({
  users,
  audits,
  currentUser,
  breadcrumbs,
  searchValue,
  currentPage,
  totalPages,
  sortValue,
  filtersValues,
  isSyncing,
  onItemActionClicked,
  onSearchValueChanged,
  onPaginationChanged,
  onSortValueChanged,
  onFiltersValueChanged,
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
            filtersValues={filtersValues}
            sortOptions={[
              { text: "Username", value: "username" },
              { text: "Created", value: "createdAt" },
            ]}
            sortValue={sortValue}
            searchValue={searchValue}
            hasSearch
            hasPagination={true}
            currentPage={currentPage}
            totalPages={totalPages}
            isSyncing={isSyncing}
            emptyAttributes={getEmptyStateAttributes()}
            getItemAttributes={getUserManagementItemAttributes}
            getItemActions={(item) =>
              getUserManagementItemActions(item, currentUser)
            }
            onActionClicked={onActionClicked}
            onItemActionClicked={onItemActionClicked}
            onSearchValueChanged={onSearchValueChanged}
            onPaginationChanged={onPaginationChanged}
            onSortValueChanged={onSortValueChanged}
            onFiltersValueChanged={onFiltersValueChanged}
          />
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold tracking-tight">
            Role Change History
          </h2>
          <AuditLog audits={audits} />
        </div>
      </div>
    </div>
  );
}
