import { useEffect } from 'react';
import { useFetcher } from 'react-router';
import { toast } from 'sonner';
import type { Collection } from '~/modules/collections/collections.types';
import DeleteCollectionDialog from '~/modules/collections/components/deleteCollectionDialog';
import EditCollectionDialog from '~/modules/collections/components/editCollectionDialog';
import addDialog from '~/modules/dialogs/addDialog';

interface UseCollectionActionsOptions {
  projectId: string;
  onEditSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function useCollectionActions({
  projectId,
  onEditSuccess,
  onDeleteSuccess
}: UseCollectionActionsOptions) {
  const editFetcher = useFetcher();
  const deleteFetcher = useFetcher();

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

  return {
    openEditCollectionDialog,
    openDeleteCollectionDialog,
    isEditing: editFetcher.state !== 'idle',
    isDeleting: deleteFetcher.state !== 'idle'
  };
}
