import { Collection } from "@/components/ui/collection";
import type { Filter } from "@/components/ui/filters";
import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import type { User } from "~/modules/users/users.types";
import getPromptsEmptyAttributes from "../helpers/getPromptsEmptyAttributes";
import getPromptsItemActions from "../helpers/getPromptsItemActions";
import getPromptsItemAttributes from "../helpers/getPromptsItemAttributes";
import promptsActions from "../helpers/promptsActions";
import promptsSortOptions from "../helpers/promptsSortOptions";
import type { Prompt } from "../prompts.types";

interface PromptsProps {
  prompts: Prompt[];
  user: User;
  filters: Filter[];
  breadcrumbs: Breadcrumb[];
  searchValue: string;
  currentPage: number;
  totalPages: number;
  filtersValues: Record<string, string | null>;
  sortValue: string;
  isSyncing: boolean;
  onActionClicked: (action: string) => void;
  onItemActionClicked: ({ id, action }: { id: string; action: string }) => void;
  onSearchValueChanged: (searchValue: string) => void;
  onPaginationChanged: (currentPage: number) => void;
  onFiltersValueChanged: (filterValue: Record<string, string | null>) => void;
  onSortValueChanged: (sortValue: string) => void;
}

export default function Prompts({
  prompts,
  user,
  filters,
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
    <div className="max-w-7xl p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
      </PageHeader>
      <Collection
        items={prompts}
        itemsLayout="list"
        actions={promptsActions}
        filters={filters}
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
        getItemActions={(item) => getPromptsItemActions(item, user)}
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
