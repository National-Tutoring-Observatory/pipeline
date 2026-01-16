
import { Collection } from "@/components/ui/collection";
import { PageHeader } from "@/components/ui/pageHeader";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import getProjectsEmptyAttributes from "../helpers/getProjectsEmptyAttributes";
import getProjectsItemActions from "../helpers/getProjectsItemActions";
import getProjectsItemAttributes from "../helpers/getProjectsItemAttributes";
import projectsActions from "../helpers/projectsActions";
import projectsFilters from "../helpers/projectsFilters";
import projectsSortOptions from "../helpers/projectsSortOptions";
import type { Project } from "../projects.types";

interface ProjectsProps {
  projects: Project[];
  searchValue: string,
  currentPage: number,
  totalPages: number,
  filtersValues: {},
  sortValue: string,
  isSyncing: boolean,
  onActionClicked: (action: string) => void;
  onItemActionClicked: ({ id, action }: { id: string, action: string }) => void,
  onSearchValueChanged: (searchValue: string) => void,
  onPaginationChanged: (currentPage: number) => void,
  onFiltersValueChanged: (filterValue: any) => void,
  onSortValueChanged: (sortValue: any) => void
}

export default function Projects({
  projects,
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
  onSortValueChanged
}: ProjectsProps) {
  return (
    <div className="max-w-6xl p-8">
      <PageHeader>
        <Breadcrumbs breadcrumbs={[]} />
        <div>

        </div>
      </PageHeader>
      <Collection
        items={projects}
        itemsLayout="list"
        actions={projectsActions}
        filters={projectsFilters}
        filtersValues={filtersValues}
        sortOptions={projectsSortOptions}
        sortValue={sortValue}
        hasSearch
        hasPagination
        searchValue={searchValue}
        currentPage={currentPage}
        totalPages={totalPages}
        isSyncing={isSyncing}
        emptyAttributes={getProjectsEmptyAttributes()}
        getItemAttributes={getProjectsItemAttributes}
        getItemActions={getProjectsItemActions}
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
