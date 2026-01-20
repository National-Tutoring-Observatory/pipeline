import { useEffect } from 'react';
import { useFetcher, useNavigate } from 'react-router';
import { toast } from 'sonner';
import type { Collection } from '~/modules/collections/collections.types';
import DeleteCollectionDialog from '~/modules/collections/components/deleteCollectionDialog';
import DuplicateCollectionDialog from '~/modules/collections/components/duplicateCollectionDialog';
import EditCollectionDialog from '~/modules/collections/components/editCollectionDialog';
import addDialog from '~/modules/dialogs/addDialog';

interface UseCollectionActionsOptions {
  projectId: string;
  onEditSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onDuplicateSuccess?: (collection: Collection) => void;
}

export function useCollectionActions({
  projectId,
  onEditSuccess,
  onDeleteSuccess,
  onDuplicateSuccess
}: UseCollectionActionsOptions) {
  const navigate = useNavigate();
  const editFetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const duplicateFetcher = useFetcher();

  const actionUrl = `/projects/${projectId}/collections`;

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
    if (duplicateFetcher.state === 'idle' && duplicateFetcher.data) {
      if (duplicateFetcher.data.intent === 'DUPLICATE_COLLECTION') {
        const newCollection = duplicateFetcher.data as Collection;
        toast.success('Collection duplicated');
        addDialog(null);
        if (onDuplicateSuccess) {
          onDuplicateSuccess(newCollection);
        } else {
          navigate(`/projects/${projectId}/collections/${newCollection._id}`);
        }
      }
    }
  }, [duplicateFetcher.state, duplicateFetcher.data, navigate, projectId]);

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

  const submitDuplicateCollection = ({ name, collectionId }: { name: string; collectionId: string }) => {
    duplicateFetcher.submit(
      JSON.stringify({ intent: 'DUPLICATE_COLLECTION', entityId: collectionId, payload: { name } }),
      { method: 'POST', encType: 'application/json', action: actionUrl }
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

  const openDuplicateCollectionDialog = (collection: Collection) => {
    addDialog(<DuplicateCollectionDialog
      collection={collection}
      onDuplicateNewCollectionClicked={submitDuplicateCollection}
    />);
  };

  return {
    openEditCollectionDialog,
    openDeleteCollectionDialog,
    openDuplicateCollectionDialog,
    isEditing: editFetcher.state !== 'idle',
    isDeleting: deleteFetcher.state !== 'idle',
    isDuplicating: duplicateFetcher.state !== 'idle'
  };
}
