import { Collection as CollectionComponent } from "@/components/ui/collection";
import getCollectionsEmptyAttributes from "~/modules/collections/helpers/getCollectionsEmptyAttributes";
import getCollectionsItemActions from "~/modules/collections/helpers/getCollectionsItemActions";
import getCollectionsItemAttributes from "~/modules/collections/helpers/getCollectionsItemAttributes";
import collectionsActions from "~/modules/collections/helpers/collectionsActions";
import collectionsSortOptions from "~/modules/collections/helpers/collectionsSortOptions";
import type { Collection } from "~/modules/collections/collections.types";

interface CollectionsListProps {
  collections: Collection[];
  totalPages: number;
  searchValue: string;
  currentPage: number;
  sortValue: string;
  isSyncing: boolean;
  onCreateCollectionButtonClicked: () => void;
  onEditCollectionButtonClicked: (collection: Collection) => void;
  onDuplicateCollectionButtonClicked: (collection: Collection) => void;
  onSearchValueChanged: (searchValue: string) => void;
  onPaginationChanged: (currentPage: number) => void;
  onSortValueChanged: (sortValue: string) => void;
}

export default function CollectionsList({
  collections,
  totalPages,
  searchValue,
  currentPage,
  sortValue,
  isSyncing,
  onCreateCollectionButtonClicked,
  onEditCollectionButtonClicked,
  onDuplicateCollectionButtonClicked,
  onSearchValueChanged,
  onPaginationChanged,
  onSortValueChanged
}: CollectionsListProps) {
  const handleItemActionClicked = ({ id, action }: { id: string; action: string }) => {
    const collection = collections?.find(c => c._id === id);
    if (!collection) return;

    switch (action) {
      case 'EDIT':
        onEditCollectionButtonClicked(collection);
        break;
      case 'DUPLICATE':
        onDuplicateCollectionButtonClicked(collection);
        break;
    }
  };

  const handleActionClicked = (action: string) => {
    if (action === 'CREATE') {
      onCreateCollectionButtonClicked();
    }
  };

  return (
    <div className="max-w-6xl p-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-8">
        Collections
      </h1>
      <CollectionComponent
        items={collections || []}
        itemsLayout="list"
        actions={collectionsActions}
        sortOptions={collectionsSortOptions}
        filters={[]}
        filtersValues={{}}
        hasSearch
        hasPagination
        sortValue={sortValue}
        searchValue={searchValue}
        currentPage={currentPage}
        totalPages={totalPages}
        isSyncing={isSyncing}
        emptyAttributes={getCollectionsEmptyAttributes()}
        getItemAttributes={getCollectionsItemAttributes}
        getItemActions={getCollectionsItemActions}
        onActionClicked={handleActionClicked}
        onItemActionClicked={handleItemActionClicked}
        onSearchValueChanged={onSearchValueChanged}
        onPaginationChanged={onPaginationChanged}
        onFiltersValueChanged={() => {}}
        onSortValueChanged={onSortValueChanged}
      />
    </div>
  );
}
