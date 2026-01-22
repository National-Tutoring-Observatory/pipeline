import { Collection } from "@/components/ui/collection";
import type { AuditRecord } from "~/modules/audits/audit.types";
import getAuditLogItemAttributes from "../helpers/getAuditLogItemAttributes";

interface AuditLogProps {
  audits: AuditRecord[];
  searchValue: string;
  sortValue: string;
  currentPage: number;
  totalPages: number;
  onSearchValueChanged: (searchValue: string) => void;
  onPaginationChanged: (page: number) => void;
  onSortValueChanged: (sortValue: string) => void;
}

export default function AuditLog({
  audits,
  searchValue,
  sortValue,
  currentPage,
  totalPages,
  onSearchValueChanged,
  onPaginationChanged,
  onSortValueChanged,
}: AuditLogProps) {
  return (
    <Collection
      items={audits}
      itemsLayout="list"
      actions={[]}
      filters={[]}
      filtersValues={{}}
      sortOptions={[{ text: "Created", value: "createdAt" }]}
      sortValue={sortValue}
      searchValue={searchValue}
      hasSearch
      hasPagination
      currentPage={currentPage}
      totalPages={totalPages}
      emptyAttributes={{
        title: "No audit records",
        description: searchValue
          ? "No audit records match your search."
          : "No role changes recorded yet.",
      }}
      getItemAttributes={getAuditLogItemAttributes}
      getItemActions={() => []}
      onActionClicked={() => {}}
      onSearchValueChanged={onSearchValueChanged}
      onPaginationChanged={onPaginationChanged}
      onSortValueChanged={onSortValueChanged}
      onFiltersValueChanged={() => {}}
    />
  );
}
