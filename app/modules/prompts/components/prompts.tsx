
import { Collection } from "@/components/ui/collection";
import getPromptsEmptyAttributes from "../helpers/getPromptsEmptyAttributes";
import getPromptsItemActions from "../helpers/getPromptsItemActions";
import getPromptsItemAttributes from "../helpers/getPromptsItemAttributes";
import promptsActions from "../helpers/promptsActions";
import promptsFilters from "../helpers/promptsFilters";
import promptsSortOptions from "../helpers/promptsSortOptions";
import type { Prompt } from "../prompts.types";

interface PromptsProps {
  prompts: Prompt[];
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
  onCreatePromptButtonClicked: () => void;
  onEditPromptButtonClicked: (prompt: Prompt) => void;
  onDeletePromptButtonClicked: (prompt: Prompt) => void;
}

export default function Prompts({
  prompts,
  filtersValues,
  sortValue,
  searchValue,
  currentPage,
  totalPages,
  onCreatePromptButtonClicked,
  onEditPromptButtonClicked,
  onDeletePromptButtonClicked,
  onActionClicked,
  onItemActionClicked,
  onSearchValueChanged,
  onPaginationChanged,
  onFiltersValueChanged,
  onSortValueChanged
}: PromptsProps) {
  return (
    <div className="max-w-6xl p-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-8">
        Prompts
      </h1>
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
