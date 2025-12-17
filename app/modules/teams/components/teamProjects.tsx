import { Collection } from "@/components/ui/collection";
import type { Project } from "~/modules/projects/projects.types";
import getTeamProjectsActions from "../helpers/getTeamProjectsActions";
import getTeamProjectsEmptyAttributes from "../helpers/getTeamProjectsEmptyAttributes";
import getTeamProjectsItemActions from "../helpers/getTeamProjectsItemActions";
import getTeamProjectsItemAttributes from "../helpers/getTeamProjectsItemAttributes";
import teamProjectsFilters from "../helpers/teamProjectsFilters";
import teamProjectsSortOptions from "../helpers/teamProjectsSortOptions";
import type { Team } from "../teams.types";

interface TeamProjectsProps {
  projects: Project[];
  team: Team;
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
  onSortValueChanged: (sortValue: any) => void
  onCreateProjectButtonClicked: () => void;
}

export default function TeamProjects({
  projects,
  team,
  filtersValues,
  sortValue,
  searchValue,
  currentPage,
  totalPages,
  onCreateProjectButtonClicked,
  onActionClicked,
  onItemActionClicked,
  onSearchValueChanged,
  onPaginationChanged,
  onFiltersValueChanged,
  onSortValueChanged
}: TeamProjectsProps) {
  return (
    <div>
      <Collection
        items={projects}
        itemsLayout="list"
        actions={getTeamProjectsActions(team._id)}
        filters={teamProjectsFilters}
        sortOptions={teamProjectsSortOptions}
        hasSearch
        hasPagination
        filtersValues={filtersValues}
        sortValue={sortValue}
        searchValue={searchValue}
        currentPage={currentPage}
        totalPages={totalPages}
        emptyAttributes={getTeamProjectsEmptyAttributes()}
        getItemAttributes={(item) => getTeamProjectsItemAttributes(item, team._id)}
        getItemActions={getTeamProjectsItemActions}
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
