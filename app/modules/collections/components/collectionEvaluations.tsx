import { Collection as CollectionUI } from "@/components/ui/collection";
import type { Collection } from "~/modules/collections/collections.types";
import type { Evaluation } from "~/modules/evaluations/evaluations.types";

export default function CollectionEvaluations({
  collection,
  evaluations,
  totalPages,
  currentPage,
  searchValue,
  sortValue,
  isSyncing,
  onSearchValueChanged,
  onCurrentPageChanged,
  onSortValueChanged,
  onItemClicked,
  onActionClicked,
}: {
  collection: Collection;
  evaluations: Evaluation[];
  totalPages: number;
  currentPage: number;
  searchValue: string;
  sortValue: string;
  isSyncing: boolean;
  onSearchValueChanged: (value: string) => void;
  onCurrentPageChanged: (page: number) => void;
  onSortValueChanged: (sort: string) => void;
  onItemClicked: (id: string) => void;
  onActionClicked: (action: string) => void;
}) {
  return (
    <CollectionUI
      items={evaluations}
      itemsLayout="list"
      getItemAttributes={(item) => ({
        id: item._id,
        title: item.name,
        description: `${item.runs?.length || 0} runs`,
      })}
      getItemActions={() => []}
      onActionClicked={onActionClicked}
      onItemClicked={onItemClicked}
      emptyAttributes={{
        title: "No evaluations found",
        description: "Create an evaluation to get started",
      }}
      hasSearch
      searchValue={searchValue}
      onSearchValueChanged={onSearchValueChanged}
      hasPagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPaginationChanged={onCurrentPageChanged}
      sortValue={sortValue}
      sortOptions={[
        { text: "Name", value: "name" },
        { text: "Created", value: "createdAt" },
      ]}
      onSortValueChanged={onSortValueChanged}
      isSyncing={isSyncing}
      filters={[]}
      filtersValues={{}}
    />
  );
}
