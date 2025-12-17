import { Collection } from "@/components/ui/collection";
import getTeamsActions from "../helpers/getTeamsActions";
import getTeamsEmptyAttributes from "../helpers/getTeamsEmptyAttributes";
import getTeamsItemActions from "../helpers/getTeamsItemActions";
import getTeamsItemAttributes from "../helpers/getTeamsItemAttributes";
import teamsFilters from "../helpers/teamsFilters";
import teamsSortOptions from "../helpers/teamsSortOptions";
import type { Team } from "../teams.types";

interface TeamsProps {
  teams: Team[];
  searchValue: string,
  currentPage: number,
  totalPages: number,
  filtersValues: {},
  sortValue: string,
  onActionClicked: (action: string) => void;
  onItemActionClicked: ({ id, action }: { id: string, action: string }) => void,
  onSearchValueChanged: (searchValue: string) => void,
  onPaginationChanged: (currentPage: number) => void,
  onFiltersValueChanged: (filterValue: any) => void,
  onSortValueChanged: (sortValue: any) => void;
}

export default function Teams({
  teams,
  filtersValues,
  sortValue,
  searchValue,
  currentPage,
  totalPages,
  onActionClicked,
  onItemActionClicked,
  onSearchValueChanged,
  onPaginationChanged,
  onFiltersValueChanged,
  onSortValueChanged
}: TeamsProps) {
  return (
    <div className="max-w-6xl p-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-8">
        Teams
      </h1>
      <Collection
        items={teams}
        itemsLayout="list"
        actions={getTeamsActions()}
        filters={teamsFilters}
        sortOptions={teamsSortOptions}
        hasSearch
        hasPagination
        filtersValues={filtersValues}
        sortValue={sortValue}
        searchValue={searchValue}
        currentPage={currentPage}
        totalPages={totalPages}
        emptyAttributes={getTeamsEmptyAttributes()}
        getItemAttributes={getTeamsItemAttributes}
        getItemActions={getTeamsItemActions}
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
