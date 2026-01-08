import { Collection } from "@/components/ui/collection";
import type { Session } from "~/modules/sessions/sessions.types";
import getProjectSessionsActions from "../helpers/getProjectSessionsActions";
import getProjectSessionsEmptyAttributes from "../helpers/getProjectSessionsEmptyAttributes";
import getProjectSessionsItemActions from "../helpers/getProjectSessionsItemActions";
import getProjectSessionsItemAttributes from "../helpers/getProjectSessionsItemAttributes";
import projectSessionsFilters from "../helpers/projectSessionsFilters";
import projectSessionsSortOptions from "../helpers/projectSessionsSortOptions";
import type { Project } from "../projects.types";

export default function ProjectSessions({
  project,
  sessions,
  searchValue,
  currentPage,
  totalPages,
  filtersValues,
  sortValue,
  isSyncing,
  onActionClicked,
  onItemClicked,
  onSearchValueChanged,
  onPaginationChanged,
  onFiltersValueChanged,
  onSortValueChanged,
}: {
  project: Project,
  sessions: Session[],
  searchValue: string,
  currentPage: number,
  totalPages: number,
  filtersValues: {},
  sortValue: string,
  isSyncing: boolean,
  onActionClicked: (action: string) => void;
  onItemClicked: (id: string) => void,
  onSearchValueChanged: (searchValue: string) => void,
  onPaginationChanged: (currentPage: number) => void,
  onFiltersValueChanged: (filterValue: any) => void,
  onSortValueChanged: (sortValue: any) => void
}) {
  return (
    <div className="mt-8">
      <Collection
        items={sessions}
        itemsLayout="list"
        actions={getProjectSessionsActions(project)}
        filters={projectSessionsFilters}
        sortOptions={projectSessionsSortOptions}
        hasSearch
        hasPagination
        filtersValues={filtersValues}
        sortValue={sortValue}
        searchValue={searchValue}
        currentPage={currentPage}
        totalPages={totalPages}
        isSyncing={isSyncing}
        emptyAttributes={getProjectSessionsEmptyAttributes()}
        getItemAttributes={getProjectSessionsItemAttributes}
        getItemActions={getProjectSessionsItemActions}
        onItemClicked={onItemClicked}
        onActionClicked={onActionClicked}
        onSearchValueChanged={onSearchValueChanged}
        onPaginationChanged={onPaginationChanged}
        onFiltersValueChanged={onFiltersValueChanged}
        onSortValueChanged={onSortValueChanged}
      />
    </div>
  )
}
