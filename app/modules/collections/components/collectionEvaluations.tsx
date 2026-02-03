import { Collection as CollectionUI } from "@/components/ui/collection";
import type { Evaluation } from "~/modules/evaluations/evaluations.types";
import evaluationsActions from "../helpers/evaluationsActions";
import evaluationsSortOptions from "../helpers/evaluationsSortOptions";
import getEvaluationsEmptyAttributes from "../helpers/getEvaluationsEmptyAttributes";
import getEvaluationsItemAttributes from "../helpers/getEvaluationsItemAttributes";

export default function CollectionEvaluations({
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
      actions={evaluationsActions}
      getItemAttributes={getEvaluationsItemAttributes}
      getItemActions={() => []}
      onActionClicked={onActionClicked}
      onItemClicked={onItemClicked}
      emptyAttributes={getEvaluationsEmptyAttributes()}
      hasSearch
      searchValue={searchValue}
      onSearchValueChanged={onSearchValueChanged}
      hasPagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPaginationChanged={onCurrentPageChanged}
      sortValue={sortValue}
      sortOptions={evaluationsSortOptions}
      onSortValueChanged={onSortValueChanged}
      isSyncing={isSyncing}
      filters={[]}
      filtersValues={{}}
    />
  );
}
