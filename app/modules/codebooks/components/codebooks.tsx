import { Collection } from "@/components/ui/collection";
import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import type { User } from "~/modules/users/users.types";
import type { Codebook } from "../codebooks.types";
import codebooksActions from "../helpers/codebooksActions";
import codebooksSortOptions from "../helpers/codebooksSortOptions";
import getCodebooksEmptyAttributes from "../helpers/getCodebooksEmptyAttributes";
import getCodebooksItemActions from "../helpers/getCodebooksItemActions";
import getCodebooksItemAttributes from "../helpers/getCodebooksItemAttributes";

interface CodebooksProps {
  codebooks: Codebook[];
  user: User;
  breadcrumbs: Breadcrumb[];
  searchValue: string;
  currentPage: number;
  totalPages: number;
  sortValue: string;
  isSyncing: boolean;
  onActionClicked: (action: string) => void;
  onItemActionClicked: ({ id, action }: { id: string; action: string }) => void;
  onSearchValueChanged: (searchValue: string) => void;
  onPaginationChanged: (currentPage: number) => void;
  onSortValueChanged: (sortValue: any) => void;
}

export default function Codebooks({
  codebooks,
  user,
  breadcrumbs,
  sortValue,
  searchValue,
  currentPage,
  totalPages,
  isSyncing,
  onActionClicked,
  onItemActionClicked,
  onSearchValueChanged,
  onPaginationChanged,
  onSortValueChanged,
}: CodebooksProps) {
  return (
    <div className="max-w-7xl p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
      </PageHeader>
      <Collection
        items={codebooks}
        itemsLayout="list"
        actions={codebooksActions}
        filters={[]}
        filtersValues={{}}
        sortOptions={codebooksSortOptions}
        hasSearch
        hasPagination
        sortValue={sortValue}
        searchValue={searchValue}
        currentPage={currentPage}
        totalPages={totalPages}
        isSyncing={isSyncing}
        emptyAttributes={getCodebooksEmptyAttributes()}
        getItemAttributes={getCodebooksItemAttributes}
        getItemActions={(item) => getCodebooksItemActions(item, user)}
        onActionClicked={onActionClicked}
        onItemActionClicked={onItemActionClicked}
        onSearchValueChanged={onSearchValueChanged}
        onPaginationChanged={onPaginationChanged}
        onSortValueChanged={onSortValueChanged}
      />
    </div>
  );
}
