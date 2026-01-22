import { Collection } from "@/components/ui/collection";
import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import getPromptsEmptyAttributes from "../helpers/getPromptsEmptyAttributes";
import getPromptsItemActions from "../helpers/getPromptsItemActions";
import getPromptsItemAttributes from "../helpers/getPromptsItemAttributes";
import promptsActions from "../helpers/promptsActions";
import promptsFilters from "../helpers/promptsFilters";
import promptsSortOptions from "../helpers/promptsSortOptions";
import type { Prompt } from "../prompts.types";

interface PromptsProps {
  prompts: Prompt[];
  breadcrumbs: Breadcrumb[];
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
}

export default function Prompts({
  prompts,
  breadcrumbs,
  filtersValues,
  sortValue,
  searchValue,
  currentPage,
  totalPages,
  isSyncing,
  onActionClicked,
  onItemActionClicked,
  onSearchValueChanged,
  onPaginationChanged,
  onFiltersValueChanged,
  onSortValueChanged,
}: PromptsProps) {
  return (
    <div className="max-w-6xl p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
      </PageHeader>
      <Collection
        items={prompts}
        itemsLayout="list"
        actions={promptsActions}
        filters={promptsFilters}
        sortOptions={promptsSortOptions}
        hasSearch
        hasPagination
        filtersValues={filtersValues}
        sortValue={sortValue}
        searchValue={searchValue}
        currentPage={currentPage}
        totalPages={totalPages}
        isSyncing={isSyncing}
        emptyAttributes={getPromptsEmptyAttributes()}
        getItemAttributes={getPromptsItemAttributes}
        getItemActions={getPromptsItemActions}
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
