import { Collection } from "@/components/ui/collection";
import type { Run } from "~/modules/runs/runs.types";
import getProjectRunsEmptyAttributes from "../helpers/getProjectRunsEmptyAttributes";
import useProjectRunsItemActions from "../helpers/getProjectRunsItemActions";
import getProjectRunsItemAttributes from "../helpers/getProjectRunsItemAttributes";
import projectRunsActions from "../helpers/projectRunsActions";
import projectRunsFilters from "../helpers/projectRunsFilters";
import projectRunsSortOptions from "../helpers/projectRunsSortOptions";

export default function ProjectRuns({
  runs,
  searchValue,
  currentPage,
  totalPages,
  filtersValues,
  sortValue,
  isSyncing,
  onActionClicked,
  onItemActionClicked,
  onSearchValueChanged,
  onPaginationChanged,
  onFiltersValueChanged,
  onSortValueChanged,
}: {
  runs: Run[];
  searchValue: string;
  currentPage: number;
  totalPages: number;
  filtersValues: {};
  sortValue: string;
  isSyncing: boolean;
  onActionClicked: (action: string) => void;
  onItemActionClicked: ({ id, action }: { id: string; action: string }) => void;
  onSearchValueChanged: (searchValue: string) => void;
  onPaginationChanged: (currentPage: number) => void;
  onFiltersValueChanged: (filterValue: any) => void;
  onSortValueChanged: (sortValue: any) => void;
}) {
  const getItemActions = useProjectRunsItemActions();

  return (
    <div className="mt-8">
      <Collection
        items={runs}
        itemsLayout="list"
        actions={projectRunsActions}
        filters={projectRunsFilters}
        sortOptions={projectRunsSortOptions}
        hasSearch
        hasPagination
        filtersValues={filtersValues}
        sortValue={sortValue}
        searchValue={searchValue}
        currentPage={currentPage}
        totalPages={totalPages}
        isSyncing={isSyncing}
        emptyAttributes={getProjectRunsEmptyAttributes()}
        getItemAttributes={getProjectRunsItemAttributes}
        getItemActions={getItemActions}
        onActionClicked={onActionClicked}
        onItemActionClicked={onItemActionClicked}
        onSearchValueChanged={onSearchValueChanged}
        onPaginationChanged={onPaginationChanged}
        onFiltersValueChanged={onFiltersValueChanged}
        onSortValueChanged={onSortValueChanged}
      />
    </div>
  );
}
