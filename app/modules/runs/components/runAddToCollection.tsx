import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collection } from "@/components/ui/collection";
import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import { Spinner } from "@/components/ui/spinner";
import cloneDeep from "lodash/cloneDeep";
import includes from "lodash/includes";
import map from "lodash/map";
import pull from "lodash/pull";
import { FolderPlus, Zap } from "lucide-react";
import { useState } from "react";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import getDateString from "~/modules/app/helpers/getDateString";
import type { Collection as CollectionType } from "~/modules/collections/collections.types";

export default function RunAddToCollection({
  eligibleCollections,
  totalEligibleCollections,
  totalPages,
  breadcrumbs,
  isSubmitting,
  searchValue,
  currentPage,
  isSyncing,
  onAddToCollectionsClicked,
  onCreateCollectionClicked,
  onCancelClicked,
  onSearchValueChanged,
  onPaginationChanged,
}: {
  eligibleCollections: CollectionType[];
  totalEligibleCollections: number;
  totalPages: number;
  breadcrumbs: Breadcrumb[];
  isSubmitting: boolean;
  searchValue: string;
  currentPage: number;
  isSyncing: boolean;
  onAddToCollectionsClicked: (collectionIds: string[]) => void;
  onCreateCollectionClicked: () => void;
  onCancelClicked: () => void;
  onSearchValueChanged: (value: string) => void;
  onPaginationChanged: (page: number) => void;
}) {
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const onSelectAllToggled = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedCollections(map(eligibleCollections, "_id"));
    } else {
      setSelectedCollections([]);
    }
  };

  const onSelectCollectionToggled = (
    collectionId: string,
    isChecked: boolean,
  ) => {
    const cloned = cloneDeep(selectedCollections);
    if (isChecked) {
      cloned.push(collectionId);
      setSelectedCollections(cloned);
    } else {
      pull(cloned, collectionId);
      setSelectedCollections(cloned);
    }
  };

  const getItemAttributes = (collection: CollectionType) => ({
    id: collection._id,
    title: collection.name,
    meta: [
      {
        text: `${collection.runs?.length || 0} run${(collection.runs?.length || 0) !== 1 ? "s" : ""}`,
      },
      { text: `Created ${getDateString(collection.createdAt)}` },
    ],
  });

  const renderItem = (collection: CollectionType) => (
    <div className="flex w-full items-center gap-4 p-4">
      <Checkbox
        checked={includes(selectedCollections, collection._id)}
        onCheckedChange={(checked) =>
          onSelectCollectionToggled(collection._id, Boolean(checked))
        }
        onClick={(e) => e.stopPropagation()}
      />
      <div className="min-w-0 flex-1">
        <div className="font-medium">{collection.name}</div>
        <div className="text-muted-foreground flex gap-4 text-sm">
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {collection.runs?.length || 0} run
            {(collection.runs?.length || 0) !== 1 ? "s" : ""}
          </span>
          <span>Created {getDateString(collection.createdAt)}</span>
        </div>
      </div>
    </div>
  );

  const allSelected =
    eligibleCollections.length > 0 &&
    selectedCollections.length === eligibleCollections.length;

  return (
    <div className="p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
      </PageHeader>
      <p className="text-muted-foreground mb-6">
        Select existing collections to add this run to, or create a new one.
      </p>

      <div className="mb-6">
        <Button
          variant="outline"
          onClick={onCreateCollectionClicked}
          disabled={isSubmitting}
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          Create New Collection
        </Button>
      </div>

      {totalEligibleCollections === 0 && !searchValue ? (
        <div className="text-muted-foreground py-12 text-center">
          <p>No eligible collections found.</p>
          <p className="mt-2 text-sm">
            Collections must have the same sessions and annotation type as this
            run.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-4">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) =>
                onSelectAllToggled(Boolean(checked))
              }
            />
            <span className="text-muted-foreground text-sm">
              Select all ({selectedCollections.length} of{" "}
              {totalEligibleCollections} selected)
            </span>
          </div>

          <Collection
            items={eligibleCollections}
            itemsLayout="list"
            hasSearch
            hasPagination
            searchValue={searchValue}
            currentPage={currentPage}
            totalPages={totalPages}
            isSyncing={isSyncing}
            emptyAttributes={{
              title: "No collections found",
              description: searchValue
                ? "Try a different search term"
                : "No eligible collections available",
            }}
            getItemAttributes={getItemAttributes}
            getItemActions={() => []}
            renderItem={renderItem}
            onItemClicked={(id) => {
              const isSelected = includes(selectedCollections, id);
              onSelectCollectionToggled(id, !isSelected);
            }}
            onActionClicked={() => {}}
            onSearchValueChanged={onSearchValueChanged}
            onPaginationChanged={onPaginationChanged}
            onFiltersValueChanged={() => {}}
            onSortValueChanged={() => {}}
            filters={[]}
            filtersValues={{}}
          />

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onCancelClicked}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => onAddToCollectionsClicked(selectedCollections)}
              disabled={selectedCollections.length === 0 || isSubmitting}
            >
              {isSubmitting && <Spinner />}
              {isSubmitting
                ? "Adding..."
                : `Add to ${selectedCollections.length} Collection${selectedCollections.length !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
