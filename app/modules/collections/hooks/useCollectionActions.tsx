import { useEffect } from 'react';
import { useFetcher } from 'react-router';
import { toast } from 'sonner';
import type { Collection } from '~/modules/collections/collections.types';
import type { Run } from '~/modules/runs/runs.types';
import AddRunsDialog from '~/modules/collections/components/addRunsDialog';
import DeleteCollectionDialog from '~/modules/collections/components/deleteCollectionDialog';
import EditCollectionDialog from '~/modules/collections/components/editCollectionDialog';
import MergeCollectionsDialog from '~/modules/collections/components/mergeCollectionsDialog';
import addDialog from '~/modules/dialogs/addDialog';

interface UseCollectionActionsOptions {
  projectId: string;
  collectionId?: string;
  onEditSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onAddRunsSuccess?: () => void;
  onMergeSuccess?: () => void;
}

export function useCollectionActions({
  projectId,
  collectionId,
  onEditSuccess,
  onDeleteSuccess,
  onAddRunsSuccess,
  onMergeSuccess
}: UseCollectionActionsOptions) {
  const editFetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const addRunsFetcher = useFetcher();
  const mergeFetcher = useFetcher();
  const eligibleRunsFetcher = useFetcher();
  const mergeableCollectionsFetcher = useFetcher();

  const actionUrl = `/projects/${projectId}/collections`;
  const detailActionUrl = collectionId ? `/projects/${projectId}/collections/${collectionId}` : actionUrl;

  useEffect(() => {
    if (editFetcher.state === 'idle' && editFetcher.data) {
      toast.success('Collection updated');
      addDialog(null);
      onEditSuccess?.();
    }
  }, [editFetcher.state, editFetcher.data]);

  useEffect(() => {
    if (deleteFetcher.state === 'idle' && deleteFetcher.data) {
      if (deleteFetcher.data.intent === 'DELETE_COLLECTION') {
        toast.success('Collection deleted');
        addDialog(null);
        onDeleteSuccess?.();
      }
    }
  }, [deleteFetcher.state, deleteFetcher.data]);

  useEffect(() => {
    if (addRunsFetcher.state === 'idle' && addRunsFetcher.data) {
      if (addRunsFetcher.data.intent === 'ADD_RUNS_TO_COLLECTION') {
        const { added, skipped, errors } = addRunsFetcher.data;
        if (added.length > 0) {
          toast.success(`Added ${added.length} run${added.length !== 1 ? 's' : ''} to collection`);
        }
        if (skipped.length > 0) {
          toast.info(`${skipped.length} run${skipped.length !== 1 ? 's' : ''} already in collection`);
        }
        if (errors.length > 0) {
          toast.error(`${errors.length} run${errors.length !== 1 ? 's' : ''} could not be added`);
        }
        addDialog(null);
        onAddRunsSuccess?.();
      }
    }
  }, [addRunsFetcher.state, addRunsFetcher.data]);

  useEffect(() => {
    if (mergeFetcher.state === 'idle' && mergeFetcher.data) {
      if (mergeFetcher.data.intent === 'MERGE_COLLECTIONS') {
        const { added, skipped } = mergeFetcher.data;
        toast.success(`Merged ${added.length} run${added.length !== 1 ? 's' : ''} from collection`);
        if (skipped.length > 0) {
          toast.info(`${skipped.length} run${skipped.length !== 1 ? 's' : ''} already existed`);
        }
        addDialog(null);
        onMergeSuccess?.();
      }
    }
  }, [mergeFetcher.state, mergeFetcher.data]);

  useEffect(() => {
    if (eligibleRunsFetcher.state === 'idle' && eligibleRunsFetcher.data) {
      if (eligibleRunsFetcher.data.intent === 'GET_ELIGIBLE_RUNS') {
        addDialog(<AddRunsDialog
          eligibleRuns={eligibleRunsFetcher.data.eligibleRuns}
          onAddRunsClicked={submitAddRuns}
        />);
      }
    }
  }, [eligibleRunsFetcher.state, eligibleRunsFetcher.data]);

  useEffect(() => {
    if (mergeableCollectionsFetcher.state === 'idle' && mergeableCollectionsFetcher.data) {
      if (mergeableCollectionsFetcher.data.intent === 'GET_MERGEABLE_COLLECTIONS') {
        addDialog(<MergeCollectionsDialog
          mergeableCollections={mergeableCollectionsFetcher.data.mergeableCollections}
          onMergeCollectionsClicked={submitMergeCollections}
        />);
      }
    }
  }, [mergeableCollectionsFetcher.state, mergeableCollectionsFetcher.data]);

  const submitEditCollection = (collection: Collection) => {
    editFetcher.submit(
      JSON.stringify({ intent: 'UPDATE_COLLECTION', entityId: collection._id, payload: { name: collection.name } }),
      { method: 'PUT', encType: 'application/json', action: actionUrl }
    );
  };

  const submitDeleteCollection = (collectionId: string) => {
    deleteFetcher.submit(
      JSON.stringify({ intent: 'DELETE_COLLECTION', entityId: collectionId }),
      { method: 'DELETE', encType: 'application/json', action: actionUrl }
    );
  };

  const submitAddRuns = (runIds: string[]) => {
    addRunsFetcher.submit(
      JSON.stringify({ intent: 'ADD_RUNS_TO_COLLECTION', payload: { runIds } }),
      { method: 'POST', encType: 'application/json', action: detailActionUrl }
    );
  };

  const submitMergeCollections = (sourceCollectionIds: string[]) => {
    mergeFetcher.submit(
      JSON.stringify({ intent: 'MERGE_COLLECTIONS', payload: { sourceCollectionIds } }),
      { method: 'POST', encType: 'application/json', action: detailActionUrl }
    );
  };

  const openEditCollectionDialog = (collection: Collection) => {
    addDialog(<EditCollectionDialog
      collection={collection}
      onEditCollectionClicked={submitEditCollection}
    />);
  };

  const openDeleteCollectionDialog = (collection: Collection) => {
    addDialog(<DeleteCollectionDialog
      collection={collection}
      onDeleteCollectionClicked={submitDeleteCollection}
    />);
  };

  const openAddRunsDialog = () => {
    eligibleRunsFetcher.submit(
      JSON.stringify({ intent: 'GET_ELIGIBLE_RUNS' }),
      { method: 'POST', encType: 'application/json', action: detailActionUrl }
    );
  };

  const openMergeCollectionsDialog = () => {
    mergeableCollectionsFetcher.submit(
      JSON.stringify({ intent: 'GET_MERGEABLE_COLLECTIONS' }),
      { method: 'POST', encType: 'application/json', action: detailActionUrl }
    );
  };

  return {
    openEditCollectionDialog,
    openDeleteCollectionDialog,
    openAddRunsDialog,
    openMergeCollectionsDialog,
    isEditing: editFetcher.state !== 'idle',
    isDeleting: deleteFetcher.state !== 'idle',
    isAddingRuns: addRunsFetcher.state !== 'idle',
    isMerging: mergeFetcher.state !== 'idle',
    isLoadingEligibleRuns: eligibleRunsFetcher.state !== 'idle',
    isLoadingMergeableCollections: mergeableCollectionsFetcher.state !== 'idle'
  };
}
