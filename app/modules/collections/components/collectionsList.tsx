import { Collection as CollectionComponent } from "@/components/ui/collection";
import type { Collection } from "~/modules/collections/collections.types";
import collectionsActions from "~/modules/collections/helpers/collectionsActions";
import collectionsSortOptions from "~/modules/collections/helpers/collectionsSortOptions";
import getCollectionsEmptyAttributes from "~/modules/collections/helpers/getCollectionsEmptyAttributes";
import getCollectionsItemActions from "~/modules/collections/helpers/getCollectionsItemActions";
import getCollectionsItemAttributes from "~/modules/collections/helpers/getCollectionsItemAttributes";

interface CollectionsListProps {
  collections: Collection[];
  totalPages: number;
  searchValue: string;
  currentPage: number;
  sortValue: string;
  isSyncing: boolean;
  hasCollectionsFeature: boolean;
  onCreateCollectionButtonClicked: () => void;
  onEditCollectionButtonClicked: (collection: Collection) => void;
  onDuplicateCollectionButtonClicked: (collection: Collection) => void;
  onUseAsTemplateButtonClicked: (collection: Collection) => void;
  onDeleteCollectionButtonClicked: (collection: Collection) => void;
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
  hasCollectionsFeature,
  onCreateCollectionButtonClicked,
  onEditCollectionButtonClicked,
  onDuplicateCollectionButtonClicked,
  onUseAsTemplateButtonClicked,
  onDeleteCollectionButtonClicked,
  onSearchValueChanged,
  onPaginationChanged,
  onSortValueChanged,
}: CollectionsListProps) {
  const handleItemActionClicked = ({
    id,
    action,
  }: {
    id: string;
    action: string;
  }) => {
    const collection = collections?.find((c) => c._id === id);
    if (!collection) return;

    switch (action) {
      case "EDIT":
        onEditCollectionButtonClicked(collection);
        break;
      case "DUPLICATE":
        onDuplicateCollectionButtonClicked(collection);
        break;
      case "USE_AS_TEMPLATE":
        onUseAsTemplateButtonClicked(collection);
        break;
      case "DELETE":
        onDeleteCollectionButtonClicked(collection);
        break;
    }
  };

  const handleActionClicked = (action: string) => {
    if (action === "CREATE") {
      onCreateCollectionButtonClicked();
    }
  };

  if (!hasCollectionsFeature) {
    return (
      <div className="mt-8">
        <CollectionComponent
          items={[]}
          itemsLayout="list"
          actions={[]}
          sortOptions={[]}
          filters={[]}
          filtersValues={{}}
          emptyAttributes={{
            title: "Coming soon",
            description: "Collections will be available in a future update.",
          }}
          getItemAttributes={getCollectionsItemAttributes}
          getItemActions={() => []}
          onActionClicked={() => {}}
          onItemActionClicked={() => {}}
          onSearchValueChanged={() => {}}
          onPaginationChanged={() => {}}
          onFiltersValueChanged={() => {}}
          onSortValueChanged={() => {}}
          currentPage={1}
          totalPages={1}
        />
      </div>
    );
  }

  return (
    <div className="mt-8">
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
