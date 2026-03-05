import { Collection } from "@/components/ui/collection";
import type { File } from "~/modules/files/files.types";
import getFilesEmptyAttributes from "../helpers/getFilesEmptyAttributes";
import getFilesItemAttributes from "../helpers/getFilesItemAttributes";

interface FilesProps {
  files: File[];
  actions: { action: string; text: string }[];
  searchValue: string;
  currentPage: number;
  totalPages: number;
  sortValue: string;
  isSyncing: boolean;
  onActionClicked: (action: string) => void;
  onSearchValueChanged: (searchValue: string) => void;
  onPaginationChanged: (currentPage: number) => void;
  onSortValueChanged: (sortValue: string) => void;
}

const sortOptions = [
  { value: "name", text: "Name" },
  { value: "createdAt", text: "Created at" },
];

export default function Files({
  files,
  actions,
  searchValue,
  currentPage,
  totalPages,
  sortValue,
  isSyncing,
  onActionClicked,
  onSearchValueChanged,
  onPaginationChanged,
  onSortValueChanged,
}: FilesProps) {
  return (
    <div className="mt-8">
      <Collection
        items={files}
        itemsLayout="list"
        actions={actions}
        hasSearch
        hasPagination
        searchValue={searchValue}
        currentPage={currentPage}
        totalPages={totalPages}
        sortOptions={sortOptions}
        sortValue={sortValue}
        isSyncing={isSyncing}
        filters={[]}
        filtersValues={{}}
        emptyAttributes={getFilesEmptyAttributes()}
        getItemAttributes={getFilesItemAttributes}
        getItemActions={() => []}
        onActionClicked={onActionClicked}
        onSearchValueChanged={onSearchValueChanged}
        onPaginationChanged={onPaginationChanged}
        onSortValueChanged={onSortValueChanged}
      />
    </div>
  );
}
